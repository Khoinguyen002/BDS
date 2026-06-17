import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const slug = pathname.split('/')[1];
  if (!slug) return NextResponse.next();

  try {
    const res = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/landing-pages?where[slugHistory.oldSlug][equals]=${slug}&depth=0`);
    if (res.ok) {
      const data = await res.json();
      if (data.docs && data.docs.length > 0) {
        const actualSlug = data.docs[0].slug;
        if (actualSlug !== slug) {
          const rest = pathname.substring(slug.length + 1);
          return NextResponse.redirect(new URL(`/${actualSlug}${rest}`, request.url), 301);
        }
      }
    }
  } catch (err) {
    console.error('Middleware redirect check failed', err);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
}
