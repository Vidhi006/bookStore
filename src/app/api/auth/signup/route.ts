import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/authStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, mobile } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (mobile && !/^[0-9+\-\s]{7,15}$/.test(String(mobile).trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid mobile number.' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const { user, emailSent, emailError } = await createUser({
      name,
      email,
      password,
      mobile: mobile ? String(mobile) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        emailSent,
        message: emailSent
          ? 'Account created! Verification code sent to your email.'
          : 'Account created, but the verification email could not be sent. Request a new code to continue.',
        ...(emailError ? { emailError } : {}),
        user,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[signup error]:', err);
    return NextResponse.json(
      { error: 'Internal server error while creating account.' },
      { status: 500 }
    );
  }
}
