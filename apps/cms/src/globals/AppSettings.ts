import { GlobalConfig } from "payload";
import { GLOBAL_TAGS } from "@bds/shared/cache-tags";
import { triggerRevalidateWithCascade } from "../utils/revalidate";

export const AppSettings: GlobalConfig = {
  slug: "app-settings",
  admin: {
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "brandName",
      type: "text",
      label: { vi: "Tên thương hiệu", en: "Brand Name" },
      defaultValue: "Bất Động Sản",
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: "themePrimary",
          type: "text",
          label: { vi: "Màu chủ đạo (Primary)", en: "Primary Color" },
          defaultValue: "#059669",
          admin: {
            components: {
              Field: '@/components/ColorPickerField#ColorPickerField',
            }
          }
        },
        {
          name: "themePrimaryForeground",
          type: "text",
          label: { vi: "Màu chữ trên nền chủ đạo (Primary Foreground)", en: "Primary Foreground" },
          defaultValue: "#ffffff",
          admin: {
            components: {
              Field: '@/components/ColorPickerField#ColorPickerField',
            }
          }
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: "themeSecondary",
          type: "text",
          label: { vi: "Màu phụ (Secondary)", en: "Secondary Color" },
          defaultValue: "#475569",
          admin: {
            components: {
              Field: '@/components/ColorPickerField#ColorPickerField',
            }
          }
        },
        {
          name: "themeSecondaryForeground",
          type: "text",
          label: { vi: "Màu chữ trên nền phụ (Secondary Foreground)", en: "Secondary Foreground" },
          defaultValue: "#ffffff",
          admin: {
            components: {
              Field: '@/components/ColorPickerField#ColorPickerField',
            }
          }
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: "fullLogo",
          type: "upload",
          relationTo: "media",
          label: { vi: "Logo chính (Full)", en: "Full Logo" },
          admin: {
            description: { vi: "Chỉ nhận file SVG", en: "Only SVG files are accepted" },
          },
          filterOptions: {
            mimeType: { equals: "image/svg+xml" },
          },
        },
        {
          name: "shortLogo",
          type: "upload",
          relationTo: "media",
          label: { vi: "Logo phụ (Icon/Favicon)", en: "Short Logo" },
          admin: {
            description: { vi: "Chỉ nhận file SVG", en: "Only SVG files are accepted" },
          },
          filterOptions: {
            mimeType: { equals: "image/svg+xml" },
          },
        },
      ]
    },
  ],
  hooks: {
    afterChange: [
      async ({ req }) => {
        triggerRevalidateWithCascade({ tag: GLOBAL_TAGS.appSettings, req });
      },
    ],
  },
};
