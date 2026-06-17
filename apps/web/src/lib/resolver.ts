export async function resolveAgent(slug: string) {
  try {
    const res = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/landing-pages?where[slug][equals]=${slug}&depth=1`);
    const data = await res.json();
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    return null;
  } catch (error) {
    console.error('Error resolving agent:', error);
    return null;
  }
}
