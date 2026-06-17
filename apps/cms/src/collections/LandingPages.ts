import type { CollectionConfig } from 'payload'
import { getEffectiveTier, TIERS } from '@bds/shared'
import { triggerRevalidate } from '../utils/revalidate'

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
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
    useAsTitle: 'slug',
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      unique: true,
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'slugHistory',
      type: 'array',
      admin: {
        position: 'sidebar',
      },
      fields: [
        { name: 'oldSlug', type: 'text' }
      ]
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        {
          slug: 'heroBanner',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'subtitle', type: 'text' },
            { name: 'backgroundImage', type: 'relationship', relationTo: 'media' },
          ]
        },
        {
          slug: 'aboutAgent',
          fields: [
            { name: 'content', type: 'richText' },
            { name: 'avatar', type: 'relationship', relationTo: 'media' },
          ]
        },
        {
          slug: 'listApartments',
          fields: [
            {
              name: 'apartmentsFilter',
              type: 'relationship',
              relationTo: 'apartments',
              hasMany: true,
              filterOptions: ({ data, siblingData }: any) => {
                const ownerId = data?.owner || siblingData?.owner;
                if (ownerId) {
                  return { owner: { equals: ownerId } };
                }
                return false;
              }
            }
          ]
        },
        {
          slug: 'contactForm',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'placeholder', type: 'text' },
          ]
        }
      ]
    }
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (data?.owner && data?.blocks) {
          const user = await req.payload.findByID({ collection: 'users', id: data.owner as string, req })
          const tier = getEffectiveTier(user)
          if (data.blocks.length > TIERS[tier].maxBlocks) {
            throw new Error(`Maximum blocks limit reached for ${tier} tier.`)
          }
        }
        return data
      }
    ],
    afterChange: [
      async ({ doc, req }) => {
        await triggerRevalidate({ doc, req, collection: 'landing-pages' });
      }
    ]
  }
}
