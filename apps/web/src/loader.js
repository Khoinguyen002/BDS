export default function cloudflareLoader({ src, width, quality }) {
  if (src.includes('img.tenmiencua.com') || src.startsWith('http://localhost') || src.startsWith('https://images.unsplash.com')) {
    // If Cloudflare Image Resizing is ENABLED in the zone:
    // const url = new URL(src);
    // return `https://img.tenmiencua.com/cdn-cgi/image/width=${width},quality=${quality || 75}${url.pathname}`;
    
    // Serve directly to avoid next/image optimizing external domains without remotePatterns
    return src; 
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
