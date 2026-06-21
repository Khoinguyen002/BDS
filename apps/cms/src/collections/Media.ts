import { CollectionConfig, APIError } from "payload";
import { getEffectiveTier, TIERS } from "@bds/shared";
import { env } from "../env";

export const Media: CollectionConfig = {
  slug: "media",
  custom: { cacheable: false },
  upload: {
    disableLocalStorage: !!env.CLOUDINARY_CLOUD_NAME || !!env.S3_BUCKET,
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      defaultValue: ({ req }) => req.user?.id,
      admin: {
        position: "sidebar",
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === "create" && req.user) {
          const user = req.user;
          const file = req.file;
          if (!file) return data;

          const tier = getEffectiveTier(user);

          if (
            (file.mimetype as string)?.startsWith("video/") &&
            !TIERS[tier].video
          ) {
            throw new APIError(
              `Your ${tier} tier does not support video uploads.`,
              400,
              undefined,
              true
            );
          }

          const storageBytes = user.usage?.storageBytes || 0;
          const maxStorageBytes = TIERS[tier].maxStorageMB * 1024 * 1024;

          if (storageBytes + file.size > maxStorageBytes) {
            throw new APIError(`Storage limit exceeded. Upgrade to pro.`, 400, undefined, true);
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ req, operation }) => {
        if (operation === "create" && req.user && req.file) {
          const ownerUser = await req.payload.findByID({
            collection: "users",
            id: String(req.user.id),
            req,
          });
          const newSize = (ownerUser.usage?.storageBytes || 0) + req.file.size;
          await req.payload.update({
            collection: "users",
            id: ownerUser.id,
            data: { usage: { storageBytes: newSize } },
            req,
          });
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        try {
          const apts = await req.payload.find({
            collection: "apartments",
            where: { gallery: { equals: id } },
            depth: 0,
            req,
          });
          if (apts.totalDocs > 0) {
            throw new APIError(
              "Cannot delete media because it is used in an apartment gallery.",
              400,
              undefined,
              true,
            );
          }

          const pages = await req.payload.find({
            collection: "landing-pages",
            where: {
              or: [
                { "blocks.backgroundImage": { equals: id } },
                { "blocks.avatar": { equals: id } },
              ],
            },
            depth: 0,
            req,
          });
          if (pages.totalDocs > 0) {
            throw new APIError(
              "Cannot delete media because it is used in a landing page.",
              400,
              undefined,
              true,
            );
          }
        } catch (error) {
          req.payload.logger.error(
            `Error in beforeDelete hook for Media: ${error}`,
          );
          if (error instanceof APIError) {
            throw error;
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          if (doc.owner) {
            const ownerId =
              typeof doc.owner === "object" ? doc.owner.id : doc.owner;
            if (!ownerId) return;
            const ownerUser = await req.payload.findByID({
              collection: "users",
              id: String(ownerId),
              req,
            });
            const newSize = Math.max(
              0,
              (ownerUser.usage?.storageBytes || 0) - (doc.filesize || 0),
            );
            await req.payload.update({
              collection: "users",
              id: ownerUser.id,
              data: { usage: { storageBytes: newSize } },
              req,
            });
          }
        } catch (error) {
          req.payload.logger.error(
            `Error in afterDelete hook for Media: ${error}`,
          );
        }
      },
    ],
  },
};
