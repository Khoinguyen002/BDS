import { getPayload } from "payload";
import configPromise from "../src/payload.config";

export async function seedPlans() {
  const payload = await getPayload({ config: configPromise });

  const plans = [
    {
      name: "Free",
      slug: "free",
      price: 0,
      originalPrice: 62000,
      limits: {
        maxListings: 10,
        maxLeadsPerMonth: 5,
        maxImagesPerListing: 5,
        maxVideosPerListing: 1,
      },
      features: {
        forceWatermark: true,
        enableAdvanceLandingPage: false,
        enableCustomDomain: false,
        enableAutoReply: false,
        customFeatures: [
          { text: "Cloud storage 0.5 GB" },
          { text: "Quản lý nội dung" },
          { text: "Landingpage free trial 7 days" },
          { text: "Email notification ngay khi có lead" },
        ],
      },
    },
    {
      name: "Starter",
      slug: "starter",
      price: 179000,
      originalPrice: 170000,
      limits: {
        maxListings: 100,
        maxLeadsPerMonth: null,
        maxImagesPerListing: 10,
        maxVideosPerListing: 2,
      },
      features: {
        forceWatermark: false,
        enableAdvanceLandingPage: false,
        enableCustomDomain: false,
        enableAutoReply: false,
        customFeatures: [
          { text: "Tất cả tính năng từ gói FREE" },
          { text: "Cloud storage 5 GB" },
          { text: "Lead notes + history" },
          { text: "Landingpage với base component" },
          { text: "Thiết kế page riêng (thương lượng)" },
        ],
      },
    },
    {
      name: "Pro",
      slug: "pro",
      price: 499000,
      originalPrice: 550000,
      limits: {
        maxListings: 300,
        maxLeadsPerMonth: null,
        maxImagesPerListing: 20,
        maxVideosPerListing: 5,
      },
      features: {
        forceWatermark: false,
        enableAdvanceLandingPage: true,
        enableCustomDomain: true,
        enableAutoReply: true,
        customFeatures: [
          { text: "Tất cả tính năng từ gói STARTER" },
          { text: "Cloud storage 50 GB" },
        ],
      },
    },
    {
      name: "Custom",
      slug: "custom",
      price: 0, // Custom plan is negotiable
      originalPrice: null,
      limits: {
        maxListings: 9999,
        maxLeadsPerMonth: null,
        maxImagesPerListing: 50,
        maxVideosPerListing: 10,
      },
      features: {
        forceWatermark: false,
        enableAdvanceLandingPage: true,
        enableCustomDomain: true,
        enableAutoReply: true,
        customFeatures: [
          { text: "Mọi tính năng từ gói PRO" },
          { text: "Cloud storage không giới hạn" },
          { text: "Hỗ trợ kỹ thuật ưu tiên 24/7" },
          { text: "Thương lượng giá theo nhu cầu" },
        ],
      },
    },
  ];

  const plansEn = [
    {
      slug: "free",
      features: {
        customFeatures: [
          { text: "Cloud storage 0.5 GB" },
          { text: "Content management" },
          { text: "Landing page free trial 7 days" },
          { text: "Email notification upon new lead" },
        ],
      },
    },
    {
      slug: "starter",
      features: {
        customFeatures: [
          { text: "All features from FREE plan" },
          { text: "Cloud storage 5 GB" },
          { text: "Lead notes + history" },
          { text: "Landing page with base components" },
          { text: "Custom page design (negotiable)" },
        ],
      },
    },
    {
      slug: "pro",
      features: {
        customFeatures: [
          { text: "All features from STARTER plan" },
          { text: "Cloud storage 50 GB" },
        ],
      },
    },
    {
      slug: "custom",
      features: {
        customFeatures: [
          { text: "All features from PRO plan" },
          { text: "Unlimited cloud storage" },
          { text: "Priority 24/7 technical support" },
          { text: "Negotiable pricing based on needs" },
        ],
      },
    },
  ];

  const results = [];

  for (const plan of plans) {
    try {
      const existing = await payload.find({
        collection: "plans",
        where: { slug: { equals: plan.slug } },
        depth: 0,
      });

      if (existing.docs.length > 0) {
        const docId = existing.docs[0].id;
        const updated = await payload.update({
          collection: "plans",
          id: docId,
          data: plan,
          locale: "vi",
        });
        
        // Update English locale
        const enData = plansEn.find(p => p.slug === plan.slug);
        const updatedCustomFeatures = updated.features?.customFeatures;
        if (enData && updatedCustomFeatures) {
          enData.features.customFeatures = enData.features.customFeatures.map((item, index) => ({
            ...item,
            id: updatedCustomFeatures[index]?.id,
          }));
          await payload.update({
            collection: "plans",
            id: docId,
            data: enData,
            locale: "en",
          });
        }
        
        results.push({ slug: plan.slug, status: "updated" });
      } else {
        const created = await payload.create({
          collection: "plans",
          data: plan,
          locale: "vi",
        });
        
        // Create English locale
        const enData = plansEn.find(p => p.slug === plan.slug);
        const createdCustomFeatures = created.features?.customFeatures;
        if (enData && createdCustomFeatures) {
          enData.features.customFeatures = enData.features.customFeatures.map((item, index) => ({
            ...item,
            id: createdCustomFeatures[index]?.id,
          }));
          await payload.update({
            collection: "plans",
            id: created.id,
            data: enData,
            locale: "en",
          });
        }
        results.push({ slug: plan.slug, status: "created" });
      }
    } catch (e) {
      results.push({
        slug: plan.slug,
        status: "error",
        error: (e as Error).message,
      });
    }
  }

  console.log("Seeding plans completed successfully");
  console.log(results);
}

seedPlans()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
