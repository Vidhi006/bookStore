import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'fiction';
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'BookHavenStudentApp/1.0' },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `Unable to load Open Library results (${response.status}).` },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json({
      count: data.numFound ?? 0,
      page: Number(page),
      limit: Number(limit),
      nextPage: Number(page) + 1,
      hasMore: Number(page) * Number(limit) < (data.numFound ?? 0),
      docs: data.docs ?? [],
    });
  } catch {
    return NextResponse.json({ error: 'Open Library request failed.' }, { status: 502 });
  }
}
