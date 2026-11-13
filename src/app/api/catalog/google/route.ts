import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'fiction';
  const startIndex = searchParams.get('startIndex') || '0';
  const maxResults = searchParams.get('maxResults') || '20';
  const key = process.env.GOOGLE_BOOKS_API_KEY;

  const params = new URLSearchParams({
    q,
    startIndex,
    maxResults,
  });
  if (key) params.set('key', key);

  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json(
        { error: `Unable to load Google Books results (${response.status}).` },
        { status: response.status }
      );
    }
    const data = await response.json();
    const items = data.items ?? [];
    const nextIndex = Number(startIndex) + items.length;
    return NextResponse.json({
      totalItems: data.totalItems ?? 0,
      startIndex: Number(startIndex),
      nextIndex,
      hasMore: items.length > 0 && nextIndex < (data.totalItems ?? 0),
      items,
    });
  } catch {
    return NextResponse.json({ error: 'Google Books request failed.' }, { status: 502 });
  }
}
