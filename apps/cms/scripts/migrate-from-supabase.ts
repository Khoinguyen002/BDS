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

const TYPE_MAP: Record<string, "apartment" | "land_house"> = {
  villa: "land_house",
  biet_thu: "land_house",
  chung_cu: "apartment",
  can_ho_dich_vu: "apartment",
  penthouse: "apartment",
};
const SALE_STATUS = new Set(["selling", "sold"]);
const CITY_LABEL: Record<string, string> = {
  ha_noi: "Hà Nội",
  ho_chi_minh: "TP. Hồ Chí Minh",
};
const FAR_FUTURE = "2099-01-01T00:00:00.000Z";

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
async function importImage(payload: Payload, im: PropertyImage, owner: number): Promise<number | null> {
  const base = im.storage_path.split("/").pop() ?? `img-${im.order_index}`;
  const existing = await payload.find({
    collection: "media",
    where: { filename: { like: base } },
    limit: 1,
    depth: 0,
  });
  if (existing.docs.length) return existing.docs[0].id as number;

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
  return doc.id as number;
}

async function migrateOne(payload: Payload, p: Property, imgs: PropertyImage[], owner: number) {
  const listingType = SALE_STATUS.has(p.status) ? "sale" : "rent";
  const propertyType = TYPE_MAP[p.type] ?? "apartment";
  const address = [p.address, p.district, CITY_LABEL[p.city] ?? p.city].filter(Boolean).join(", ");
  const title = p.name?.trim() || `Property ${p.id}`;
  const overview = textToLexical(p.description);

  const galleryIds: number[] = [];
  for (const im of imgs.sort((a, b) => a.order_index - b.order_index)) {
    const id = await importImage(payload, im, owner);
    if (id) galleryIds.push(id);
  }

  const data: Record<string, unknown> = {
    title,
    propertyType,
    listingType,
    address,
    price: p.price ?? undefined,
    owner,
    keyFacts: {
      area: p.area_sqm ?? undefined,
      bedrooms: p.bedrooms && p.bedrooms > 0 ? p.bedrooms : undefined,
    },
    gallery: galleryIds,
    ...(overview ? { details: { overview } } : {}),
  };

  const existing = await payload.find({
    collection: "apartments",
    where: { title: { equals: title } },
    limit: 1,
    locale: "vi",
  });
  if (existing.docs.length) {
    await payload.update({ collection: "apartments", id: existing.docs[0].id, data: data as never, locale: "vi", overrideAccess: true });
    return { action: "updated" as const, gallery: galleryIds.length };
  }
  await payload.create({ collection: "apartments", data: data as never, locale: "vi", overrideAccess: true });
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
      const propertyType = TYPE_MAP[p.type] ?? "apartment";
      console.log(`- ${p.id} "${p.name?.trim()}" → ${propertyType}/${listingType} price=${p.price} area=${p.area_sqm} bed=${p.bedrooms} imgs=${(imgsByProp.get(p.id) ?? []).length}`);
    }
    console.log(`\n=== DRY-RUN xong (không ghi gì). Chạy lại với --commit để ghi thật. ===`);
    return;
  }

  // Nâng tier owner → pro để qua hook giới hạn; restore ở finally.
  const originalSub = ownerDoc.subscription ?? null;
  await payload.update({
    collection: "users",
    id: owner,
    data: { subscription: { tier: "pro", expiresAt: FAR_FUTURE } },
    overrideAccess: true,
  });
  console.log(`→ Nâng owner ${owner} lên pro (tạm).`);

  let created = 0, updated = 0, media = 0, errors = 0;
  try {
    for (const p of properties) {
      try {
        const r = await migrateOne(payload, p, imgsByProp.get(p.id) ?? [], owner);
        if (r.action === "created") created++;
        else updated++;
        media += r.gallery;
        console.log(`  ✓ ${p.id} "${p.name?.trim()}" [${r.action}, gallery ${r.gallery}]`);
      } catch (e) {
        errors++;
        console.error(`  ✗ ${p.id}: ${(e as Error).message}`);
      }
    }
  } finally {
    await payload.update({
      collection: "users",
      id: owner,
      data: { subscription: originalSub ?? { tier: "free" } },
      overrideAccess: true,
    });
    console.log(`→ Khôi phục tier owner ${owner}.`);
  }

  console.log(`\n=== Done. created=${created} updated=${updated} mediaLinked=${media} errors=${errors} ===`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
