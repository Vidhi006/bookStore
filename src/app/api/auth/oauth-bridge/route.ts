import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createTokenForUser, findUserById } from '@/lib/authStore';
import { setAuthCookie } from '@/lib/authCookie';

export const dynamic = 'force-dynamic';

/** Only allow same-origin relative paths as a post-login destination. */
function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

/**
 * Converts a completed Auth.js OAuth session into the application's existing
 * `bookhaven_auth` JWT cookie, then redirects to the requested page.
 */
export async function GET(request: NextRequest) {
  const nextPath = safeNextPath(request.nextUrl.searchParams.get('next'));

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.redirect(
      new URL('/login?socialError=oauth_failed', request.url)
    );
  }

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.redirect(
      new URL('/login?socialError=oauth_failed', request.url)
    );
  }

  const token = createTokenForUser(user);
  const response = NextResponse.redirect(new URL(nextPath, request.url));
  setAuthCookie(response, token);
  return response;
}
