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
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: {
        description: 'Phosphor Icon component name (e.g., "SwimmingPool", "Barbell")',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
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
