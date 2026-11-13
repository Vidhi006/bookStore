import { Address, Book, CartItem, Order, OrderStatus, Review, User } from '@/types';
import type { IBook } from '@/models/Book';
import type { IOrder } from '@/models/Order';
import type { IUser } from '@/models/User';

export function mapBook(book: IBook | any): Book {
  return {
    id: book.id || String(book._id),
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    price: Number(book.price),
    originalPrice:
      book.originalPrice !== undefined && book.originalPrice !== null
        ? Number(book.originalPrice)
        : undefined,
    rating: Number(book.rating) || 4.5,
    reviewCount: book.reviewCount !== undefined ? Number(book.reviewCount) : (book.reviews?.length || 0),
    reviews: Array.isArray(book.reviews) ? book.reviews.map(mapReview) : [],
    genre: book.genre,
    stock: Number(book.stock),
    coverImage: book.coverImage,
    description: book.description || '',
    publishedYear: Number(book.publishedYear) || new Date().getFullYear(),
    language: book.language || 'English',
    pages: book.pages ? Number(book.pages) : undefined,
    publisher: book.publisher || undefined,
    badge: book.badge || undefined,
  };
}

function mapReview(review: any): Review {
  return {
    id: review.id || String(review._id || ''),
    user: review.user || 'Reader',
    initials: review.initials || (review.user ? String(review.user).slice(0, 2).toUpperCase() : 'R'),
    rating: Number(review.rating) || 5,
    comment: review.comment || '',
    date: review.date || '',
  };
}

function mapAddress(address: any): Address {
  return {
    id: address.id || String(address._id || ''),
    type: address.type || 'Home',
    fullName: address.fullName || '',
    mobile: address.mobile || '',
    pincode: address.pincode || undefined,
    locality: address.locality || undefined,
    address: address.address || '',
    city: address.city || '',
    state: address.state || '',
    landmark: address.landmark || undefined,
  };
}

export function sanitizeUser(user: IUser | any): User {
  return {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    role: user.role === 'admin' ? 'admin' : 'customer',
    isEmailVerified: Boolean(user.isEmailVerified),
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString().split('T')[0] : String(user.createdAt || ''),
    mobile: user.mobile || undefined,
    addresses: Array.isArray(user.addresses) ? user.addresses.map(mapAddress) : [],
    wishlist: Array.isArray(user.wishlist) ? user.wishlist.map(String) : [],
  };
}

export function mapOrder(order: IOrder | any): Order {
  let items: CartItem[] = [];
  if (Array.isArray(order.items)) {
    items = order.items;
  } else if (typeof order.itemsJson === 'string') {
    try {
      items = JSON.parse(order.itemsJson) as CartItem[];
    } catch {
      items = [];
    }
  }

  return {
    id: order.id || String(order._id),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    items,
    totalAmount: Number(order.totalAmount) || 0,
    status: (order.status || 'Pending') as OrderStatus,
    createdAt: typeof order.createdAt === 'string' ? order.createdAt : new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    orderDate:
      order.orderDate ||
      (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : undefined),
    queuePosition: Number(order.queuePosition) || 1,
    userId: order.userId || undefined,
  };
}
