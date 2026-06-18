import type { PayloadRequest } from 'payload';
import type { LandingPage, Apartment } from '@bds/shared/payload-types';
import { env } from '../env';

export const triggerRevalidate = async ({ doc, req, collection }: { doc: Partial<LandingPage & Apartment>, req: PayloadRequest, collection: string }) => {
  if (!doc.owner) return;
  
  const ownerId = typeof doc.owner === 'object' ? doc.owner.id : doc.owner;
  if (!ownerId) return;

  const userDoc = await req.payload.findByID({
    collection: 'users',
    id: ownerId as number,
    req,
  });
  const agentSlug = userDoc?.agentSlug;
  if (!agentSlug) return;
  
  try {
    const paths = [`/${agentSlug}`];
    if (collection === 'apartments' && doc.slug) {
      paths.push(`/${agentSlug}/can-ho/${doc.slug}`);
    }

    await Promise.all(paths.map(path => 
      fetch(`${env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.REVALIDATE_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      })
    ));
  } catch (err) {
    req.payload.logger.error({ msg: 'Revalidation hook error', err });
  }
};
