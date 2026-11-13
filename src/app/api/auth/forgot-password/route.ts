import { NextResponse } from 'next/server';
import { issueResetCode } from '@/lib/authStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    const result = await issueResetCode(email);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({
      success: true,
      message: 'Password reset OTP has been sent to your email address.',
    });
  } catch (err) {
    console.error('[forgot-password error]:', err);
    return NextResponse.json({ error: 'Internal server error while requesting password reset.' }, { status: 500 });
  }
}
