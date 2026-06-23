import { GlobalConfig } from "payload";
import { COLLECTION_TAGS } from "@bds/shared/cache-tags";
import { triggerRevalidateTag } from "../utils/revalidate";
import { pageBlocks } from "../collections/blocks/pageBlocks";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: { vi: "Trang chủ", en: "Homepage" },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "blocks",
      type: "blocks",
      blocks: pageBlocks,
      label: { vi: "Các khối giao diện (Blocks)", en: "Blocks" },
      admin: {
        components: {
          Field: "@/components/CustomBlocksField#CustomBlocksField",
        },
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ req }) => {
        triggerRevalidateTag({ tag: COLLECTION_TAGS.homepage, req });
      },
    ],
  },
};
