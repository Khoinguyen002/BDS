import { getPayload } from "payload";
import configPromise from "../src/payload.config";

export async function seedLocations() {
  const payload = await getPayload({ config: configPromise });

  // ============================================================
  // 1. THÀNH PHỐ
  // ============================================================
  const tphcm = await upsert(payload, {
    title: "TP. Hồ Chí Minh",
    slug: "tp-ho-chi-minh",
    level: "city" as const,
  });

  const cityId = tphcm.id;

  // ============================================================
  // 2. QUẬN / HUYỆN
  // ============================================================
  const districtData: { title: string; slug: string }[] = [
    { title: "Quận 1", slug: "quan-1" },
    { title: "Quận 3", slug: "quan-3" },
    { title: "Quận 4", slug: "quan-4" },
    { title: "Quận 5", slug: "quan-5" },
    { title: "Quận 6", slug: "quan-6" },
    { title: "Quận 7", slug: "quan-7" },
    { title: "Quận 8", slug: "quan-8" },
    { title: "Quận 10", slug: "quan-10" },
    { title: "Quận 11", slug: "quan-11" },
    { title: "Quận 12", slug: "quan-12" },
    { title: "Bình Thạnh", slug: "binh-thanh" },
    { title: "Gò Vấp", slug: "go-vap" },
    { title: "Phú Nhuận", slug: "phu-nhuan" },
    { title: "Tân Bình", slug: "tan-binh" },
    { title: "Tân Phú", slug: "tan-phu" },
    { title: "Bình Tân", slug: "binh-tan" },
    { title: "TP. Thủ Đức", slug: "tp-thu-duc" },
    { title: "Huyện Bình Chánh", slug: "huyen-binh-chanh" },
    { title: "Huyện Củ Chi", slug: "huyen-cu-chi" },
    { title: "Huyện Hóc Môn", slug: "huyen-hoc-mon" },
    { title: "Huyện Nhà Bè", slug: "huyen-nha-be" },
    { title: "Huyện Cần Giờ", slug: "huyen-can-gio" },
  ];

  const districtIds: Record<string, number> = {};
  for (const d of districtData) {
    const doc = await upsert(payload, { ...d, level: "district" as const, parent: cityId });
    districtIds[d.slug] = doc.id;
  }

  // ============================================================
  // 3. PHƯỜNG / XÃ (full TP.HCM)
  // ============================================================
  const wardsByDistrict: Record<string, string[]> = {
    "quan-1": [
      "Bến Nghé", "Bến Thành", "Cầu Kho", "Cầu Ông Lãnh", "Cô Giang",
      "Đa Kao", "Nguyễn Cư Trinh", "Nguyễn Thái Bình", "Phạm Ngũ Lão", "Tân Định",
    ],
    "quan-3": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
      "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
      "Phường 11", "Phường 12", "Phường 13", "Phường 14",
    ],
    "quan-4": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6",
      "Phường 8", "Phường 9", "Phường 10", "Phường 13", "Phường 14",
      "Phường 15", "Phường 16", "Phường 18",
    ],
    "quan-5": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
      "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
      "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15",
    ],
    "quan-6": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
      "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
      "Phường 11", "Phường 12", "Phường 13", "Phường 14",
    ],
    "quan-7": [
      "Bình Thuận", "Phú Mỹ", "Phú Thuận", "Tân Hưng", "Tân Kiểng",
      "Tân Phong", "Tân Phú", "Tân Quy",
    ],
    "quan-8": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
      "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
      "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16",
    ],
    "quan-10": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
      "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
      "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15",
    ],
    "quan-11": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
      "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
      "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16",
    ],
    "quan-12": [
      "An Phú Đông", "Đông Hưng Thuận", "Hiệp Thành", "Tân Chánh Hiệp",
      "Tân Hưng Thuận", "Tân Thới Hiệp", "Tân Thới Nhất", "Thạnh Lộc",
      "Thạnh Xuân", "Thới An", "Trung Mỹ Tây",
    ],
    "binh-thanh": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6",
      "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14",
      "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22",
      "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28",
    ],
    "go-vap": [
      "Phường 1", "Phường 3", "Phường 4", "Phường 5", "Phường 6",
      "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11",
      "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17",
    ],
    "phu-nhuan": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
      "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11",
      "Phường 13", "Phường 14", "Phường 15", "Phường 17",
    ],
    "tan-binh": [
      "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
      "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
      "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15",
    ],
    "tan-phu": [
      "Hiệp Tân", "Hòa Thạnh", "Phú Thạnh", "Phú Thọ Hòa", "Phú Trung",
      "Sơn Kỳ", "Tân Quý", "Tân Sơn Nhì", "Tân Thành", "Tân Thới Hòa", "Tây Thạnh",
    ],
    "binh-tan": [
      "An Lạc", "An Lạc A", "Bình Hưng Hòa", "Bình Hưng Hòa A", "Bình Hưng Hòa B",
      "Bình Trị Đông", "Bình Trị Đông A", "Bình Trị Đông B", "Tân Tạo", "Tân Tạo A",
    ],
    "tp-thu-duc": [
      "An Khánh", "An Lợi Đông", "An Phú", "Bình Chiểu", "Bình Thọ",
      "Bình Trưng Đông", "Bình Trưng Tây", "Cát Lái", "Hiệp Bình Chánh",
      "Hiệp Bình Phước", "Hiệp Phú", "Linh Chiểu", "Linh Đông", "Linh Tây",
      "Linh Trung", "Linh Xuân", "Long Bình", "Long Phước", "Long Thạnh Mỹ",
      "Long Trường", "Phú Hữu", "Phước Bình", "Phước Long A", "Phước Long B",
      "Tam Bình", "Tam Phú", "Tăng Nhơn Phú A", "Tăng Nhơn Phú B", "Tân Phú", "Trường Thạnh",
    ],
    "huyen-binh-chanh": [
      "An Phú Tây", "Bình Chánh", "Bình Hưng", "Bình Lợi", "Đa Phước",
      "Hưng Long", "Lê Minh Xuân", "Phạm Văn Hai", "Phong Phú", "Quy Đức",
      "Tân Kiên", "Tân Nhựt", "Tân Quý Tây", "Tân Túc", "Vĩnh Lộc A", "Vĩnh Lộc B",
    ],
    "huyen-cu-chi": [
      "An Nhơn Tây", "An Phú", "Bình Mỹ", "Củ Chi", "Hòa Phú", "Nhuận Đức",
      "Phạm Văn Cội", "Phú Hòa Đông", "Phú Mỹ Hưng", "Phước Hiệp", "Phước Thạnh",
      "Phước Vĩnh An", "Tân An Hội", "Tân Phú Trung", "Tân Thạnh Đông",
      "Tân Thạnh Tây", "Tân Thông Hội", "Thái Mỹ", "Trung An", "Trung Lập Hạ", "Trung Lập Thượng",
    ],
    "huyen-hoc-mon": [
      "Bà Điểm", "Đông Thạnh", "Nhị Bình", "Tân Hiệp", "Tân Thới Nhì",
      "Tân Xuân", "Thới Tam Thôn", "Trung Chánh", "Xuân Thới Đông",
      "Xuân Thới Sơn", "Xuân Thới Thượng",
    ],
    "huyen-nha-be": [
      "Hiệp Phước", "Long Thới", "Nhà Bè", "Phú Xuân", "Phước Kiển", "Phước Lộc",
    ],
    "huyen-can-gio": [
      "An Thới Đông", "Bình Khánh", "Cần Thạnh", "Long Hòa", "Lý Nhơn",
      "Tam Thôn Hiệp", "Thạnh An",
    ],
  };

  let wardCount = 0;
  for (const [districtSlug, wards] of Object.entries(wardsByDistrict)) {
    const parentId = districtIds[districtSlug];
    if (!parentId) continue;
    for (const wardName of wards) {
      const wardSlug = `${districtSlug}-${toSlug(wardName)}`;
      await upsert(payload, {
        title: wardName,
        slug: wardSlug,
        level: "ward" as const,
        parent: parentId,
      });
      wardCount++;
    }
  }

  console.log(`✅ Seeded: 1 city, ${districtData.length} districts, ${wardCount} wards.`);
}

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function upsert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  data: { title: string; slug: string; level: "city" | "district" | "ward"; parent?: number }
) {
  const existing = await payload.find({
    collection: "locations",
    where: { slug: { equals: data.slug } },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    return existing.docs[0];
  }
  return payload.create({
    collection: "locations",
    data: { title: data.title, slug: data.slug, level: data.level, parent: data.parent },
    locale: "vi",
  });
}

seedLocations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
