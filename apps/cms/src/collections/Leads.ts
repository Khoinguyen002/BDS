import type { CollectionConfig } from "payload";

export const leadsAccess: CollectionConfig["access"] = {
  create: () => true,
  read: ({ req: { user } }) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return { owner: { equals: user.id }, deleted: { not_equals: true } };
  },
  update: ({ req: { user } }) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return { owner: { equals: user.id } };
  },
  delete: ({ req: { user } }) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return { owner: { equals: user.id } };
  },
};

export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    useAsTitle: "name",
  },
  access: leadsAccess,
  fields: [
    { name: "name", type: "text", required: true },
    { name: "phone", type: "text", required: true },
    { name: "email", type: "text" },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    { name: "apartmentRef", type: "relationship", relationTo: "apartments" },
    {
      name: "type",
      type: "select",
      options: [
        { label: { vi: "Liên hệ Bán", en: "Sale Contact" }, value: "sale" },
        { label: { vi: "Liên hệ Thuê", en: "Rent Contact" }, value: "rent" },
        { label: { vi: "Đăng tin/Ký gửi", en: "Consignment" }, value: "consignment" },
      ],
      required: true,
      defaultValue: "sale",
    },
    { name: "message", type: "textarea" },
    {
      name: "status",
      type: "select",
      options: ["new", "contacted", "closed", "lost"],
      defaultValue: "new",
    },
    { name: "deleted", type: "checkbox", defaultValue: false },
    {
      name: "dedupeWarning",
      type: "checkbox",
      defaultValue: false,
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === "create" && data) {
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
          const existing = await req.payload.find({
            collection: "leads",
            where: {
              and: [
                { phone: { equals: data.phone } },
                { owner: { equals: data.owner } },
                {
                  createdAt: { greater_than_equal: twoHoursAgo.toISOString() },
                },
              ],
            },
            depth: 0,
            req,
          });

          if (existing.totalDocs > 0) {
            data.dedupeWarning = true;
          }
        }
        return data;
      },
    ],
  },
};
