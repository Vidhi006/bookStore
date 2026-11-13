import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPurchases,
  findUserById,
  sanitizeUser,
  updateUserProfile,
} from '@/lib/authStore';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/authCookie';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });

    const user = await findUserById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const purchases = await getUserPurchases(payload.userId);
    return NextResponse.json({ success: true, user: sanitizeUser(user), purchases });
  } catch (err) {
    console.error('[profile]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });

    const body = await request.json();
    const updated = await updateUserProfile(payload.userId, {
      name: body.name,
      mobile: body.mobile,
      addresses: body.addresses,
      wishlist: body.wishlist,
    });

    if (!updated) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    return NextResponse.json({ success: true, user: sanitizeUser(updated) });
  } catch (err) {
    console.error('[profile PATCH]', err);
    return NextResponse.json({ error: 'Could not update profile.' }, { status: 500 });
  }
}
