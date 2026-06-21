import { CollectionConfig } from "payload";
import { triggerRevalidateWithCascade } from "../utils/revalidate";
import { COLLECTION_TAGS } from "@bds/shared/cache-tags";
import { formatSlug } from "../utils/formatSlug";

// Tag tự do thay cho `propertyType` cứng. Agent có thể tạo mới ngay trong
// field relationship của Apartment (autocomplete + "Add new"), nên create mở
// cho mọi user đăng nhập; slug giữ data sạch để lọc/gom nhóm.
export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    useAsTitle: "title",
    group: "Master Data",
    defaultColumns: ["title", "slug"],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: { vi: "Tên tag", en: "Title" },
    },
    {
      name: "slug",
      type: "text",
      label: { vi: "Đường dẫn (Slug)", en: "Slug" },
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [formatSlug("title")],
      },
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
  ],
  hooks: {
    afterChange: [
      ({ req }) => {
        triggerRevalidateWithCascade({ tag: COLLECTION_TAGS.tags, req });
      },
    ],
    afterDelete: [
      ({ req }) => {
        triggerRevalidateWithCascade({ tag: COLLECTION_TAGS.tags, req });
      },
    ],
  },
};
