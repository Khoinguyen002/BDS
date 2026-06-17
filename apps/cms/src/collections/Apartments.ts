import type { CollectionConfig } from 'payload'
import { getEffectiveTier, TIERS } from '@bds/shared'
import { triggerRevalidate } from '../utils/revalidate'

export const Apartments: CollectionConfig = {
  slug: 'apartments',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { owner: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { owner: { equals: user?.id } };
    },
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ req }: any) => req.user?.id,
      admin: { position: 'sidebar' }
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    { name: 'price', type: 'number' },
    { name: 'address', type: 'text' },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          const user = req.user
          const tier = getEffectiveTier(user)
          
          const count = await req.payload.count({
            collection: 'apartments',
            where: { owner: { equals: user.id } },
            req,
          })

          if (count.totalDocs >= TIERS[tier].maxApt) {
            throw new Error(`Maximum apartments limit reached for ${tier} tier.`)
          }
        }
        return data
      }
    ],
    afterChange: [
      async ({ doc, req }) => {
        await triggerRevalidate({ doc, req, collection: 'apartments' });
      }
    ]
  }
}
