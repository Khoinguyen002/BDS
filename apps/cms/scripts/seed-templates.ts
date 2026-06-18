import { getPayload } from "payload";
import configPromise from "../src/payload.config";
import { LandingPage } from "@bds/shared/payload-types";

type AboutAgentBlock = Extract<
  NonNullable<LandingPage["blocks"]>[number],
  { blockType: "aboutAgent" }
>;

const lexicalContentVi: NonNullable<AboutAgentBlock["content"]> = {
  root: {
    type: "root",
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            mode: "normal",
            text: "Tôi là chuyên gia tư vấn bất động sản với nhiều năm kinh nghiệm. Luôn sẵn sàng đồng hành cùng bạn tìm kiếm căn nhà ưng ý nhất với sự tận tâm và chuyên nghiệp.",
            type: "text",
            style: "",
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
      },
    ],
  },
};

const lexicalContentEn: NonNullable<AboutAgentBlock["content"]> = {
  root: {
    type: "root",
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            mode: "normal",
            text: "I am a real estate consultant with many years of experience. Always ready to accompany you in finding the most satisfactory home with dedication and professionalism.",
            type: "text",
            style: "",
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
      },
    ],
  },
};

export async function seedTemplates() {
  const payload = await getPayload({ config: configPromise });

  const templates: { title: string; blocks: { vi: LandingPage["blocks"], en: LandingPage["blocks"] } }[] = [
    {
      title: "Mẫu Tiêu Chuẩn",
      blocks: {
        vi: [
          {
            blockType: "heroBanner",
            title: "Khám Phá Không Gian Sống Đẳng Cấp",
            subtitle: "Chúng tôi mang đến những căn hộ sang trọng và tiện nghi bậc nhất.",
          },
          {
            blockType: "listApartments",
          },
          {
            blockType: "aboutAgent",
            content: lexicalContentVi,
          },
          {
            blockType: "contactForm",
            title: "Liên hệ với tôi",
            placeholder: "Nhập số điện thoại của bạn",
          },
        ],
        en: [
          {
            blockType: "heroBanner",
            title: "Discover Premium Living Spaces",
            subtitle: "We offer the most luxurious and convenient apartments.",
          },
          {
            blockType: "listApartments",
          },
          {
            blockType: "aboutAgent",
            content: lexicalContentEn,
          },
          {
            blockType: "contactForm",
            title: "Contact Me",
            placeholder: "Enter your phone number",
          },
        ]
      }
    },
    {
      title: "Mẫu Tối Giản",
      blocks: {
        vi: [
          {
            blockType: "heroBanner",
            title: "Tìm Kiếm Tổ Ấm Lý Tưởng",
            subtitle: "Nhanh chóng, uy tín, và hoàn toàn bảo mật.",
          },
          {
            blockType: "listApartments",
          },
          {
            blockType: "contactForm",
            title: "Nhận tư vấn miễn phí ngay",
            placeholder: "Nhập số điện thoại",
          },
        ],
        en: [
          {
            blockType: "heroBanner",
            title: "Find Your Ideal Home",
            subtitle: "Fast, reputable, and fully confidential.",
          },
          {
            blockType: "listApartments",
          },
          {
            blockType: "contactForm",
            title: "Get free consultation now",
            placeholder: "Enter phone number",
          },
        ]
      }
    },
  ];

  const results = [];

  for (const t of templates) {
    try {
      const existing = await payload.find({
        collection: "templates",
        where: { title: { equals: t.title } },
        depth: 0,
      });

      let docId;

      if (existing.docs.length > 0) {
        docId = existing.docs[0].id;
        await payload.update({
          collection: "templates",
          id: docId,
          data: { blocks: t.blocks.vi },
          locale: "vi",
        });
      } else {
        const created = await payload.create({
          collection: "templates",
          data: {
            title: t.title,
            blocks: t.blocks.vi,
          },
          locale: "vi",
        });
        docId = created.id;
      }

      await payload.update({
        collection: "templates",
        id: docId,
        data: { blocks: t.blocks.en },
        locale: "en",
      });

      results.push({ title: t.title, status: "upserted" });
    } catch (e) {
      results.push({
        title: t.title,
        status: "error",
        error: (e as Error).message,
      });
    }
  }

  console.log("Seeding templates completed successfully");
  console.log(results);
}

seedTemplates().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
