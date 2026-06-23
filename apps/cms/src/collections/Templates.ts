import type { CollectionConfig } from "payload";
import type { Access } from "payload";

const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin';
import { pageBlocks } from "./blocks/pageBlocks";

export const Templates: CollectionConfig = {
  slug: "templates",
  custom: { cacheable: false },
  admin: {
    useAsTitle: "title",
  },
  access: {
    read: () => true, // Everyone can read templates
    create: isAdmin,  // Only admins can create
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "blocks",
      type: "blocks",
      admin: {
        components: {
          Field: "@/components/CustomBlocksField#CustomBlocksField",
        },
      },
      blocks: pageBlocks,
    },
  ],
};
