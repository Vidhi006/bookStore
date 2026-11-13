import { NextResponse } from 'next/server';
import { verifyUserCode } from '@/lib/authStore';
import { setAuthCookie } from '@/lib/authCookie';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const result = await verifyUserCode(email, code);
    if (!result.success || !result.user || !result.token) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Email verified! You now have full access.',
      user: result.user,
    });
    setAuthCookie(response, result.token);
    return response;
  } catch (err) {
    console.error('[verify-email]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
