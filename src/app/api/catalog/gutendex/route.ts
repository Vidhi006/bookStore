import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_HOST = 'gutendex.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get('next');
  const search = searchParams.get('search') || '';
  const languages = searchParams.get('languages') || 'en';
  const page = searchParams.get('page');

  let target = 'https://gutendex.com/books/?languages=en';

  if (next) {
    try {
      const parsed = new URL(next);
      if (parsed.hostname !== ALLOWED_HOST) {
        return NextResponse.json({ error: 'Invalid catalog URL.' }, { status: 400 });
      }
      target = parsed.toString();
    } catch {
      return NextResponse.json({ error: 'Invalid next URL.' }, { status: 400 });
    }
  } else {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (languages && languages !== 'all') params.set('languages', languages);
    if (page) params.set('page', page);
    const qs = params.toString();
    target = qs ? `https://gutendex.com/books/?${qs}` : 'https://gutendex.com/books/';
  }

  try {
    const response = await fetch(target, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json(
        { error: `Unable to load books from Gutendex (${response.status}).` },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Gutendex request failed.' }, { status: 502 });
  }
}
