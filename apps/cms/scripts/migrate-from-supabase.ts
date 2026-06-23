/**
 * Migrate dữ liệu app cũ (Supabase) → Payload. RE-RUNNABLE (idempotent).
 *
 * - Đọc `properties` + `property_images` qua Supabase REST (publishable key, RLS public-read).
 *   KHÔNG cần Postgres connection string.
 * - Ảnh: tải bytes từ Cloudinary cũ rồi re-upload qua Payload Media (adapter Cloudinary).
 *   Idempotent: nếu đã có Media trùng cloudinary-id thì tái dùng, không upload lại.
 * - properties → apartments dưới 1 owner (user đầu tiên), upsert theo title.
 * - Tự nâng tier owner → pro trong lúc chạy (qua hook giới hạn), restore lại sau (finally).
 *
 * Chạy (đọc env từ .env → trỏ DB/Cloudinary/Supabase theo môi trường đó):
 *   pnpm migrate:supabase            # DRY-RUN (chỉ in mapping)
 *   pnpm migrate:supabase --commit   # GHI thật
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_ANON_KEY ?? "";
const COMMIT = process.argv.includes("--commit");
// Bỏ qua hoàn toàn phần ảnh (sync nhanh chỉ data: giá/mô tả/tags). Update giữ
// nguyên gallery hiện có; create sẽ không có ảnh.
const SKIP_IMAGES = process.argv.includes("--skip-images");
const IMG_CONCURRENCY = 8;

type MediaLite = { id: number; filename: string };

// Chạy fn cho từng item với tối đa `limit` tác vụ song song; giữ thứ tự kết quả.
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const ret = new Array<R>(items.length);
  let idx = 0;
  const worker = async () => {
    while (idx < items.length) {
      const cur = idx++;
      ret[cur] = await fn(items[cur], cur);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return ret;
}

type Property = {
  id: string;
  name: string;
  type: string;
  city: string;
  district: string;
  address: string | null;
  price: number | null;
  area_sqm: number | null;
  bedrooms: number | null;
  description: string | null;
  status: string;
};
type PropertyImage = {
  property_id: string;
  url: string;
  storage_path: string;
  order_index: number;
};

// `propertyType` cũ (Payload đã bỏ field này) → tạo/ghép Tag tương ứng.
const TYPE_TAG: Record<string, string> = {
  villa: "Villa",
  biet_thu: "Biệt thự",
  chung_cu: "Chung cư",
  can_ho_dich_vu: "Căn hộ dịch vụ",
  penthouse: "Penthouse",
};
const SALE_STATUS = new Set(["selling", "sold"]);
const CITY_LABEL: Record<string, string> = {
  ha_noi: "Hà Nội",
  ho_chi_minh: "TP. Hồ Chí Minh",
};

async function sb<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase GET ${path} -> ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

function textToLexical(text?: string | null) {
  const paras = (text ?? "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!paras.length) return undefined;
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: paras.map((p) => ({
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: [
          { type: "text", text: p, format: 0, style: "", mode: "normal", detail: 0, version: 1 },
        ],
      })),
    },
  };
}

type Payload = Awaited<ReturnType<typeof getPayload>>;

// Idempotent: cloudinary-id (base của storage_path) là unique toàn cục → tìm Media đã có theo nó.
// Dedup in-memory qua `mediaIndex` (preload 1 lần) thay vì query mỗi ảnh.
async function importImage(
  payload: Payload,
  im: PropertyImage,
  owner: number,
  mediaIndex: MediaLite[],
): Promise<number | null> {
  const base = im.storage_path.split("/").pop() ?? `img-${im.order_index}`;
  const hit = mediaIndex.find((m) => m.filename.includes(base));
  if (hit) return hit.id;

  const res = await fetch(im.url);
  if (!res.ok) {
    console.error(`    ! tải ảnh ${im.url} -> ${res.status}`);
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const doc = await payload.create({
    collection: "media",
    file: { data: buf, mimetype: "image/jpeg", name: `${im.property_id}-${base}.jpg`, size: buf.length },
    data: { owner } as never,
    overrideAccess: true,
  });
  mediaIndex.push({ id: doc.id as number, filename: (doc as { filename?: string }).filename ?? `${im.property_id}-${base}.jpg` });
  return doc.id as number;
}

// Upsert Tag theo title (vi). Cache trong process để khỏi query lặp.
const tagCache = new Map<string, number>();
async function getOrCreateTag(payload: Payload, label: string): Promise<number> {
  const cached = tagCache.get(label);
  if (cached) return cached;
  const existing = await payload.find({
    collection: "tags",
    where: { title: { equals: label } },
    limit: 1,
    locale: "vi",
  });
  const id = (existing.docs.length
    ? existing.docs[0].id
    : (await payload.create({ collection: "tags", data: { title: label } as never, locale: "vi", overrideAccess: true })).id) as number;
  tagCache.set(label, id);
  return id;
}

async function migrateOne(
  payload: Payload,
  p: Property,
  imgs: PropertyImage[],
  owner: number,
  mediaIndex: MediaLite[],
  apartmentIndex: Map<string, number>,
) {
  const listingType = SALE_STATUS.has(p.status) ? "sale" : "rent";
  const address = [p.address, p.district, CITY_LABEL[p.city] ?? p.city].filter(Boolean).join(", ");
  const title = p.name?.trim() || `Property ${p.id}`;
  const overview = textToLexical(p.description);

  // type cũ → Tag (relationship). Bỏ propertyType.
  const tagLabel = TYPE_TAG[p.type] ?? "Khác";
  const tagId = await getOrCreateTag(payload, tagLabel);

  let galleryIds: number[] = [];
  if (!SKIP_IMAGES) {
    const sorted = [...imgs].sort((a, b) => a.order_index - b.order_index);
    const ids = await mapPool(sorted, IMG_CONCURRENCY, (im) => importImage(payload, im, owner, mediaIndex));
    galleryIds = ids.filter((x): x is number => typeof x === "number");
  }

  const data: Record<string, unknown> = {
    title,
    listingType,
    tags: [tagId],
    address,
    price: p.price ?? undefined,
    owner,
    keyFacts: {
      area: p.area_sqm ?? undefined,
      bedrooms: p.bedrooms && p.bedrooms > 0 ? p.bedrooms : undefined,
    },
    // description cũ → 1 section {title, body}. `details.overview` đã bị bỏ.
    ...(overview ? { sections: [{ title: "Mô tả", body: overview }] } : {}),
    // --skip-images: bỏ gallery/thumbnail → update giữ nguyên ảnh hiện có.
    ...(SKIP_IMAGES
      ? {}
      : { gallery: galleryIds, thumbnail: galleryIds.length > 0 ? galleryIds[0] : undefined }),
  };

  const existingId = apartmentIndex.get(title);
  if (existingId) {
    await payload.update({ collection: "apartments", id: existingId, data: data as never, locale: "vi", overrideAccess: true });
    return { action: "updated" as const, gallery: galleryIds.length };
  }
  const doc = await payload.create({ collection: "apartments", data: data as never, locale: "vi", overrideAccess: true });
  apartmentIndex.set(title, doc.id as number);
  return { action: "created" as const, gallery: galleryIds.length };
}

async function main() {
  if (!SUPABASE_URL || !KEY) throw new Error("Thiếu SUPABASE_URL / SUPABASE_ANON_KEY trong .env");

  const payload = await getPayload({ config });

  const users = await payload.find({ collection: "users", limit: 1, sort: "createdAt" });
  const ownerDoc = users.docs[0];
  if (!ownerDoc) throw new Error("Cần ít nhất 1 user trong Payload làm owner");
  const owner = ownerDoc.id as number;

  const properties = await sb<Property[]>("properties?select=*&order=created_at.asc&limit=1000");
  const images = await sb<PropertyImage[]>("property_images?select=*&order=order_index.asc&limit=5000");
  const imgsByProp = new Map<string, PropertyImage[]>();
  for (const im of images) {
    const arr = imgsByProp.get(im.property_id) ?? [];
    arr.push(im);
    imgsByProp.set(im.property_id, arr);
  }

  console.log(`\n=== ${COMMIT ? "COMMIT" : "DRY-RUN"} | properties=${properties.length} images=${images.length} owner=${owner} ===\n`);

  if (!COMMIT) {
    for (const p of properties) {
      const listingType = SALE_STATUS.has(p.status) ? "sale" : "rent";
      const tagLabel = TYPE_TAG[p.type] ?? "Khác";
      console.log(`- ${p.id} "${p.name?.trim()}" → tag:${tagLabel}/${listingType} price=${p.price} area=${p.area_sqm} bed=${p.bedrooms} imgs=${(imgsByProp.get(p.id) ?? []).length}`);
    }
    console.log(`\n=== DRY-RUN xong (không ghi gì). Chạy lại với --commit để ghi thật. ===`);
    return;
  }

  // Nâng role owner → admin để qua hook giới hạn; restore ở finally.
  const originalRole = ownerDoc.role;
  await payload.update({
    collection: "users",
    id: owner,
    data: { role: "admin" },
    overrideAccess: true,
  });
  console.log(`→ Nâng owner ${owner} lên admin (tạm).`);

  // Preload 1 lần để khỏi query lặp: media (dedup ảnh) + apartments (upsert theo title).
  const mediaDocs = await payload.find({ collection: "media", limit: 20000, depth: 0 });
  const mediaIndex: MediaLite[] = mediaDocs.docs.map((d) => ({
    id: d.id as number,
    filename: (d as { filename?: string }).filename ?? "",
  }));
  const aptDocs = await payload.find({ collection: "apartments", limit: 5000, depth: 0, locale: "vi" });
  const apartmentIndex = new Map<string, number>();
  for (const a of aptDocs.docs) {
    const t = (a as { title?: string }).title;
    if (t) apartmentIndex.set(t, a.id as number);
  }
  console.log(`→ Preload: media=${mediaIndex.length} apartments=${apartmentIndex.size}${SKIP_IMAGES ? " (SKIP_IMAGES)" : ""}.`);

  let created = 0, updated = 0, media = 0, errors = 0;
  try {
    for (const p of properties) {
      try {
        const r = await migrateOne(payload, p, imgsByProp.get(p.id) ?? [], owner, mediaIndex, apartmentIndex);
        if (r.action === "created") created++;
        else updated++;
        media += r.gallery;
        console.log(`  ✓ ${p.id} "${p.name?.trim()}" [${r.action}${SKIP_IMAGES ? ", data-only (giữ ảnh cũ)" : `, gallery ${r.gallery}`}]`);
      } catch (e) {
        errors++;
        console.error(`  ✗ ${p.id}: ${(e as Error).message}`);
      }
    }
  } finally {
    await payload.update({
      collection: "users",
      id: owner,
      data: { role: originalRole ?? "agent" },
      overrideAccess: true,
    });
    console.log(`→ Khôi phục role owner ${owner}.`);
  }

  console.log(`\n=== Done. created=${created} updated=${updated} mediaLinked=${media} errors=${errors} ===`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
