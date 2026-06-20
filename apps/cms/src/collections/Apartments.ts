import { CollectionConfig, APIError } from "payload";
import { getEffectiveTier, TIERS } from "@bds/shared";
import { triggerRevalidateTag } from "../utils/revalidate";
import { COLLECTION_TAGS, apartmentTag } from "@bds/shared/cache-tags";
import { formatSlug } from "../utils/formatSlug";

export const Apartments: CollectionConfig = {
  slug: "apartments",
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
  admin: {
    useAsTitle: "title",
  },
  fields: [
    // ── Sidebar ──────────────────────────────────────────────
    {
      name: "listingType",
      type: "select",
      label: { vi: "Hình thức", en: "Listing Type" },
      options: [
        { label: { vi: "Bán", en: "Sale" }, value: "sale" },
        { label: { vi: "Cho thuê", en: "Rent" }, value: "rent" },
      ],
      required: true,
      defaultValue: "sale",
      admin: { position: "sidebar" },
    },
    {
      // Loại hình & nhãn tự do (autocomplete + tạo mới tại chỗ) — thay propertyType.
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
      label: { vi: "Tags", en: "Tags" },
      admin: {
        position: "sidebar",
        allowCreate: true,
        description: {
          vi: "Loại hình & nhãn tự do (gõ để tìm hoặc thêm mới)",
          en: "Free-form type & labels",
        },
      },
    },

    // ── Nội dung chính ───────────────────────────────────────
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: { vi: "Tiêu đề", en: "Title" },
    },
    {
      name: "address",
      type: "text",
      localized: true,
      label: { vi: "Địa chỉ", en: "Address" },
    },
    {
      type: "collapsible",
      label: { vi: "Thư viện ảnh", en: "Gallery" },
      admin: { initCollapsed: true },
      fields: [
        {
          name: "gallery",
          type: "upload",
          relationTo: "media",
          hasMany: true,
          label: { vi: "Ảnh", en: "Images" },
        },
      ],
    },
    {
      name: "thumbnail",
      type: "upload",
      relationTo: "media",
      label: { vi: "Ảnh đại diện", en: "Thumbnail" },
      admin: {
        description: {
          vi: "Tự động lấy từ ảnh đầu tiên trong gallery nếu để trống",
          en: "Auto-filled from first gallery image if left empty",
        },
      },
    },
    {
      name: "tourUrl",
      type: "text",
      label: { vi: "Video/360 Tour URL", en: "Video/360 Tour URL" },
    },

    // Core facts — giữ structured để phục vụ search/card.
    {
      name: "keyFacts",
      type: "group",
      label: { vi: "Thông số cơ bản", en: "Key Facts" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "area",
              type: "number",
              label: { vi: "Diện tích (m2)", en: "Area (sqm)" },
            },
            {
              name: "bedrooms",
              type: "number",
              label: { vi: "Số phòng ngủ", en: "Bedrooms" },
            },
            {
              name: "bathrooms",
              type: "number",
              label: { vi: "Số phòng tắm", en: "Bathrooms" },
            },
          ],
        },
      ],
    },

    // Giá (core).
    {
      name: "pricingHeader",
      type: "ui",
      admin: {
        components: {
          Field: {
            path: "@/components/SectionDivider",
            clientProps: { label: "Giá" },
          },
        },
      },
    },
    {
      type: "row",
      fields: [
        { name: "price", type: "number", label: { vi: "Giá (VND)", en: "Price (VND)" } },
        {
          name: "priceUnit",
          type: "select",
          label: { vi: "Đơn vị giá", en: "Price Unit" },
          options: [
            { label: { vi: "Tổng giá", en: "Total" }, value: "total" },
            { label: { vi: "Mỗi tháng", en: "Per Month" }, value: "per_month" },
          ],
          admin: {
            readOnly: true,
            description: {
              vi: "Tự động theo Hình thức (Bán = tổng giá, Thuê = mỗi tháng)",
              en: "Auto-synced from Listing Type (Sale = total, Rent = per month)",
            },
          },
        },
      ],
    },

    // Vị trí (core — phục vụ filter + bản đồ).
    {
      name: "location",
      type: "group",
      label: { vi: "Vị trí & Tiện ích", en: "Location & Amenities" },
      fields: [
        {
          name: "region",
          type: "relationship",
          label: { vi: "Phường / Xã", en: "Ward" },
          relationTo: "locations",
          filterOptions: { level: { equals: "ward" } },
          admin: {
            description: "Chọn phường/xã cụ thể (VD: Thảo Điền, Phường 1...)",
            components: {
              Field: "@/components/LocationPickerField#LocationPickerField"
            }
          },
        },
        {
          name: "mapEmbedUrl",
          type: "text",
          label: { vi: "Google Maps Embed URL", en: "Google Maps Embed URL" },
          admin: {
            description: "Dán link embed từ Google Maps (VD: https://www.google.com/maps/embed?pb=...)",
          },
        },
        // Tiện ích (core).
        {
          name: "amenities",
          type: "relationship",
          label: { vi: "Tiện ích", en: "Amenities" },
          relationTo: "amenities",
          hasMany: true,
        },
      ],
    },

    // Nội dung chi tiết động — agent tự thêm section (tiêu đề + mô tả).
    {
      name: "sections",
      type: "array",
      label: { vi: "Nội dung chi tiết", en: "Detail Sections" },
      labels: {
        singular: { vi: "Section", en: "Section" },
        plural: { vi: "Sections", en: "Sections" },
      },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "@/components/SectionRowLabel#SectionRowLabel",
        },
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
          label: { vi: "Tiêu đề", en: "Title" },
        },
        {
          name: "body",
          type: "richText",
          localized: true,
          label: { vi: "Nội dung", en: "Body" },
        },
      ],
    },

    // ── Sidebar (hệ thống) ───────────────────────────────────
    {
      name: "slug",
      type: "text",
      label: { vi: "Đường dẫn (Slug)", en: "Slug" },
      unique: true,
      index: true,
      hooks: { beforeValidate: [formatSlug("title")] },
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "owner",
      type: "relationship",
      label: { vi: "Chủ sở hữu", en: "Owner" },
      relationTo: "users",
      required: true,
      defaultValue: ({ req }) => req.user?.id,
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === "create" && req.user) {
          const user = req.user;
          const tier = getEffectiveTier(user);

          const count = await req.payload.count({
            collection: "apartments",
            where: { owner: { equals: user.id } },
            req,
          });

          if (count.totalDocs >= TIERS[tier].maxApt) {
            throw new APIError(
              `Maximum apartments limit reached for ${tier} tier.`,
              400,
              undefined,
              true,
            );
          }
        }
        return data;
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Auto sync priceUnit theo listingType
        if (data.listingType === "sale") {
          data.priceUnit = "total";
        } else if (data.listingType === "rent") {
          data.priceUnit = "per_month";
        }
        // Auto sync thumbnail từ gallery[0]
        if (
          !data.thumbnail &&
          Array.isArray(data.gallery) &&
          data.gallery.length > 0
        ) {
          const first = data.gallery[0];
          data.thumbnail = typeof first === "object" && first !== null ? first.id : first;
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Collection tag: mọi list/filter. Per-doc tag: trang detail (fetch theo
        // slug hoặc id → purge cả hai biến thể). Đổi slug thì purge cả slug cũ.
        const tags = [
          COLLECTION_TAGS.apartments,
          apartmentTag(doc.slug),
          apartmentTag(doc.id),
        ];
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
          tags.push(apartmentTag(previousDoc.slug));
        }
        await triggerRevalidateTag({ tag: tags, req });
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await triggerRevalidateTag({
          tag: [
            COLLECTION_TAGS.apartments,
            apartmentTag(doc.slug),
            apartmentTag(doc.id),
          ],
          req,
        });
      },
    ],
  },
};
