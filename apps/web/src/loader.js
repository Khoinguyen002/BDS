export default function cloudflareLoader({ src, width, quality }: any) {
  if (src.includes('img.tenmiencua.com')) {
    // If Cloudflare Image Resizing is ENABLED in the zone:
    // const url = new URL(src);
    // return `https://img.tenmiencua.com/cdn-cgi/image/width=${width},quality=${quality || 75}${url.pathname}`;
    
    // If Cloudflare Image Resizing is DISABLED (MVP - serve original size):
    return src; 
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
