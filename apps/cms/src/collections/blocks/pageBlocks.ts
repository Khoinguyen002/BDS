import type { Block, Where } from "payload";
import type { LandingPage } from "@bds/shared/payload-types";

export const pageBlocks: Block[] = [
  {
    slug: "heroBanner",
    labels: {
      singular: { vi: "Hero Banner", en: "Hero Banner" },
      plural: { vi: "Hero Banners", en: "Hero Banners" },
    },
    admin: {
      group: "Hero",
      custom: {
      },
      images: { thumbnail: "/blocks/hero-banner.png" },
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
    labels: {
      singular: { vi: "Thông tin Agent", en: "About Agent" },
      plural: { vi: "Thông tin Agent", en: "About Agent" },
    },
    admin: {
      group: "Content",
      custom: {
      },
      images: { thumbnail: "/blocks/about-agent.png" },
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
    labels: {
      singular: { vi: "Danh sách căn hộ", en: "List Apartments" },
      plural: { vi: "Danh sách căn hộ", en: "List Apartments" },
    },
    admin: {
      group: "Listing",
      custom: {
      },
      images: { thumbnail: "/blocks/list-apartments.png" },
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
    labels: {
      singular: { vi: "Form liên hệ", en: "Contact Form" },
      plural: { vi: "Form liên hệ", en: "Contact Forms" },
    },
    admin: {
      group: "Forms",
      custom: {
      },
      images: { thumbnail: "/blocks/contact-form.png" },
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
  {
    slug: "platformHeroBanner",
    labels: {
      singular: { vi: "Hero Banner (Trang chủ)", en: "Platform Hero Banner" },
      plural: { vi: "Hero Banners (Trang chủ)", en: "Platform Hero Banners" },
    },
    admin: {
      group: "Hero",
      custom: {
      },
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
        label: { vi: "Phụ đề", en: "Subtitle" },
      },
    ],
  },
  {
    slug: "curatedCollections",
    labels: {
      singular: { vi: "Bộ sưu tập nổi bật", en: "Curated Collections" },
      plural: { vi: "Bộ sưu tập nổi bật", en: "Curated Collections" },
    },
    admin: {
      group: "Listing",
      custom: {
      },
    },
    fields: [
      {
        name: "title",
        type: "text",
        localized: true,
        label: { vi: "Tiêu đề", en: "Title" },
      },
      {
        name: "description",
        type: "text",
        localized: true,
        label: { vi: "Mô tả", en: "Description" },
      },
    ],
  },
  {
    slug: "marketSnapshot",
    labels: {
      singular: { vi: "Tổng quan thị trường", en: "Market Snapshot" },
      plural: { vi: "Tổng quan thị trường", en: "Market Snapshot" },
    },
    admin: {
      group: "Content",
      custom: {
      },
    },
    fields: [
      {
        name: "title",
        type: "text",
        localized: true,
        label: { vi: "Tiêu đề", en: "Title" },
      },
    ],
  },
  {
    slug: "platformFeaturedAgents",
    labels: {
      singular: { vi: "Agent tiêu biểu", en: "Featured Agents" },
      plural: { vi: "Agent tiêu biểu", en: "Featured Agents" },
    },
    admin: {
      group: "Listing",
      custom: {
      },
    },
    fields: [
      {
        name: "title",
        type: "text",
        localized: true,
        label: { vi: "Tiêu đề", en: "Title" },
      },
      {
        name: "limit",
        type: "number",
        defaultValue: 4,
        label: { vi: "Số lượng hiển thị", en: "Limit" },
      },
    ],
  },
  {
    slug: "ctaSupply",
    labels: {
      singular: { vi: "Kêu gọi hành động (CTA Supply)", en: "CTA Supply" },
      plural: { vi: "Kêu gọi hành động (CTA Supply)", en: "CTA Supply" },
    },
    admin: {
      group: "Content",
      custom: {
      },
    },
    fields: [
      {
        name: "title",
        type: "text",
        localized: true,
        label: { vi: "Tiêu đề", en: "Title" },
      },
      {
        name: "description",
        type: "text",
        localized: true,
        label: { vi: "Mô tả", en: "Description" },
      },
      {
        name: "buttonLabel",
        type: "text",
        localized: true,
        label: { vi: "Chữ trên nút", en: "Button Label" },
      },
      {
        name: "buttonLink",
        type: "text",
        label: { vi: "Link nút", en: "Button Link" },
      },
    ],
  },
];
