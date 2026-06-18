import { CollectionConfig, APIError } from "payload";
import { getEffectiveTier, TIERS } from "@bds/shared";
import { triggerRevalidatePaths } from "../utils/revalidate";
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
    {
      name: "listingType",
      type: "select",
      options: [
        { label: { vi: "Bán", en: "Sale" }, value: "sale" },
        { label: { vi: "Cho thuê", en: "Rent" }, value: "rent" },
      ],
      required: true,
      defaultValue: "sale",
      admin: {
        position: "sidebar",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Basic Info",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              localized: true,
            },
            { name: "address", type: "text", localized: true },
            {
              name: "gallery",
              type: "upload",
              relationTo: "media",
              hasMany: true,
            },
            { name: "tourUrl", type: "text", label: "Video/360 Tour URL" },
            {
              name: "details",
              type: "group",
              fields: [
                { name: "overview", type: "richText" },
                { name: "highlights", type: "richText" },
                { name: "landscape", type: "richText" },
              ],
            },
          ],
        },
        {
          label: "Key Facts",
          fields: [
            {
              name: "keyFacts",
              type: "group",
              fields: [
                { name: "direction", type: "text", localized: true },
                { name: "balconyDirection", type: "text", localized: true },
                {
                  name: "floorLevel",
                  type: "select",
                  options: [
                    { label: { vi: "Thấp", en: "Low" }, value: "low" },
                    { label: { vi: "Trung", en: "Mid" }, value: "mid" },
                    { label: { vi: "Cao", en: "High" }, value: "high" },
                  ],
                },
                { name: "area", type: "number" },
                { name: "bedrooms", type: "number" },
                { name: "bathrooms", type: "number" },
                // Rent Specific Key Facts
                {
                  name: "furnitureStatus",
                  type: "select",
                  options: [
                    { label: { vi: "Nhà trống", en: "Empty" }, value: "empty" },
                    { label: { vi: "Nội thất cơ bản", en: "Basic Furniture" }, value: "basic" },
                    { label: { vi: "Đầy đủ nội thất", en: "Fully Furnished" }, value: "full" },
                  ],
                  admin: { condition: (data) => data.listingType === "rent" },
                },
                {
                  name: "petFriendly",
                  type: "checkbox",
                  admin: { condition: (data) => data.listingType === "rent" },
                },
                {
                  name: "freeHours",
                  type: "checkbox",
                  admin: { condition: (data) => data.listingType === "rent" },
                },
                // Sale Specific Key Facts
                {
                  name: "handoverYear",
                  type: "number",
                  admin: { condition: (data) => data.listingType === "sale" },
                },
                {
                  name: "buildingQuality",
                  type: "select",
                  options: [
                    { label: { vi: "Mới xây", en: "Brand New" }, value: "new" },
                    { label: { vi: "Đã sửa chữa", en: "Renovated" }, value: "renovated" },
                    { label: { vi: "Cũ", en: "Old" }, value: "old" },
                  ],
                  admin: { condition: (data) => data.listingType === "sale" },
                },
              ],
            },
          ],
        },
        {
          label: "Pricing & Legal",
          fields: [
            { name: "price", type: "number", label: "Base Price" },
            {
              name: "priceBreakdown",
              type: "group",
              admin: { condition: (data) => data.listingType === "sale" },
              fields: [
                { name: "totalPrice", type: "number" },
                { name: "pricePerSqm", type: "number" },
                { name: "transferFee", type: "text", localized: true },
                {
                  name: "taxResponsibility",
                  type: "select",
                  options: [
                    { label: { vi: "Người mua chịu", en: "Buyer" }, value: "buyer" },
                    { label: { vi: "Người bán chịu", en: "Seller" }, value: "seller" },
                    { label: { vi: "Thỏa thuận", en: "Negotiated" }, value: "negotiated" },
                  ],
                },
                { name: "managementFee", type: "number" },
                { name: "negotiable", type: "checkbox", defaultValue: true },
              ],
            },
            {
              name: "rentPricing",
              type: "group",
              admin: { condition: (data) => data.listingType === "rent" },
              fields: [
                { name: "pricePerMonth", type: "number" },
                {
                  name: "deposit",
                  type: "select",
                  options: [
                    { label: { vi: "1 tháng", en: "1 Month" }, value: "1_month" },
                    { label: { vi: "2 tháng", en: "2 Months" }, value: "2_months" },
                    { label: { vi: "3 tháng", en: "3 Months" }, value: "3_months" },
                    { label: { vi: "Khác", en: "Other" }, value: "other" },
                  ],
                },
                {
                  name: "utilitiesPrice",
                  type: "select",
                  options: [
                    { label: { vi: "Giá nhà nước", en: "State Price" }, value: "state" },
                    { label: { vi: "Giá dịch vụ/kinh doanh", en: "Business Price" }, value: "business" },
                    { label: { vi: "Thỏa thuận", en: "Negotiated" }, value: "negotiated" },
                  ],
                },
                {
                  name: "minLeaseTerm",
                  type: "number",
                  label: "Min Lease Term (Months)",
                },
                { name: "availableDate", type: "date" },
                {
                  name: "managementFeeIncluded",
                  type: "checkbox",
                  defaultValue: false,
                },
                { name: "negotiable", type: "checkbox", defaultValue: true },
              ],
            },
            {
              name: "legal",
              type: "group",
              admin: { condition: (data) => data.listingType === "sale" },
              fields: [
                {
                  name: "documentType",
                  type: "select",
                  options: [
                    { label: { vi: "Sổ hồng", en: "Pink Book" }, value: "pink_book" },
                    { label: { vi: "Hợp đồng mua bán", en: "Sale Contract" }, value: "sale_contract" },
                    { label: { vi: "Khác", en: "Other" }, value: "other" },
                  ],
                },
                {
                  name: "ownershipTerm",
                  type: "select",
                  options: [
                    { label: { vi: "Lâu dài", en: "Long Term" }, value: "long_term" },
                    { label: { vi: "50 năm", en: "50 Years" }, value: "50_years" },
                  ],
                },
                { name: "bankMortgaged", type: "checkbox" },
                { name: "bankSupportPercentage", type: "number" },
              ],
            },
          ],
        },
        {
          label: "Location & Amenities",
          fields: [
            {
              name: "location",
              type: "group",
              fields: [
                { name: "lat", type: "number" },
                { name: "lng", type: "number" },
              ],
            },
            {
              name: "amenities",
              type: "relationship",
              relationTo: "amenities",
              hasMany: true,
            },
          ],
        },
        {
          label: "Investment",
          admin: { condition: (data) => data.listingType === "sale" },
          fields: [
            {
              name: "investment",
              type: "group",
              fields: [{ name: "rentalYield", type: "number" }],
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      type: "text",
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
    {
      name: "owner",
      type: "relationship",
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
    afterChange: [
      async ({ doc, req }) => {
        if (doc.owner) {
          const ownerId =
            typeof doc.owner === "object" ? doc.owner.id : doc.owner;
          const userDoc = await req.payload.findByID({
            collection: "users",
            id: ownerId as number,
            req,
          });
          if (userDoc?.agentSlug) {
            const paths = [
              `/vi`,
              `/en`,
              `/vi/${userDoc.agentSlug}`,
              `/en/${userDoc.agentSlug}`,
              `/vi/${userDoc.agentSlug}/apartments`,
              `/en/${userDoc.agentSlug}/apartments`,
            ];
            if (doc.slug) {
              paths.push(`/vi/${userDoc.agentSlug}/apartments/${doc.slug}`);
              paths.push(`/en/${userDoc.agentSlug}/apartments/${doc.slug}`);
            }
            await triggerRevalidatePaths(paths);
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (doc.owner) {
          const ownerId =
            typeof doc.owner === "object" ? doc.owner.id : doc.owner;
          const userDoc = await req.payload.findByID({
            collection: "users",
            id: ownerId as number,
            req,
          });
          if (userDoc?.agentSlug) {
            const paths = [
              `/vi`,
              `/en`,
              `/vi/${userDoc.agentSlug}`,
              `/en/${userDoc.agentSlug}`,
              `/vi/${userDoc.agentSlug}/apartments`,
              `/en/${userDoc.agentSlug}/apartments`,
            ];
            if (doc.slug) {
              paths.push(`/vi/${userDoc.agentSlug}/apartments/${doc.slug}`);
              paths.push(`/en/${userDoc.agentSlug}/apartments/${doc.slug}`);
            }
            await triggerRevalidatePaths(paths);
          }
        }
      },
    ],
  },
};
