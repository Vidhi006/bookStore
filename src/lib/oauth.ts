import { randomBytes } from 'crypto';

export type OAuthProvider = 'google' | 'facebook';

export const OAUTH_STATE_COOKIE = 'bookhaven_oauth_state';
export const OAUTH_PROVIDER_COOKIE = 'bookhaven_oauth_provider';

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_PROFILE_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

const FACEBOOK_AUTHORIZE_URL = 'https://www.facebook.com/v19.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';
const FACEBOOK_PROFILE_URL = 'https://graph.facebook.com/v19.0/me';

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === 'google' || value === 'facebook';
}

export function providerLabel(provider: OAuthProvider): string {
  return provider === 'google' ? 'Google' : 'Facebook';
}

export function getClientCredentials(provider: OAuthProvider) {
  if (provider === 'google') {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
    };
  }
  return {
    clientId: process.env.FACEBOOK_APP_ID?.trim() || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET?.trim() || '',
  };
}

export function isProviderConfigured(provider: OAuthProvider): boolean {
  const { clientId, clientSecret } = getClientCredentials(provider);
  return Boolean(clientId && clientSecret);
}

export function getBaseUrl(request: Request): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.APP_URL?.trim();
  const base = configured || new URL(request.url).origin;
  return base.replace(/\/+$/, '');
}

export function getRedirectUri(provider: OAuthProvider, request: Request): string {
  return `${getBaseUrl(request)}/api/auth/social/${provider}/callback`;
}

export function createState(): string {
  return randomBytes(24).toString('hex');
}

export function buildAuthorizeUrl(
  provider: OAuthProvider,
  request: Request,
  state: string
): string {
  const { clientId } = getClientCredentials(provider);
  const redirectUri = getRedirectUri(provider, request);

  if (provider === 'google') {
    const url = new URL(GOOGLE_AUTHORIZE_URL);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('prompt', 'select_account');
    url.searchParams.set('access_type', 'online');
    return url.toString();
  }

  const url = new URL(FACEBOOK_AUTHORIZE_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'email,public_profile');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function exchangeCodeForAccessToken(
  provider: OAuthProvider,
  code: string,
  request: Request
): Promise<string> {
  const { clientId, clientSecret } = getClientCredentials(provider);
  const redirectUri = getRedirectUri(provider, request);

  if (provider === 'google') {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) {
      throw new Error(data.error_description || data.error || 'Google token exchange failed.');
    }
    return data.access_token as string;
  }

  const url = new URL(FACEBOOK_TOKEN_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('client_secret', clientSecret);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('code', code);
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error?.message || data.error || 'Facebook token exchange failed.');
  }
  return data.access_token as string;
}

export interface OAuthProfile {
  email: string;
  name: string;
  picture?: string;
}

export async function fetchOAuthProfile(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthProfile> {
  if (provider === 'google') {
    const response = await fetch(GOOGLE_PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok || !data.email) {
      throw new Error(data.error_description || 'Google did not return an email address.');
    }
    return {
      email: String(data.email).toLowerCase(),
      name: String(data.name || data.email).trim(),
      picture: data.picture,
    };
  }

  const url = new URL(FACEBOOK_PROFILE_URL);
  url.searchParams.set('fields', 'id,name,email,picture.type(large)');
  url.searchParams.set('access_token', accessToken);
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Facebook profile request failed.');
  }
  if (!data.email) {
    throw new Error(
      'Facebook did not share an email address. Please make sure the email permission is granted.'
    );
  }
  return {
    email: String(data.email).toLowerCase(),
    name: String(data.name || data.email).trim(),
    picture: data.picture?.data?.url,
  };
}
