import { NextResponse } from 'next/server';
import { resetPassword } from '@/lib/authStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;
    if (!email || !code || !newPassword) return NextResponse.json({ error: 'Email, code, and new password are required.' }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

    const result = await resetPassword(email, code, newPassword);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('[reset-password]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
