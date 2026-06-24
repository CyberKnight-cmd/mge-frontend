import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/oauth2/callback'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('mge_logged_in')?.value;

  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authCookie === 'pending' && pathname !== '/complete-profile') {
    return NextResponse.redirect(new URL('/complete-profile', request.url));
  }

  if (authCookie === '1' && pathname === '/complete-profile') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
