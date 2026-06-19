import { CollectionConfig, APIError } from "payload";
import { getEffectiveTier, TIERS } from "@bds/shared";
import { triggerRevalidateTag } from "../utils/revalidate";

import { pageBlocks } from "./blocks/pageBlocks";

export const LandingPages: CollectionConfig = {
  slug: "landing-pages",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      return { owner: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      return { owner: { equals: user?.id } };
    },
  },

  fields: [
    {
      name: "templateSelection",
      type: "relationship",
      relationTo: "templates",
      hasMany: false,
      label: {
        en: "Create from Template",
        vi: "Tạo từ Template",
      },
      admin: {
        position: "sidebar",
        condition: (data) => !data?.id,
      },
    },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      unique: true,
      defaultValue: ({ req }) => req.user?.id,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "blocks",
      type: "blocks",
      admin: {
        condition: (data) => {
          if (data?.id) return true; // Always show when editing
          if (data?.templateSelection) return false; // Hide if a template is selected during creation
          return true; // Show if starting from scratch
        },
      },
      blocks: pageBlocks,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Auto-populate template if a template is selected
        if (operation === "create" && data?.templateSelection && (!data.blocks || data.blocks.length === 0)) {
          try {
            const templateId = typeof data.templateSelection === 'object' ? data.templateSelection.id : data.templateSelection;
            const template = await req.payload.findByID({
              collection: 'templates',
              id: templateId as string,
              req,
            });

            if (template?.blocks && Array.isArray(template.blocks)) {
              // Deep clone the blocks and strip the ID property so Payload generates new block IDs
              data.blocks = template.blocks.map(block => {
                const cloned = JSON.parse(JSON.stringify(block));
                delete cloned.id;
                return cloned;
              });
            }
          } catch (e) {
            req.payload.logger.error(`Failed to copy blocks from template: ${e}`);
          }
        }
        if (data?.owner && data?.blocks) {
          const user = await req.payload.findByID({
            collection: "users",
            id: data.owner as string,
            req,
          });
          const tier = getEffectiveTier(user);
          if (data.blocks.length > TIERS[tier].maxBlocks) {
            throw new APIError(`Maximum blocks limit reached for ${tier} tier.`, 400, undefined, true);
          }

          if (operation === 'create' && user.role !== 'admin') {
            const { totalDocs } = await req.payload.find({
              collection: "landing-pages",
              where: { owner: { equals: data.owner } },
              req,
            });
            if (totalDocs >= 1) {
              throw new APIError('Mỗi Agent chỉ được tạo tối đa 1 Landing Page!', 400, undefined, true);
            }
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ req }) => {
        await triggerRevalidateTag({ tag: 'landing-pages', req });
      },
    ],
  },
};
