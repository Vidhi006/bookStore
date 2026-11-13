 import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/authCookie';

/**
 * Auth.js v5 cookie names. The `__Secure-` variants are used when Auth.js runs
 * over HTTPS in production. A few v4 names are cleared defensively too.
 */
const AUTHJS_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'authjs.csrf-token',
  '__Host-authjs.csrf-token',
  'authjs.callback-url',
  '__Secure-authjs.callback-url',
  'authjs.state',
  'authjs.nonce',
  'authjs.pkce.code_verifier',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.csrf-token',
  'next-auth.callback-url',
];

export async function POST() {
  const response = NextResponse.json({ success: true });

  // The application's own session cookie.
  clearAuthCookie(response);

  // The Auth.js session used only while an OAuth handshake completes.
  for (const name of AUTHJS_COOKIE_NAMES) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  return response;
}
