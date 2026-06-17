import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const slug = pathname.split('/')[1];
  if (!slug) return NextResponse.next();


  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
}
