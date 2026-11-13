export type Genre = 'Fiction' | 'Sci-Fi' | 'Self-Help' | 'Science' | 'Mystery' | 'Classic';

export interface Review {
  id: string;
  user: string;
  initials: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  price: number;
  /** Original / struck-through price shown next to the selling price. */
  originalPrice?: number;
  rating: number;
  reviewCount?: number;
  reviews?: Review[];
  genre: Genre;
  stock: number;
  coverImage: string;
  description: string;
  publishedYear: number;
  language?: string;
  pages?: number;
  publisher?: string;
  badge?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  /** Display date, e.g. "May 21". */
  orderDate?: string;
  queuePosition: number;
  userId?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedGenre: string;
  maxPrice: number;
  sortBy: 'none' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest';
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other' | string;
  fullName: string;
  mobile: string;
  pincode?: string;
  locality?: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  isEmailVerified: boolean;
  createdAt: string;
  mobile?: string;
  addresses?: Address[];
  wishlist?: string[];
}

export interface DispatchedEmail {
  id: string;
  to: string;
  subject: string;
  type: 'verification' | 'reset-password';
  code: string;
  timestamp: string;
  preview: string;
}

export interface GutendexAuthor {
  name: string;
  birth_year?: number;
  death_year?: number;
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  formats: Record<string, string>;
  download_count: number;
  languages: string[];
}

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

export type CatalogSource = 'gutendex' | 'openlibrary' | 'google';

export interface CatalogCard {
  id: string;
  title: string;
  authors: string;
  coverUrl?: string;
  source: CatalogSource;
  downloads?: number;
  year?: number;
  readUrl?: string;
  raw: unknown;
}
