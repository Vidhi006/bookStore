'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HeartFilled, HeartOutlined, StarFilled } from '@ant-design/icons';
import { Book } from '@/types';
import { useBookStore } from '@/context/BookStoreContext';

export const formatPrice = (value: number) =>
  `Rs. ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const SiteBookCard: React.FC<{ book: Book }> = ({ book }) => {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useBookStore();
  const outOfStock = book.stock <= 0;

  const openBook = () => router.push(`/books/${book.id}`);

  return (
    <article className="book-card">
      <div
        className="book-card__media"
        onClick={openBook}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && openBook()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.coverImage} alt={book.title} loading="lazy" />
        <button
          type="button"
          className={`book-card__wish ${isInWishlist(book.id) ? 'is-active' : ''}`}
          aria-label="Toggle wishlist"
          onClick={(event) => {
            event.stopPropagation();
            toggleWishlist(book.id);
          }}
        >
          {isInWishlist(book.id) ? <HeartFilled /> : <HeartOutlined />}
        </button>
        <button
          type="button"
          className="book-card__quick"
          onClick={(event) => {
            event.stopPropagation();
            openBook();
          }}
        >
          Quick View
        </button>
      </div>

      <div className="book-card__body" onClick={openBook} role="button" tabIndex={0}>
        <div className="book-card__title">{book.title}</div>
        <div className="book-card__author">by {book.author}</div>
        <div className="book-card__meta">
          <span className="rating-chip">
            {book.rating.toFixed(1)} <StarFilled />
          </span>
          <span className="review-count">({book.reviewCount ?? book.reviews?.length ?? 0})</span>
        </div>
        <div className="book-card__price-row">
          <span className="price">{formatPrice(book.price)}</span>
          {book.originalPrice ? (
            <span className="price-original">{formatPrice(book.originalPrice)}</span>
          ) : null}
        </div>
      </div>

      {outOfStock && <div className="book-card__oos">out of stock</div>}
    </article>
  );
};
