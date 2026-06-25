import type { CollectionConfig } from "payload";
import { formatSlug } from "../utils/formatSlug";

export const Plans: CollectionConfig = {
  slug: "plans",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "price"],
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    read: () => true, // Ai cũng đọc được bảng giá
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: { vi: "Tên gói", en: "Plan Name" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [formatSlug("name")],
      },
      admin: {
        position: "sidebar",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "originalPrice",
          type: "number",
          label: { vi: "Giá gốc (gạch bỏ)", en: "Original Price" },
          admin: {
            description: {
              vi: "Dùng để hiển thị giá gạch bỏ tạo hiệu ứng chim mồi",
              en: "Used to display crossed-out price",
            },
          },
        },
        {
          name: "price",
          type: "number",
          required: true,
          label: { vi: "Giá bán thực tế", en: "Selling Price" },
        },
      ],
    },
    {
      name: "limits",
      type: "group",
      label: { vi: "Hạn mức (Limits)", en: "Limits" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "maxListings",
              type: "number",
              required: true,
              label: { vi: "Số lượng bài đăng tối đa", en: "Max Listings" },
            },
            {
              name: "maxLeadsPerMonth",
              type: "number",
              label: {
                vi: "Số Lead hiển thị mỗi tháng",
                en: "Max Leads Per Month",
              },
              admin: {
                description: {
                  vi: "Bỏ trống để không giới hạn (Unlimited)",
                  en: "Leave empty for unlimited",
                },
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "maxImagesPerListing",
              type: "number",
              required: true,
              label: {
                vi: "Số ảnh tối đa / Bài đăng",
                en: "Max Images / Listing",
              },
            },
            {
              name: "maxVideosPerListing",
              type: "number",
              required: true,
              label: {
                vi: "Số Video tối đa / Bài đăng",
                en: "Max Videos / Listing",
              },
            },
          ],
        },
      ],
    },
    {
      name: "features",
      type: "group",
      label: { vi: "Quyền lợi (Features)", en: "Features" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "enableAdvanceLandingPage",
              type: "checkbox",
              label: {
                vi: "Landing Page Nâng Cao",
                en: "Advance Landing Page",
              },
              defaultValue: false,
            },
            {
              name: "enableCustomDomain",
              type: "checkbox",
              label: { vi: "Custom Domain", en: "Custom Domain" },
              defaultValue: false,
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "enableAutoReply",
              type: "checkbox",
              label: { vi: "Auto-reply Template", en: "Auto-reply Template" },
              defaultValue: false,
            },
            {
              name: "forceWatermark",
              type: "checkbox",
              label: { vi: "Ép chèn Watermark", en: "Force Watermark" },
              defaultValue: false,
              admin: {
                description: {
                  vi: "Chỉ tích cho gói FREE",
                  en: "Check this for FREE tier only",
                },
              },
            },
          ],
        },
        {
          name: "customFeatures",
          type: "array",
          label: {
            vi: "Tính năng bổ sung (Dynamic Row)",
            en: "Custom Features",
          },
          admin: {
            description: {
              vi: "Hiển thị thêm các dòng tính năng linh động trên bảng giá",
              en: "Show additional dynamic feature rows on pricing table",
            },
          },
          fields: [
            {
              name: "text",
              type: "text",
              required: true,
              localized: true,
              label: { vi: "Tên tính năng", en: "Feature text" },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        // Có thể cần revalidate trang bảng giá
      },
    ],
  },
};
