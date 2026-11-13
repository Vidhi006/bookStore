import { bookEndpoints } from '@/config/apiEndpoints';
import type { BookListQuery } from '@/config/apiEndpoints';
import { apiRequest, JSON_HEADERS } from '@/services/http';
import type { ApiResult } from '@/services/http';
import type { Book } from '@/types';

export interface BookListResponse {
  books?: Book[];
  total?: number;
  error?: string;
}

export interface BookResponse {
  book?: Book;
  error?: string;
}

export const bookService = {
  /** Catalogue query (`GET /api/books`). No params returns the full list. */
  list: (params: BookListQuery = {}): Promise<ApiResult<BookListResponse>> =>
    apiRequest<BookListResponse>(bookEndpoints.list(params)),

  /** Add a title to the inventory (`POST /api/books`). */
  create: (book: Omit<Book, 'id'>): Promise<ApiResult<BookResponse>> =>
    apiRequest<BookResponse>(bookEndpoints.create, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(book),
    }),

  /** Post a review (`POST /api/books/{id}/review`). */
  addReview: (
    bookId: string,
    rating: number,
    comment: string
  ): Promise<ApiResult<BookResponse>> =>
    apiRequest<BookResponse>(bookEndpoints.review(bookId), {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ rating, comment }),
    }),
};
