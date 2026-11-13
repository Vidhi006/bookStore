import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory log of dispatched verification codes (dev only)
// In production, integrate a real email service (SendGrid, Resend, etc.)
const dispatchLog: Array<{ to: string; subject: string; code: string; timestamp: string }> = [];

function logEmailDispatch(to: string, subject: string, code: string) {
  dispatchLog.unshift({
    to,
    subject,
    code,
    timestamp: new Date().toLocaleTimeString(),
  });
  if (dispatchLog.length > 30) dispatchLog.length = 30;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('email');
  const emails = filter ? dispatchLog.filter(e => e.to === filter.toLowerCase()) : dispatchLog;
  return NextResponse.json({ count: emails.length, emails });
}
