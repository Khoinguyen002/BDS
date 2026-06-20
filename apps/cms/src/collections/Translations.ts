import type { CollectionConfig } from 'payload';
import { triggerRevalidateTag } from '../utils/revalidate';
import { COLLECTION_TAGS } from '@bds/shared/cache-tags';

export const Translations: CollectionConfig = {
  slug: 'translations',
  admin: {
    useAsTitle: 'key',
    description: 'Manage localization strings for the frontend.',
    group: 'Settings',
    components: {
      beforeList: [
        '@/components/TranslationActions#TranslationActions',
      ],
    },
  },
  access: {
    read: () => true, // Anyone can read translations to display them
  },
  hooks: {
    afterChange: [
      ({ req }) => {
        triggerRevalidateTag({ tag: COLLECTION_TAGS.translations, req });
      }
    ],
    afterDelete: [
      ({ req }) => {
        triggerRevalidateTag({ tag: COLLECTION_TAGS.translations, req });
      }
    ],
  },
  endpoints: [
    {
      path: '/export',
      method: 'get',
      handler: async (req) => {
        const result = await req.payload.find({
          collection: 'translations',
          limit: 10000,
          depth: 0,
          locale: 'all',
        });
        return Response.json(result.docs);
      },
    },
    {
      path: '/import',
      method: 'post',
      handler: async (req) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = await (req as any).json();
          if (!Array.isArray(data)) {
            return Response.json({ error: 'Expected an array of translations' }, { status: 400 });
          }

          let importedCount = 0;
          for (const item of data) {
            if (!item.key || !item.value) continue;
            
            const existing = await req.payload.find({
              collection: 'translations',
              where: { key: { equals: item.key } },
              depth: 0,
            });

            if (existing.docs.length > 0) {
              const docId = existing.docs[0].id;
              // update each locale
              for (const [locale, val] of Object.entries(item.value)) {
                if (typeof val === 'string') {
                  await req.payload.update({
                    collection: 'translations',
                    id: docId,
                    data: { value: val },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    locale: locale as any,
                  });
                }
              }
            } else {
              // Create default doc first (e.g. using 'vi' if present, or first key)
              const locales = Object.keys(item.value);
              if (locales.length === 0) continue;
              const firstLocale = locales[0];

              const newDoc = await req.payload.create({
                collection: 'translations',
                data: {
                  key: item.key,
                  namespace: item.namespace || 'common',
                  value: item.value[firstLocale],
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                locale: firstLocale as any,
              });

              // Update the rest
              for (const locale of locales.slice(1)) {
                await req.payload.update({
                  collection: 'translations',
                  id: newDoc.id,
                  data: { value: item.value[locale] },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  locale: locale as any,
                });
              }
            }
            importedCount++;
          }
          return Response.json({ success: true, count: importedCount });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          return Response.json({ error: err.message }, { status: 500 });
        }
      },
    },
  ],
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Key format: namespace.key (e.g. hero.title)',
      },
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      localized: true, // This field is translated
    },
    {
      name: 'namespace',
      type: 'select',
      options: [
        { label: 'Common', value: 'common' },
        { label: 'Hero', value: 'hero' },
        { label: 'Navigation', value: 'nav' },
        { label: 'Footer', value: 'footer' },
        { label: 'Apartments', value: 'apartments' },
        { label: 'Agent', value: 'agent' },
        { label: 'Contact', value: 'contact' },
      ],
      defaultValue: 'common',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
