import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import connectMongoDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import { createTokenForUser } from '@/lib/authStore';
import { setAuthCookie } from '@/lib/authCookie';
import {
  OAUTH_PROVIDER_COOKIE,
  OAUTH_STATE_COOKIE,
  exchangeCodeForAccessToken,
  fetchOAuthProfile,
  isOAuthProvider,
  isProviderConfigured,
} from '@/lib/oauth';

export const dynamic = 'force-dynamic';

function failure(request: NextRequest, reason: string) {
  const url = new URL('/login', request.url);
  url.searchParams.set('socialError', reason);
  return NextResponse.redirect(url);
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 });
  response.cookies.set(OAUTH_PROVIDER_COOKIE, '', { path: '/', maxAge: 0 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;

  if (!isOAuthProvider(provider)) {
    return failure(request, 'unsupported_provider');
  }

  if (!isProviderConfigured(provider)) {
    return failure(request, `${provider}_not_configured`);
  }

  const searchParams = request.nextUrl.searchParams;
  const oauthError = searchParams.get('error');
  if (oauthError) {
    const reason = oauthError === 'access_denied' ? 'access_denied' : 'oauth_failed';
    const response = failure(request, reason);
    clearOAuthCookies(response);
    return response;
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const storedProvider = request.cookies.get(OAUTH_PROVIDER_COOKIE)?.value;

  if (!code || !state || !storedState || state !== storedState || storedProvider !== provider) {
    const response = failure(request, 'invalid_state');
    clearOAuthCookies(response);
    return response;
  }

  try {
    const accessToken = await exchangeCodeForAccessToken(provider, code, request);
    const profile = await fetchOAuthProfile(provider, accessToken);

    await connectMongoDB();

    let user = await UserModel.findOne({ email: profile.email });
    if (!user) {
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
      try {
        user = await UserModel.create({
          name: profile.name,
          email: profile.email,
          passwordHash,
          role: 'customer',
          isEmailVerified: true,
          addresses: [],
          wishlist: [],
          purchases: [],
        });
      } catch (createError) {
        // A concurrent request may have created the same account first.
        user = await UserModel.findOne({ email: profile.email });
        if (!user) throw createError;
      }
    } else if (!user.isEmailVerified || !user.name) {
      user.isEmailVerified = true;
      if (!user.name) user.name = profile.name;
      await user.save();
    }

    const token = createTokenForUser(user);
    const response = NextResponse.redirect(new URL('/', request.url));
    setAuthCookie(response, token);
    clearOAuthCookies(response);
    return response;
  } catch (error) {
    console.error(`[${provider} oauth callback]`, error);
    const response = failure(request, 'oauth_failed');
    clearOAuthCookies(response);
    return response;
  }
}
