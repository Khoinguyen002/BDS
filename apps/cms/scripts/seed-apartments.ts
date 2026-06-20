/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPayload } from "payload";
import configPromise from "../src/payload.config";

// Lexical richText 1 đoạn văn.
const rich = (text: string) => ({
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        version: 1,
        children: [{ type: "text", version: 1, text }],
      },
    ],
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
  },
});

export async function seedApartments() {
  const payload = await getPayload({ config: configPromise });

  // 1. Owner
  const { docs: users } = await payload.find({ collection: "users", limit: 1 });
  const ownerId = users[0]?.id;
  if (!ownerId) {
    console.error("No users found. Please create a user first.");
    process.exit(1);
  }

  // 2. Amenities
  const amenitiesData = [
    { title: "Hồ bơi", icon: "SwimmingPool", category: "internal" as const },
    { title: "Phòng Gym", icon: "Barbell", category: "internal" as const },
    { title: "Bảo vệ 24/7", icon: "ShieldCheck", category: "internal" as const },
    { title: "Bãi đậu xe", icon: "Car", category: "internal" as const },
    { title: "Siêu thị", icon: "ShoppingCart", category: "external" as const },
    { title: "Công viên", icon: "Tree", category: "external" as const },
    { title: "Bệnh viện", icon: "FirstAid", category: "external" as const },
    { title: "Trường học", icon: "Student", category: "external" as const },
  ];

  const amenityIds: Record<string, number> = {};
  for (const am of amenitiesData) {
    const existing = await payload.find({
      collection: "amenities",
      where: { title: { equals: am.title } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      amenityIds[am.title] = existing.docs[0].id;
    } else {
      const newAm = await payload.create({
        collection: "amenities",
        data: { title: am.title, icon: am.icon, category: am.category },
        locale: "vi",
      });
      amenityIds[am.title] = newAm.id;
    }
  }

  // 3. Tags (thay propertyType cũ)
  const tagsData = [
    { slug: "can-ho", title: "Căn hộ" },
    { slug: "penthouse", title: "Penthouse" },
    { slug: "view-song", title: "View sông" },
  ];
  const tagIds: Record<string, number> = {};
  for (const tg of tagsData) {
    const existing = await payload.find({
      collection: "tags",
      where: { slug: { equals: tg.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      tagIds[tg.slug] = existing.docs[0].id;
    } else {
      const created = await payload.create({
        collection: "tags",
        data: { title: tg.title, slug: tg.slug },
        locale: "vi",
      });
      tagIds[tg.slug] = created.id;
    }
  }

  // 4. Apartments
  const apartments = [
    {
      listingType: "sale" as const,
      tags: [tagIds["can-ho"], tagIds["view-song"]],
      title: "Căn hộ 3PN View Sông Cao Cấp tại Quận 2",
      address: "Thảo Điền, Quận 2, TP.HCM",
      owner: ownerId,
      price: 12500000000,
      keyFacts: { area: 120, bedrooms: 3, bathrooms: 2 },
      location: { amenities: [amenityIds["Hồ bơi"], amenityIds["Phòng Gym"], amenityIds["Bảo vệ 24/7"], amenityIds["Siêu thị"]] },
      sections: [
        {
          title: "Tổng quan",
          body: rich(
            "Căn hộ 3 phòng ngủ sang trọng với tầm nhìn toàn cảnh sông Sài Gòn. Thiết kế hiện đại, nội thất cao cấp nhập khẩu 100% từ châu Âu.",
          ),
        },
        {
          title: "Pháp lý",
          body: rich("Sổ hồng lâu dài, sang tên nhanh chóng. Hỗ trợ vay ngân hàng tới 70%."),
        },
      ],
    },
    {
      listingType: "sale" as const,
      tags: [tagIds["can-ho"]],
      title: "Căn góc 2PN Vinhomes Central Park",
      address: "Bình Thạnh, TP.HCM",
      owner: ownerId,
      price: 6800000000,
      keyFacts: { area: 85, bedrooms: 2, bathrooms: 2 },
      location: { amenities: [amenityIds["Công viên"], amenityIds["Bệnh viện"], amenityIds["Bảo vệ 24/7"], amenityIds["Trường học"]] },
      sections: [
        {
          title: "Tổng quan",
          body: rich(
            "Căn góc 2 phòng ngủ tòa Landmark, view trực diện công viên và Landmark 81. Nhà mới làm lại nội thất phong cách Minimalist.",
          ),
        },
      ],
    },
    {
      listingType: "rent" as const,
      tags: [tagIds["penthouse"], tagIds["can-ho"], tagIds["view-song"]],
      title: "Penthouse The River Thủ Thiêm",
      address: "Khu đô thị mới Thủ Thiêm, TP.HCM",
      owner: ownerId,
      price: 150000000,
      keyFacts: { area: 250, bedrooms: 4, bathrooms: 4 },
      location: { amenities: [amenityIds["Hồ bơi"], amenityIds["Bãi đậu xe"], amenityIds["Bảo vệ 24/7"], amenityIds["Công viên"], amenityIds["Siêu thị"]] },
      sections: [
        {
          title: "Tổng quan",
          body: rich(
            "Tuyệt tác Penthouse The River Thủ Thiêm với hồ bơi riêng, sân vườn siêu rộng và view toàn cảnh trung tâm Q1 không bị che khuất.",
          ),
        },
        {
          title: "Điều khoản thuê",
          body: rich("Đặt cọc 2 tháng, thuê tối thiểu 12 tháng. Đã bao gồm phí quản lý. Nhận nhà từ 01/07/2024."),
        },
      ],
    },
  ];

  let added = 0;
  for (const apt of apartments) {
    try {
      const existing = await payload.find({
        collection: "apartments",
        where: { title: { equals: apt.title } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        await payload.update({ collection: "apartments", id: existing.docs[0].id, data: apt as any, locale: "vi" });
      } else {
        await payload.create({ collection: "apartments", data: apt as any, locale: "vi" });
      }
      added++;
    } catch (error) {
      console.error("Error creating/updating apartment:", (error as Error).message);
    }
  }

  console.log(`Successfully seeded ${added} apartments.`);
}

seedApartments()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
