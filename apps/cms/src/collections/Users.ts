import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { id: { equals: user?.id } };
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { id: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
    create: () => true,
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Agent', value: 'agent' },
      ],
      defaultValue: 'agent',
      required: true,
    },
    {
      name: 'subscription',
      type: 'group',
      fields: [
        { name: 'tier', type: 'select', options: ['free', 'pro'], defaultValue: 'free' },
        { name: 'expiresAt', type: 'date' },
        { name: 'lastPaymentId', type: 'text' },
      ]
    },
    {
      name: 'usage',
      type: 'group',
      fields: [
        { name: 'storageBytes', type: 'number', defaultValue: 0 },
      ]
    }
  ],
}
