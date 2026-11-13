import { NextResponse } from 'next/server';
import { issueVerificationCode } from '@/lib/authStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    const result = await issueVerificationCode(email);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({
      success: true,
      message: 'A fresh 6-digit verification code has been sent to your email.',
    });
  } catch (err) {
    console.error('[resend-code error]:', err);
    return NextResponse.json({ error: 'Internal server error while resending code.' }, { status: 500 });
  }
}
