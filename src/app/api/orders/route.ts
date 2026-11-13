import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import BookModel from '@/models/Book';
import { mapOrder } from '@/lib/mappers';
import { invalidateCatalogCache } from '@/lib/catalogCache';
import { addPurchaseToUser } from '@/lib/authStore';
import { verifyToken } from '@/lib/jwt';
import { Order } from '@/types';
import { getAuthToken } from '@/lib/authCookie';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectMongoDB();
    const orderQueue = await OrderModel.find().sort({ queuePosition: 1 });
    return NextResponse.json({ totalInQueue: orderQueue.length, orders: orderQueue.map(mapOrder) });
  } catch (err) {
    console.error('[orders GET error]:', err);
    return NextResponse.json({ totalInQueue: 0, orders: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    const body = await request.json();
    const token = getAuthToken(request);
    const payload = token ? verifyToken(token) : null;
    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Customer name and at least one cart item are required.' }, { status: 400 });
    }

    const items = body.items as { book?: { id?: string }; quantity?: number }[];

    // Merge duplicate lines and validate quantities (the cart normally keeps one line per book).
    const requested = new Map<string, number>();
    for (const item of items) {
      const bookId = item?.book?.id;
      const quantity = Math.floor(Number(item?.quantity));
      if (!bookId || !Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: 'Every cart item needs a valid book and quantity.' },
          { status: 400 }
        );
      }
      requested.set(bookId, (requested.get(bookId) || 0) + quantity);
    }

    // Reserve stock atomically so two simultaneous orders cannot oversell a title.
    const reserved: { id: string; quantity: number; stock: number }[] = [];
    for (const [bookId, quantity] of Array.from(requested.entries())) {
      const updated = await BookModel.findOneAndUpdate(
        { id: bookId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updated) {
        await Promise.all(
          reserved.map((line) =>
            BookModel.updateOne({ id: line.id }, { $inc: { stock: line.quantity } })
          )
        );
        const existing = await BookModel.findOne({ id: bookId }).lean();
        const message = existing
          ? `Only ${existing.stock} ${existing.stock === 1 ? 'copy' : 'copies'} of "${existing.title}" left in stock.`
          : 'One of the books in your cart is no longer available.';
        return NextResponse.json({ error: message }, { status: 409 });
      }

      reserved.push({ id: bookId, quantity, stock: updated.stock });
    }

    // Stock changed, so the cached catalogue must be rebuilt on the next read.
    invalidateCatalogCache();

    const count = await OrderModel.countDocuments();
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    let created;
    try {
      created = await OrderModel.create({
        id: orderId,
        customerName: body.customerName,
        customerEmail: body.customerEmail || 'customer@example.com',
        shippingAddress: body.shippingAddress || 'Standard Delivery',
        items: body.items,
        totalAmount: Number(body.totalAmount) || 0,
        status: 'Pending',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        orderDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        queuePosition: count + 1,
        ...(payload?.userId ? { userId: payload.userId } : {}),
      });
    } catch (error) {
      // Order failed after stock was reserved — put the copies back.
      await Promise.all(
        reserved.map((line) =>
          BookModel.updateOne({ id: line.id }, { $inc: { stock: line.quantity } })
        )
      );
      invalidateCatalogCache();
      throw error;
    }

    // Also persist purchase to MongoDB user profile when authenticated.
    if (payload?.userId) {
      const purchaseItems = (body.items as { book: { id: string; title: string; author: string; price: number; coverImage?: string }; quantity: number }[]).map((i) => ({
          bookId: i.book.id,
          title: i.book.title,
          author: i.book.author,
          price: i.book.price,
          quantity: i.quantity,
          coverImage: i.book.coverImage,
        }));
        await addPurchaseToUser(payload.userId, {
          orderId,
          items: purchaseItems,
          totalAmount: Number(body.totalAmount) || 0,
          shippingAddress: body.shippingAddress || 'Standard Delivery',
        }).catch(() => {});
    }

    const newOrder: Order = mapOrder(created);
    return NextResponse.json(
      {
        success: true,
        order: newOrder,
        stockUpdates: reserved.map((line) => ({ id: line.id, stock: line.stock })),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[orders POST error]:', err);
    return NextResponse.json({ error: 'Failed to process order in MongoDB' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectMongoDB();
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ error: 'Order id and status are required.' }, { status: 400 });
    }

    const updated = await OrderModel.findOneAndUpdate(
      { id: body.id },
      { status: body.status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: mapOrder(updated) });
  } catch (err) {
    console.error('[orders PATCH error]:', err);
    return NextResponse.json({ error: 'Failed to update order in MongoDB' }, { status: 500 });
  }
}
