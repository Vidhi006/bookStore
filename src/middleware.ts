import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AUTH_COOKIE_NAME } from '@/lib/authCookie';
import { JWT_SECRET } from '@/lib/jwtSecret';

const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Server-side guard for authenticated pages.
 *
 * Verifies the app's existing `bookhaven_auth` JWT (HS256) with `jose`, which
 * runs on the Edge runtime. The public site stays fully accessible; only the
 * account/admin areas require a session.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    try {
      await jwtVerify(token, secret, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch {
      // Expired or tampered token -> fall through to the login redirect.
    }
  }

  const loginUrl = new URL('/login', request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set('next', nextPath);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*', '/profile/:path*', '/checkout'],
};
