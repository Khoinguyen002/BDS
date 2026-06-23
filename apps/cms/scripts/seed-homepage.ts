
import { getPayload } from "payload";
import configPromise from "../src/payload.config";

export async function seedHomepage() {
  const payload = await getPayload({ config: configPromise });

  const blocksVi = [
    {
      blockType: "platformHeroBanner",
      title: "Tìm kiếm bất động sản mơ ước",
      subtitle: "Hàng ngàn lựa chọn đang chờ đón bạn",
    },
    {
      blockType: "curatedCollections",
      title: "Bộ sưu tập nổi bật",
      description: "Các bất động sản được chọn lọc kỹ càng",
    },
    {
      blockType: "marketSnapshot",
      title: "Tổng quan thị trường",
    },
    {
      blockType: "platformFeaturedAgents",
      title: "Môi giới tiêu biểu",
      limit: 4,
    },
    {
      blockType: "ctaSupply",
      title: "Ký gửi bất động sản",
      description: "Đăng tin nhanh chóng, tiếp cận hàng triệu khách hàng",
      buttonLabel: "Đăng tin ngay",
      buttonLink: "/supply",
    },
  ];

  const blocksEn = [
    {
      blockType: "platformHeroBanner",
      title: "Find your dream real estate",
      subtitle: "Thousands of options are waiting for you",
    },
    {
      blockType: "curatedCollections",
      title: "Curated Collections",
      description: "Carefully selected properties",
    },
    {
      blockType: "marketSnapshot",
      title: "Market Snapshot",
    },
    {
      blockType: "platformFeaturedAgents",
      title: "Featured Agents",
      limit: 4,
    },
    {
      blockType: "ctaSupply",
      title: "List your property",
      description: "Post quickly, reach millions of customers",
      buttonLabel: "Post now",
      buttonLink: "/supply",
    },
  ];

  try {
    await payload.updateGlobal({
      slug: "homepage",
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        blocks: blocksVi as any,
      },
      locale: "vi",
    });

    await payload.updateGlobal({
      slug: "homepage",
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        blocks: blocksEn as any,
      },
      locale: "en",
    });

    console.log("Seeding homepage completed successfully");
  } catch (e) {
    console.error("Error seeding homepage:", e);
  }
}

seedHomepage().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
