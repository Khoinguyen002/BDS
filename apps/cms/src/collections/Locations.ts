import { CollectionConfig } from 'payload';
import { triggerRevalidateWithCascade } from '../utils/revalidate';
import { COLLECTION_TAGS } from '@bds/shared/cache-tags';
import { formatSlug } from '../utils/formatSlug';

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'title',
    group: 'Master Data',
    defaultColumns: ['title', 'level', 'parent'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: "Tên khu vực", en: "Location Name" },
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      label: { vi: "Cấp độ", en: "Level" },
      options: [
        { label: { vi: "Thành phố / Tỉnh", en: "City / Province" }, value: "city" },
        { label: { vi: "Quận / Huyện", en: "District" }, value: "district" },
        { label: { vi: "Phường / Xã", en: "Ward" }, value: "ward" },
      ],
      defaultValue: "district",
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'locations',
      label: { vi: "Thuộc khu vực", en: "Parent Location" },
      admin: {
        condition: (data) => data.level === 'district' || data.level === 'ward',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { vi: "Hình ảnh", en: "Image" },
    },
  ],
  hooks: {
    afterChange: [
      ({ req }) => {
        triggerRevalidateWithCascade({ tag: COLLECTION_TAGS.locations, req });
      }
    ],
    afterDelete: [
      ({ req }) => {
        triggerRevalidateWithCascade({ tag: COLLECTION_TAGS.locations, req });
      }
    ]
  }
};
