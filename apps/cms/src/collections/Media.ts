import { CollectionConfig, APIError } from "payload";
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

          if (user.role === 'admin') return data; // Admin bypass

          if (!user.activeSubscription) {
             throw new APIError("Bạn chưa có gói dịch vụ nào đang kích hoạt.", 400);
          }

          const isVideo = (file.mimetype as string)?.startsWith("video/");
          
          // 1. Max File Size Limit
          if (isVideo && file.size > 50 * 1024 * 1024) {
             throw new APIError("Dung lượng video tối đa là 50MB. Vui lòng nén lại.", 400);
          } else if (!isVideo && file.size > 5 * 1024 * 1024) {
             throw new APIError("Dung lượng ảnh tối đa là 5MB. Vui lòng nén lại.", 400);
          }

          const subId = typeof user.activeSubscription === 'object' ? user.activeSubscription.id : user.activeSubscription;
          const sub = await req.payload.findByID({ collection: 'subscriptions', id: subId, depth: 0 });

          const maxListings = sub.customLimits?.limits?.maxListings || 0;

          if (isVideo) {
            const maxVideosPerListing = sub.customLimits?.limits?.maxVideosPerListing || 0;
            const maxVideosAllow = maxListings * maxVideosPerListing;
            const currentVideosCount = sub.usage?.currentVideosCount || 0;
            if (currentVideosCount >= maxVideosAllow) {
               throw new APIError(`Kho lưu trữ Video của bạn đã đầy (Tối đa ${maxVideosAllow} video). Vui lòng xoá bớt.`, 400);
            }
          } else {
            const maxImagesPerListing = sub.customLimits?.limits?.maxImagesPerListing || 0;
            const maxImagesAllow = maxListings * maxImagesPerListing;
            const currentImagesCount = sub.usage?.currentImagesCount || 0;
            if (currentImagesCount >= maxImagesAllow) {
               throw new APIError(`Kho lưu trữ Ảnh của bạn đã đầy (Tối đa ${maxImagesAllow} ảnh). Vui lòng xoá bớt.`, 400);
            }
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ req, operation }) => {
        if (operation === "create" && req.user && req.file && req.user.role !== 'admin') {
           const isVideo = (req.file.mimetype as string)?.startsWith("video/");
           const activeSub = req.user.activeSubscription;
           if (activeSub) {
             const subId = typeof activeSub === 'object' ? activeSub.id : activeSub;
             const sub = await req.payload.findByID({ collection: 'subscriptions', id: subId, depth: 0 });
             await req.payload.update({
               collection: 'subscriptions',
               id: subId,
               data: {
                 usage: {
                   ...sub.usage,
                   currentImagesCount: !isVideo ? (sub.usage?.currentImagesCount || 0) + 1 : sub.usage?.currentImagesCount,
                   currentVideosCount: isVideo ? (sub.usage?.currentVideosCount || 0) + 1 : sub.usage?.currentVideosCount,
                 }
               }
             });
           }
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
            if (ownerUser.role !== 'admin' && ownerUser.activeSubscription) {
              const activeSub = ownerUser.activeSubscription;
              const subId = typeof activeSub === 'object' ? activeSub.id : activeSub;
              const isVideo = (doc.mimeType as string)?.startsWith("video/");
              const sub = await req.payload.findByID({ collection: 'subscriptions', id: subId, depth: 0 });
              
              await req.payload.update({
                collection: 'subscriptions',
                id: subId,
                data: {
                  usage: {
                    ...sub.usage,
                    currentImagesCount: !isVideo ? Math.max((sub.usage?.currentImagesCount || 0) - 1, 0) : sub.usage?.currentImagesCount,
                    currentVideosCount: isVideo ? Math.max((sub.usage?.currentVideosCount || 0) - 1, 0) : sub.usage?.currentVideosCount,
                  }
                }
              });
            }
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
