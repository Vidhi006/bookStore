import { NextRequest, NextResponse } from 'next/server';
import {
  OAUTH_PROVIDER_COOKIE,
  OAUTH_STATE_COOKIE,
  buildAuthorizeUrl,
  createState,
  isOAuthProvider,
  isProviderConfigured,
} from '@/lib/oauth';

export const dynamic = 'force-dynamic';

const COOKIE_MAX_AGE = 10 * 60;

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;

  if (!isOAuthProvider(provider)) {
    return NextResponse.redirect(new URL('/login?socialError=unsupported_provider', request.url));
  }

  if (!isProviderConfigured(provider)) {
    return NextResponse.redirect(
      new URL(`/login?socialError=${provider}_not_configured`, request.url)
    );
  }

  const state = createState();
  const response = NextResponse.redirect(buildAuthorizeUrl(provider, request, state));

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  };

  response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(OAUTH_PROVIDER_COOKIE, provider, cookieOptions);

  return response;
}
