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
    { name: "name", type: "text", required: true, label: { vi: "Họ và tên", en: "Name" } },
    { name: "phone", type: "text", required: true, label: { vi: "Số điện thoại", en: "Phone" } },
    { name: "email", type: "text", label: { vi: "Email", en: "Email" } },
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      label: { vi: "Agent quản lý", en: "Owner Agent" },
    },
    { name: "apartmentRef", type: "relationship", relationTo: "apartments", label: { vi: "Căn hộ liên quan", en: "Related Apartment" } },
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
      label: { vi: "Loại liên hệ", en: "Type" },
    },
    { name: "message", type: "textarea", label: { vi: "Lời nhắn", en: "Message" } },
    {
      name: "status",
      type: "select",
      label: { vi: "Trạng thái", en: "Status" },
      options: [
        { label: { vi: "Mới", en: "New" }, value: "new" },
        { label: { vi: "Đã liên hệ", en: "Contacted" }, value: "contacted" },
        { label: { vi: "Thành công", en: "Closed" }, value: "closed" },
        { label: { vi: "Thất bại", en: "Lost" }, value: "lost" }
      ],
      defaultValue: "new",
    },
    { name: "deleted", type: "checkbox", defaultValue: false, label: { vi: "Đã xóa", en: "Deleted" } },
    {
      name: "dedupeWarning",
      type: "checkbox",
      defaultValue: false,
      label: { vi: "Cảnh báo trùng lặp (Spam)", en: "Dedupe Warning" },
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
