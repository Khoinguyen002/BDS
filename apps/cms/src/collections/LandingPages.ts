import { CollectionConfig, APIError } from "payload";
import { triggerRevalidateTag } from "../utils/revalidate";
import { COLLECTION_TAGS } from "@bds/shared/cache-tags";

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
          if (data.blocks.length > 50) {
            throw new APIError(`Vượt quá giới hạn số lượng Block tối đa (50).`, 400, undefined, true);
          }

          if (user.role !== 'admin' && data.blocks.length > 0) {
             const permissionsConfig = await req.payload.findGlobal({ slug: "component-permissions", req });
             
             const activeSub = user.activeSubscription;
             let userPlanId: string | number | null = null;
             if (activeSub) {
                const subId = typeof activeSub === 'object' ? activeSub.id : activeSub;
                const sub = await req.payload.findByID({ collection: 'subscriptions', id: String(subId), depth: 0 });
                userPlanId = typeof sub.plan === 'object' ? sub.plan.id : sub.plan;
             }
             
             for (const block of data.blocks) {
                const rule = (permissionsConfig as unknown as Record<string, unknown>)?.[block.blockType] as Record<string, unknown> | undefined;
                if (rule) {
                   const userId = user.id;
                   // Check blacklist
                   const excludeUsers = rule.excludeUsers as Array<string | number | { id: string | number }> | undefined;
                   if (excludeUsers) {
                      const excludeUserIds = excludeUsers.map((u) => typeof u === 'object' && u !== null ? u.id : u);
                      if (excludeUserIds.includes(userId)) {
                         throw new APIError(`Tài khoản của bạn bị cấm sử dụng component: ${block.blockType}`, 400);
                      }
                   }
                   
                   // Check whitelist
                   const includeUsers = rule.includeUsers as Array<string | number | { id: string | number }> | undefined;
                   if (includeUsers) {
                      const includeUserIds = includeUsers.map((u) => typeof u === 'object' && u !== null ? u.id : u);
                      if (includeUserIds.includes(userId)) {
                         continue; // Passed
                      }
                   }
                   
                   // Check plans
                   const allowedPlans = rule.allowedPlans as Array<string | number | { id: string | number }> | undefined;
                   if (allowedPlans && allowedPlans.length > 0) {
                      if (!userPlanId) {
                         throw new APIError(`Bạn cần đăng ký gói dịch vụ để sử dụng component: ${block.blockType}`, 400);
                      }
                      const allowedPlanIds = allowedPlans.map((p) => typeof p === 'object' && p !== null ? p.id : p);
                      if (!allowedPlanIds.includes(userPlanId)) {
                         throw new APIError(`Gói hiện tại không hỗ trợ component: ${block.blockType}. Vui lòng nâng cấp.`, 400);
                      }
                   }
                }
             }
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
        triggerRevalidateTag({ tag: COLLECTION_TAGS.landingPages, req });
      },
    ],
    afterDelete: [
      async ({ req }) => {
        triggerRevalidateTag({ tag: COLLECTION_TAGS.landingPages, req });
      },
    ],
  },
};
