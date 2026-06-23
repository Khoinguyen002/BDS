import type { Block, Where } from "payload";
import type { LandingPage } from "@bds/shared/payload-types";

export const pageBlocks: Block[] = [
  {
    slug: "heroBanner",
    imageURL: "/blocks/hero-banner.png",
    labels: {
      singular: { vi: "Hero Banner", en: "Hero Banner" },
      plural: { vi: "Hero Banners", en: "Hero Banners" },
    },
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
        localized: true,
        label: { vi: "Tiêu đề", en: "Title" },
      },
      {
        name: "subtitle",
        type: "text",
        localized: true,
        label: { vi: "Tiêu đề phụ", en: "Subtitle" },
      },
      {
        name: "backgroundImage",
        type: "relationship",
        relationTo: "media",
        label: { vi: "Ảnh nền", en: "Background Image" },
      },
    ],
  },
  {
    slug: "aboutAgent",
    imageURL: "/blocks/about-agent.png",
    labels: {
      singular: { vi: "Thông tin Agent", en: "About Agent" },
      plural: { vi: "Thông tin Agent", en: "About Agent" },
    },
    fields: [
      {
        name: "content",
        type: "richText",
        localized: true,
        label: { vi: "Nội dung", en: "Content" },
      },
      {
        name: "avatar",
        type: "relationship",
        relationTo: "media",
        label: { vi: "Ảnh đại diện", en: "Avatar" },
      },
      {
        name: "agentName",
        type: "text",
        localized: false,
        label: { vi: "Tên Agent", en: "Agent Name" },
      },
      {
        name: "agentTitle",
        type: "text",
        localized: true,
        label: { vi: "Chức danh", en: "Agent Title" },
      },
      {
        name: "phoneNumber",
        type: "text",
        localized: false,
        label: { vi: "Số điện thoại", en: "Phone Number" },
      },
      {
        name: "zaloLink",
        type: "text",
        localized: false,
        label: { vi: "Link Zalo", en: "Zalo Link" },
      },
      {
        name: "experienceYears",
        type: "number",
        localized: false,
        label: { vi: "Số năm kinh nghiệm", en: "Experience Years" },
      },
      {
        name: "successfulDeals",
        type: "number",
        localized: false,
        label: { vi: "Số giao dịch thành công", en: "Successful Deals" },
      },
    ],
  },
  {
    slug: "listApartments",
    imageURL: "/blocks/list-apartments.png",
    labels: {
      singular: { vi: "Danh sách căn hộ", en: "List Apartments" },
      plural: { vi: "Danh sách căn hộ", en: "List Apartments" },
    },
    fields: [
      {
        name: "apartmentsFilter",
        type: "relationship",
        relationTo: "apartments",
        label: {
          vi: "Chọn các căn hộ hiển thị (Để trống sẽ hiện tất cả)",
          en: "Filter Apartments",
        },
        hasMany: true,
        admin: {
          components: {
            Field: "@/components/ApartmentPickerField#ApartmentPickerField",
          },
        },
        filterOptions: ({ data, siblingData }): Where => {
          const owner =
            (data as Partial<LandingPage>)?.owner ||
            (siblingData as Partial<LandingPage>)?.owner;

          const ownerId =
            typeof owner === "object" && owner !== null && "id" in owner
              ? owner.id
              : owner;

          if (ownerId) {
            return { owner: { equals: ownerId } };
          }

          return { id: { exists: true } };
        },
      },
    ],
  },
  {
    slug: "contactForm",
    imageURL: "/blocks/contact-form.png",
    labels: {
      singular: { vi: "Form liên hệ", en: "Contact Form" },
      plural: { vi: "Form liên hệ", en: "Contact Forms" },
    },
    fields: [
      {
        name: "title",
        type: "text",
        localized: true,
        label: { vi: "Tiêu đề", en: "Title" },
      },
      {
        name: "placeholder",
        type: "text",
        localized: true,
        label: { vi: "Chữ mờ trong ô nhập", en: "Placeholder" },
      },
    ],
  },
];
