import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Tells the UI whether Google OAuth has server-side credentials.
 * Only a boolean is exposed — never the client ID or secret.
 */
export function GET() {
  return NextResponse.json({
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  });
}
