import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import BookModel from '@/models/Book';
import { mapBook } from '@/lib/mappers';
import { getCachedCatalog, setCachedCatalog, invalidateCatalogCache } from '@/lib/catalogCache';
import { INITIAL_BOOKS } from '@/data/initialBooks';
import { Book } from '@/types';

export const dynamic = 'force-dynamic';

const MAX_LIMIT = 200;

let seedChecked = false;

async function ensureBaseSeed() {
  if (seedChecked) return;
  const count = await BookModel.estimatedDocumentCount();
  if (count === 0) {
    await BookModel.insertMany(INITIAL_BOOKS, { ordered: false }).catch(() => {
      // Ignore duplicate-key races; the collection is already usable.
    });
  }
  seedChecked = true;
}

async function getCatalog(): Promise<Book[]> {
  const cached = getCachedCatalog();
  if (cached) return cached;

  await connectMongoDB();
  await ensureBaseSeed();

  const docs = await BookModel.find().sort({ createdAt: -1 }).lean();
  const books = docs.map(mapBook);
  setCachedCatalog(books);
  return books;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const isbn = searchParams.get('isbn');
    const id = searchParams.get('id');
    const genre = searchParams.get('genre');
    const sort = searchParams.get('sort') || 'none';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const requestedLimit = Number(searchParams.get('limit'));
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), MAX_LIMIT)
        : 0;

    const catalog = await getCatalog();

    if (isbn || id) {
      const book = catalog.find((item) => item.isbn === isbn || item.id === id);
      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      return NextResponse.json({ book }, { headers: { 'Cache-Control': 'private, max-age=30' } });
    }

    let result = catalog;
    if (genre && genre !== 'All') {
      result = result.filter((book) => book.genre === genre);
    }
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query)
      );
    }

    if (sort === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sort === 'rating-desc') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      result = [...result].sort((a, b) => b.publishedYear - a.publishedYear);
    }

    const total = result.length;
    const totalPages = limit ? Math.max(1, Math.ceil(total / limit)) : 1;
    const safePage = Math.min(page, totalPages);
    const books = limit
      ? result.slice((safePage - 1) * limit, safePage * limit)
      : result;

    return NextResponse.json(
      { count: books.length, total, page: safePage, limit: limit || total, totalPages, books },
      { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=60' } }
    );
  } catch (err) {
    console.error('[books GET error]:', err);
    // Fallback gracefully to hardcoded books if MongoDB is temporarily unreachable
    let fallback = INITIAL_BOOKS;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');
    if (genre && genre !== 'All') fallback = fallback.filter((b) => b.genre === genre);
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return NextResponse.json({ count: fallback.length, total: fallback.length, books: fallback });
  }
}

export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const body = await request.json();

    if (!body.title || !body.author || !body.isbn || !body.price) {
      return NextResponse.json(
        { error: 'Missing required book fields (title, author, isbn, price)' },
        { status: 400 }
      );
    }

    const existing = await BookModel.findOne({ isbn: body.isbn });
    if (existing) {
      return NextResponse.json({ error: 'A book with this ISBN already exists.' }, { status: 409 });
    }

    const created = await BookModel.create({
      id: `b${Date.now()}`,
      title: body.title,
      author: body.author,
      isbn: body.isbn,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      rating: Number(body.rating) || 4.5,
      reviewCount: Number(body.reviewCount) || 0,
      reviews: Array.isArray(body.reviews) ? body.reviews : [],
      genre: body.genre || 'Fiction',
      stock: Number(body.stock) || 10,
      description: body.description || '',
      publishedYear: Number(body.publishedYear) || new Date().getFullYear(),
      language: body.language || 'English',
      pages: body.pages ? Number(body.pages) : undefined,
      publisher: body.publisher || undefined,
      coverImage:
        body.coverImage ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      badge: body.badge || 'New',
    });

    invalidateCatalogCache();

    const book: Book = mapBook(created);
    return NextResponse.json({ success: true, book }, { status: 201 });
  } catch (err) {
    console.error('[books POST error]:', err);
    return NextResponse.json({ error: 'Failed to create book in MongoDB' }, { status: 500 });
  }
}
