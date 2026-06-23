import { GlobalConfig, Field } from "payload";
import { COLLECTION_TAGS } from "@bds/shared/cache-tags";
import { triggerRevalidateTag } from "../utils/revalidate";
import { pageBlocks } from "../collections/blocks/pageBlocks";



const permissionFields: Field[] = pageBlocks.map((block) => {
  const blockLabel =
    typeof block.labels?.singular === "object"
      ? block.labels.singular.vi || block.slug
      : block.slug;

  return {
    name: block.slug,
    type: "group",
    label: blockLabel,
    admin: {
      condition: (data) => {
        const filter = data?._blockFilter || {};
        const searchQuery = (filter.search || "").toLowerCase();

        if (!searchQuery) return true;

        const labelStr = String(blockLabel).toLowerCase();
        return labelStr.includes(searchQuery) || block.slug.toLowerCase().includes(searchQuery);
      },
    },
    fields: [
      {
        name: "preview",
        type: "ui",
        admin: {
          readOnly: true,
          components: {
            Field: "@/components/BlockImagePreview",
          },
          custom: {
            imageURL:
              typeof block.admin?.images?.thumbnail === "string"
                ? block.admin.images.thumbnail
                : block.admin?.images?.thumbnail?.url,
          },
        },
      },
      {
        type: "row",
        fields: [
          {
            name: "allowedPlans",
            type: "relationship",
            relationTo: "plans",
            hasMany: true,
            label: {
              vi: "Các Gói (Plans) được phép dùng",
              en: "Allowed Plans",
            },
            admin: {
              description: "Để trống nếu tất cả các gói đều được phép dùng.",
            },
          },

          {
            name: "includeUsers",
            type: "relationship",
            relationTo: "users",
            hasMany: true,
            label: {
              vi: "Danh sách User đặc cách (Whitelist)",
              en: "Whitelist Users",
            },
            admin: {
              description:
                "Những user này sẽ luôn được phép xài block này bất kể họ ở gói nào. (Gõ để tìm theo email)",
            },
          },
          {
            name: "excludeUsers",
            type: "relationship",
            relationTo: "users",
            hasMany: true,
            label: {
              vi: "Danh sách User bị cấm (Blacklist)",
              en: "Blacklist Users",
            },
            admin: {
              description:
                "Những user này BỊ CẤM xài block này bất kể họ mua gói nào. (Gõ để tìm theo email)",
            },
          },
        ],
      },
    ],
  };
});

export const ComponentPermissions: GlobalConfig = {
  slug: "component-permissions",
  label: { vi: "Phân quyền Component", en: "Component Permissions" },
  admin: {
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "_blockFilter",
      type: "json",
      admin: {
        components: {
          Field: "@/components/PermissionsTagFilter",
        },
      },
    },
    ...permissionFields,
  ],
  hooks: {
    afterChange: [
      async ({ req }) => {
        // Có thể cần tạo một cache tag riêng hoặc clear chung landingPages
        triggerRevalidateTag({ tag: COLLECTION_TAGS.landingPages, req });
      },
    ],
  },
};
