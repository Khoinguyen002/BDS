export const triggerRevalidate = async ({ doc, req, collection }: any) => {
  if (!doc.owner) return;
  
  const landing = await req.payload.find({
    collection: 'landing-pages',
    where: { owner: { equals: doc.owner } },
    depth: 0,
    req,
  });
  const agentSlug = landing.docs[0]?.slug;
  if (!agentSlug) return;
  
  try {
    const paths = [`/${agentSlug}`];
    if (collection === 'apartments' && doc.slug) {
      paths.push(`/${agentSlug}/can-ho/${doc.slug}`);
    }

    await Promise.all(paths.map(path => 
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REVALIDATE_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      })
    ));
  } catch (err) {
    req.payload.logger.error({ msg: 'Revalidation hook error', err });
  }
};
