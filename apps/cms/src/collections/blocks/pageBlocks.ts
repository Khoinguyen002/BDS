import type { Block } from "payload";
import type { LandingPage } from "@bds/shared/payload-types";

export const pageBlocks: Block[] = [
  {
    slug: "heroBanner",
    imageURL: "/blocks/hero-banner.png",
    fields: [
      { name: "title", type: "text", required: true, localized: true },
      { name: "subtitle", type: "text", localized: true },
      {
        name: "backgroundImage",
        type: "relationship",
        relationTo: "media",
      },
    ],
  },
  {
    slug: "aboutAgent",
    imageURL: "/blocks/about-agent.png",
    fields: [
      { name: "content", type: "richText", localized: true },
      { name: "avatar", type: "relationship", relationTo: "media" },
    ],
  },
  {
    slug: "listApartments",
    imageURL: "/blocks/list-apartments.png",
    fields: [
      {
        name: "apartmentsFilter",
        type: "relationship",
        relationTo: "apartments",
        hasMany: true,
        filterOptions: ({ data, siblingData }) => {
          const owner =
            (data as Partial<LandingPage>)?.owner ||
            (siblingData as Partial<LandingPage>)?.owner;
            
          const ownerId = typeof owner === 'object' && owner !== null && 'id' in owner ? owner.id : owner;

          if (ownerId) {
            return { owner: { equals: ownerId } };
          }
          
          // Trả về một object Where hợp lệ để cho phép tất cả các bản ghi
          return { id: { exists: true } };
        },
      },
    ],
  },
  {
    slug: "contactForm",
    imageURL: "/blocks/contact-form.png",
    fields: [
      { name: "title", type: "text", localized: true },
      { name: "placeholder", type: "text", localized: true },
    ],
  },
];
