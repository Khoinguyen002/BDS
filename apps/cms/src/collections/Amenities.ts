import { CollectionConfig } from 'payload';
import { triggerRevalidateTag } from '../utils/revalidate';

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: {
    useAsTitle: 'title',
    group: 'Master Data',
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
      label: { vi: "Tên tiện ích", en: "Title" },
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      label: { vi: "Biểu tượng (Icon)", en: "Icon" },
      admin: {
        description: 'Phosphor Icon component name (e.g., "SwimmingPool", "Barbell")',
        components: {
          Field: '@/components/IconPickerField#IconPickerField',
        },
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: { vi: "Phân loại", en: "Category" },
      options: [
        { label: 'Internal (Nội khu)', value: 'internal' },
        { label: 'External (Ngoại khu)', value: 'external' },
      ],
      defaultValue: 'internal',
    },
  ],
  hooks: {
    afterChange: [
      ({ req }) => {
        triggerRevalidateTag({ tag: 'amenities', req });
      }
    ],
    afterDelete: [
      ({ req }) => {
        triggerRevalidateTag({ tag: 'amenities', req });
      }
    ]
  }
};
