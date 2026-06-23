import type { CollectionConfig } from "payload";
import { triggerRevalidateWithCascade } from "../utils/revalidate";
import { COLLECTION_TAGS } from "@bds/shared/cache-tags";

export const Subscriptions: CollectionConfig = {
  slug: "subscriptions",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "plan", "status", "startDate", "endDate"],
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      // User chỉ xem được subscription của mình
      return {
        user: {
          equals: user?.id,
        },
      };
    },
    // Chặn user tự update, chỉ hook hoặc admin mới được sửa
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "plan",
      type: "relationship",
      relationTo: "plans",
      required: true,
      admin: {
        description: {
          vi: "Plan gốc (Template) làm cơ sở",
          en: "Base Plan Template",
        },
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Expired", value: "expired" },
        { label: "Canceled", value: "canceled" },
      ],
      defaultValue: "active",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "startDate",
          type: "date",
          required: true,
          defaultValue: () => new Date(),
        },
        {
          name: "endDate",
          type: "date",
          admin: {
            description: {
              vi: "Bỏ trống nếu là gói vĩnh viễn (ví dụ FREE)",
              en: "Leave empty for lifetime (e.g. FREE)",
            },
          },
        },
      ],
    },
    {
      name: "customLimits",
      type: "group",
      label: {
        vi: "Cấu Hình Hạn Mức (Ghi đè cho riêng user này)",
        en: "Custom Limits",
      },
      fields: [
        {
          name: "limits",
          type: "group",
          label: { vi: "Hạn mức", en: "Limits" },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "maxListings",
                  type: "number",
                  required: true,
                },
                {
                  name: "maxLeadsPerMonth",
                  type: "number",
                  admin: { description: "Để trống = Unlimited" },
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
                },
                {
                  name: "maxVideosPerListing",
                  type: "number",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: "features",
          type: "group",
          label: { vi: "Quyền lợi", en: "Features" },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "enableAdvanceLandingPage",
                  type: "checkbox",
                  defaultValue: false,
                },
                {
                  name: "enableCustomDomain",
                  type: "checkbox",
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
                  defaultValue: false,
                },
                {
                  name: "forceWatermark",
                  type: "checkbox",
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "usage",
      type: "group",
      label: { vi: "Thống kê sử dụng hiện tại", en: "Current Usage" },
      admin: {
        description: {
          vi: "Được tự động cập nhật qua hệ thống Hooks. Admin hạn chế sửa tay trừ khi fix lỗi đồng bộ.",
          en: "Auto-updated via Hooks. Admins should avoid manual edits.",
        },
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "currentListingsCount", type: "number", defaultValue: 0 },
            { name: "currentLeadsThisMonth", type: "number", defaultValue: 0 },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "currentImagesCount", type: "number", defaultValue: 0 },
            { name: "currentVideosCount", type: "number", defaultValue: 0 },
          ],
        },
        {
          name: "lastLeadResetDate",
          type: "date",
          admin: {
            description: {
              vi: "Thời điểm bắt đầu tính Lead cho tháng hiện tại",
              en: "Start date for current month lead counting",
            },
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ req }) => {
        triggerRevalidateWithCascade({
          tag: COLLECTION_TAGS.subscriptions,
          req,
        });
      },
    ],
    afterDelete: [
      ({ req }) => {
        triggerRevalidateWithCascade({
          tag: COLLECTION_TAGS.subscriptions,
          req,
        });
      },
    ],
  },
};
