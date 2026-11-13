import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import BookModel from '@/models/Book';
import UserModel from '@/models/User';
import { mapBook } from '@/lib/mappers';
import { getAuthToken } from '@/lib/authCookie';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthToken(request);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: 'Please sign in to write a review.' }, { status: 401 });
    }

    const body = await request.json();
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const comment = String(body.comment || '').trim();

    if (!comment) {
      return NextResponse.json({ error: 'Please write your review.' }, { status: 400 });
    }

    await connectMongoDB();
    const [book, user] = await Promise.all([
      BookModel.findOne({ id: params.id }),
      UserModel.findById(payload.userId),
    ]);

    if (!book) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });

    const name = user?.name || 'Reader';
    const review = {
      id: `rev-${Date.now()}`,
      user: name,
      initials: name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };

    const reviews = [...(book.reviews || []), review];
    const average = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

    book.reviews = reviews as any;
    book.reviewCount = reviews.length;
    book.rating = Math.round(average * 10) / 10;
    await book.save();

    return NextResponse.json({ success: true, book: mapBook(book) }, { status: 201 });
  } catch (err) {
    console.error('[book review POST]', err);
    return NextResponse.json({ error: 'Could not save your review.' }, { status: 500 });
  }
}
