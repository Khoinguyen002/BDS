import type { CollectionSlug, Plugin } from "payload";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import type {
  Adapter,
  GeneratedAdapter,
} from "@payloadcms/plugin-cloud-storage/types";
import { v2 as cloudinary } from "cloudinary";

type CloudinaryStorageArgs = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  /** Thư mục Cloudinary để chứa upload (vd "bds"). */
  folder?: string;
  /** Collections áp dụng (vd { media: true }). */
  collections: Record<string, true | { prefix?: string }>;
};

const stripExt = (name: string) => name.replace(/\.[^./]+$/, "");

/**
 * Storage adapter đẩy media của Payload lên Cloudinary.
 *
 * Cloudinary không S3-compatible nên không dùng được @payloadcms/storage-s3.
 * Adapter này tự upload buffer qua Cloudinary SDK và lưu public_id + secure_url
 * vào các field ẩn trên doc Media để generateURL/handleDelete dùng lại.
 */
const createCloudinaryAdapter =
  (args: CloudinaryStorageArgs): Adapter =>
  (): GeneratedAdapter => ({
    name: "cloudinary",
    fields: [
      { name: "cloudinaryPublicId", type: "text", admin: { hidden: true } },
      { name: "cloudinaryURL", type: "text", admin: { hidden: true } },
      {
        name: "cloudinaryResourceType",
        type: "text",
        admin: { hidden: true },
      },
    ],
    handleUpload: async ({ file, data }) => {
      const publicId = `${args.folder ? `${args.folder}/` : ""}${stripExt(file.filename)}`;
      const result = await new Promise<{
        public_id: string;
        secure_url: string;
        resource_type: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: "auto",
            overwrite: true,
            use_filename: false,
            unique_filename: false,
          },
          (err, res) => {
            if (err || !res) reject(err ?? new Error("Cloudinary upload failed"));
            else resolve(res as never);
          },
        );
        stream.end(file.buffer);
      });

      data.cloudinaryPublicId = result.public_id;
      data.cloudinaryURL = result.secure_url;
      data.cloudinaryResourceType = result.resource_type;
      data.url = result.secure_url;
      return data;
    },
    generateURL: ({ data }) => (data?.cloudinaryURL as string) ?? "",
    // disablePayloadAccessControl=true nên serving đi thẳng Cloudinary CDN;
    // staticHandler chỉ là fallback cho route /api/<col>/file/<filename>.
    staticHandler: async (req, { params }) => {
      const result = await req.payload.find({
        collection: params.collection as CollectionSlug,
        where: { filename: { equals: params.filename } },
        limit: 1,
        depth: 0,
      });
      const url = (result.docs?.[0] as { cloudinaryURL?: string } | undefined)
        ?.cloudinaryURL;
      if (url) return Response.redirect(url, 302);
      return new Response(null, { status: 404 });
    },
    handleDelete: async ({ doc }) => {
      const publicId = (doc as { cloudinaryPublicId?: string }).cloudinaryPublicId;
      if (!publicId) return;
      await cloudinary.uploader.destroy(publicId, {
        resource_type:
          (doc as { cloudinaryResourceType?: string }).cloudinaryResourceType ??
          "image",
        invalidate: true,
      });
    },
  });

export const cloudinaryStorage = (args: CloudinaryStorageArgs): Plugin => {
  cloudinary.config({
    cloud_name: args.cloudName,
    api_key: args.apiKey,
    api_secret: args.apiSecret,
    secure: true,
  });

  const adapter = createCloudinaryAdapter(args);

  return cloudStoragePlugin({
    collections: Object.fromEntries(
      Object.entries(args.collections).map(([slug, value]) => [
        slug,
        {
          adapter,
          // Phục vụ trực tiếp từ Cloudinary CDN (URL tuyệt đối), không proxy qua Payload.
          disablePayloadAccessControl: true,
          prefix: typeof value === "object" ? value.prefix : undefined,
        },
      ]),
    ),
  });
};
