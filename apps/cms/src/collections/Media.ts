import type { CollectionConfig } from 'payload'
import { getEffectiveTier, TIERS } from '@bds/shared'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    disableLocalStorage: true,
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ req }: any) => req.user?.id,
      admin: {
        position: 'sidebar',
      }
    }
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          const user = req.user
          const file = req.file
          if (!file) return data

          const tier = getEffectiveTier(user)
          
          if (file.mimeType?.startsWith('video/') && !TIERS[tier].video) {
            throw new Error(`Your ${tier} tier does not support video uploads.`)
          }

          const storageBytes = user.usage?.storageBytes || 0
          const maxStorageBytes = TIERS[tier].maxStorageMB * 1024 * 1024

          if (storageBytes + file.size > maxStorageBytes) {
            throw new Error(`Storage limit exceeded. Upgrade to pro.`)
          }
        }
        return data
      }
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' && req.user && req.file) {
          const ownerUser = await req.payload.findByID({ collection: 'users', id: req.user.id as string, req })
          const newSize = (ownerUser.usage?.storageBytes || 0) + req.file.size
          await req.payload.update({
            collection: 'users',
            id: ownerUser.id,
            data: { usage: { storageBytes: newSize } },
            req,
          })
        }
      }
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const apts = await req.payload.find({
          collection: 'apartments',
          where: { gallery: { equals: id } },
          depth: 0,
          req,
        })
        if (apts.totalDocs > 0) {
          throw new Error('Cannot delete media because it is used in an apartment gallery.')
        }

        const pages = await req.payload.find({
          collection: 'landing-pages',
          where: {
            or: [
              { 'blocks.backgroundImage': { equals: id } },
              { 'blocks.avatar': { equals: id } }
            ]
          },
          depth: 0,
          req,
        })
        if (pages.totalDocs > 0) {
          throw new Error('Cannot delete media because it is used in a landing page.')
        }
      }
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (doc.owner) {
          const ownerUser = await req.payload.findByID({ collection: 'users', id: doc.owner as string, req })
          const newSize = Math.max(0, (ownerUser.usage?.storageBytes || 0) - doc.filesize)
          await req.payload.update({
            collection: 'users',
            id: ownerUser.id,
            data: { usage: { storageBytes: newSize } },
            req,
          })
        }
      }
    ]
  }
}
