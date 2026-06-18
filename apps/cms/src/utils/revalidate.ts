import type { PayloadRequest } from 'payload';
import { env } from '../env';

export const triggerRevalidatePaths = async (paths: string[]) => {
  try {
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
    console.error('Revalidation error', err);
  }
};

export const triggerRevalidateTag = async ({ tag, req }: { tag: string, req: PayloadRequest }) => {
  try {
    await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.REVALIDATE_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tag })
    });
  } catch (err) {
    req.payload.logger.error({ msg: 'Revalidation tag hook error', err });
  }
};
