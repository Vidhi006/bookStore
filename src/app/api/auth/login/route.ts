import { NextResponse } from 'next/server';
import {
  issueVerificationCode,
  verifyPassword,
  sanitizeUser,
  createTokenForUser,
  seedDemoAccounts,
} from '@/lib/authStore';
import { setAuthCookie } from '@/lib/authCookie';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Make the documented demo accounts available on a fresh database.
    const normalizedEmail = String(email).trim().toLowerCase();
    if (normalizedEmail === 'customer@bookhaven.com' || normalizedEmail === 'admin@bookhaven.com') {
      try {
        await seedDemoAccounts();
      } catch (seedError) {
        console.error('[login demo seed]', seedError);
      }
    }

    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (!user.isEmailVerified) {
      const delivery = await issueVerificationCode(user.email);
      if (!delivery.success) {
        return NextResponse.json(
          { error: delivery.error || 'Unable to send email verification code.' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          requireVerification: true,
          email: user.email,
          message: 'Please verify your email address. A 6-digit verification code has been dispatched to your email.',
        },
        { status: 403 }
      );
    }

    const token = createTokenForUser(user);
    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      user: sanitizeUser(user),
    });
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Internal server error during login.' }, { status: 500 });
  }
}
