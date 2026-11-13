import { NextResponse } from 'next/server';
import { seedDemoAccounts } from '@/lib/authStore';

export const dynamic = 'force-dynamic';

// GET /api/auth/seed — seeds demo admin and customer accounts in MongoDB
export async function GET() {
  try {
    await seedDemoAccounts();
    return NextResponse.json({
      success: true,
      message: 'Demo accounts seeded in MongoDB.',
      accounts: [
        { email: 'admin@bookhaven.com', password: 'admin123', role: 'admin' },
        { email: 'customer@bookhaven.com', password: 'customer123', role: 'customer' },
      ],
    });
  } catch (err) {
    console.error('[seed]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

