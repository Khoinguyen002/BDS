import { getPayload } from "payload";
import configPromise from "../src/payload.config";

export async function seedApartments() {
  const payload = await getPayload({ config: configPromise });

  // 1. Get or create an admin user to be the owner
  const { docs: users } = await payload.find({
    collection: "users",
    limit: 1,
  });

  const ownerId = users[0]?.id;
  if (!ownerId) {
    console.error("No users found. Please create a user first.");
    process.exit(1);
  }

  // 1.5. Define and seed amenities
  const amenitiesData = [
    { title: "Hồ bơi", icon: "SwimmingPool", category: "internal" as const },
    { title: "Phòng Gym", icon: "Barbell", category: "internal" as const },
    {
      title: "Bảo vệ 24/7",
      icon: "ShieldCheck",
      category: "internal" as const,
    },
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
        data: {
          title: am.title,
          icon: am.icon,
          category: am.category,
        },
        locale: "vi",
      });
      // also set en if needed, but for now vi is fine or set English translations
      amenityIds[am.title] = newAm.id;
    }
  }

  // 2. Define the sample apartments
  const apartments = [
    {
      listingType: "sale" as const,
      propertyType: "apartment" as const,
      title: "Căn hộ 3PN View Sông Cao Cấp tại Quận 2",
      address: "Thảo Điền, Quận 2, TP.HCM",
      owner: ownerId,
      price: 12500000000,
      details: {
        overview: {
          root: {
            type: "root",
            children: [
              {
                type: "paragraph",
                version: 1,
                children: [
                  {
                    type: "text",
                    version: 1,
                    text: "Căn hộ 3 phòng ngủ sang trọng với tầm nhìn toàn cảnh sông Sài Gòn. Thiết kế hiện đại, nội thất cao cấp nhập khẩu 100% từ châu Âu.",
                  },
                ],
              },
            ],
            direction: "ltr" as const,
            format: "" as const,
            indent: 0,
            version: 1,
          },
        },
      },
      keyFacts: {
        direction: "se" as const,
        balconyDirection: "se" as const,
        floorLevel: "high" as const,
        area: 120,
        bedrooms: 3,
        bathrooms: 2,
        handoverYear: 2024,
        buildingQuality: "new" as const,
      },
      priceBreakdown: {
        pricePerSqm: 104166666,
        transferFee: "2% giá trị HĐ",
        taxResponsibility: "seller" as const,
        managementFee: 2500000,
        negotiable: true,
      },
      legal: {
        documentType: "pink_book" as const,
        ownershipTerm: "long_term" as const,
        bankMortgaged: false,
        bankSupportPercentage: 70,
      },
      location: {
        lat: 10.8035,
        lng: 106.7381,
      },
      amenities: [
        amenityIds["Hồ bơi"],
        amenityIds["Phòng Gym"],
        amenityIds["Bảo vệ 24/7"],
        amenityIds["Siêu thị"],
      ],
      investment: {
        rentalYield: 5.5,
      },
    },
    {
      listingType: "sale" as const,
      propertyType: "apartment" as const,
      title: "Căn góc 2PN Vinhomes Central Park",
      address: "Bình Thạnh, TP.HCM",
      owner: ownerId,
      price: 6800000000,
      details: {
        overview: {
          root: {
            type: "root",
            children: [
              {
                type: "paragraph",
                version: 1,
                children: [
                  {
                    type: "text",
                    version: 1,
                    text: "Căn góc 2 phòng ngủ tòa Landmark, view trực diện công viên và Landmark 81. Nhà mới làm lại nội thất phong cách Minimalist.",
                  },
                ],
              },
            ],
            direction: "ltr" as const,
            format: "" as const,
            indent: 0,
            version: 1,
          },
        },
      },
      keyFacts: {
        direction: "nw" as const,
        balconyDirection: "sw" as const,
        floorLevel: "mid" as const,
        area: 85,
        bedrooms: 2,
        bathrooms: 2,
        handoverYear: 2018,
        buildingQuality: "renovated" as const,
      },
      priceBreakdown: {
        pricePerSqm: 80000000,
        transferFee: "Miễn phí công chứng",
        taxResponsibility: "negotiated" as const,
        managementFee: 1500000,
        negotiable: true,
      },
      legal: {
        documentType: "pink_book" as const,
        ownershipTerm: "long_term" as const,
        bankMortgaged: true,
        bankSupportPercentage: 80,
      },
      location: {
        lat: 10.7963,
        lng: 106.7214,
      },
      amenities: [
        amenityIds["Công viên"],
        amenityIds["Bệnh viện"],
        amenityIds["Bảo vệ 24/7"],
        amenityIds["Trường học"],
      ],
      investment: {
        rentalYield: 6.2,
      },
    },
    {
      listingType: "rent" as const,
      propertyType: "apartment" as const,
      title: "Penthouse The River Thủ Thiêm",
      address: "Khu đô thị mới Thủ Thiêm, TP.HCM",
      owner: ownerId,
      price: 150000000,
      rentPricing: {
        deposit: "2_months" as const,
        utilitiesPrice: "state" as const,
        minLeaseTerm: 12,
        availableDate: "2024-07-01T00:00:00.000Z",
        managementFeeIncluded: true,
        negotiable: false,
      },
      details: {
        overview: {
          root: {
            type: "root",
            children: [
              {
                type: "paragraph",
                version: 1,
                children: [
                  {
                    type: "text",
                    version: 1,
                    text: "Tuyệt tác Penthouse The River Thủ Thiêm với hồ bơi riêng, sân vườn siêu rộng và view toàn cảnh trung tâm Q1 không bị che khuất.",
                  },
                ],
              },
            ],
            direction: "ltr" as const,
            format: "" as const,
            indent: 0,
            version: 1,
          },
        },
      },
      keyFacts: {
        direction: "e" as const,
        balconyDirection: "s" as const,
        floorLevel: "high" as const,
        area: 250,
        bedrooms: 4,
        bathrooms: 4,
        furnitureStatus: "full" as const,
        petFriendly: true,
        freeHours: true,
      },
      location: {
        lat: 10.7712,
        lng: 106.7169,
      },
      amenities: [
        amenityIds["Hồ bơi"],
        amenityIds["Bãi đậu xe"],
        amenityIds["Bảo vệ 24/7"],
        amenityIds["Công viên"],
        amenityIds["Siêu thị"],
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
        await payload.update({
          collection: "apartments",
          id: existing.docs[0].id,
          data: apt,
          locale: "vi",
        });
      } else {
        await payload.create({
          collection: "apartments",
          data: apt,
          locale: "vi",
        });
      }
      added++;
    } catch (error) {
      console.error(
        "Error creating/updating apartment:",
        (error as Error).message,
      );
    }
  }

  console.log(`Successfully seeded ${added} apartments.`);
}

seedApartments()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
