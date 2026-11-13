'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, message } from 'antd';
import { HeartFilled, HeartOutlined, StarFilled } from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { formatPrice } from '@/components/site/SiteBookCard';

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    books,
    catalogLoading,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addReview,
  } = useBookStore();

  const book = useMemo(() => books.find((item) => item.id === params.id), [books, params.id]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (catalogLoading && !book) {
    return (
      <StoreShell crumbs={[{ label: 'Book' }]}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
          <Spin size="large" />
        </div>
      </StoreShell>
    );
  }

  if (!book) {
    return (
      <StoreShell crumbs={[{ label: 'Book' }]}>
        <div className="site-container empty-state">
          <div className="empty-state__title">Book not found</div>
          <div className="empty-state__text">This title may have been removed from the catalogue.</div>
          <button type="button" className="btn btn--maroon" onClick={() => router.push('/')}>
            Back to books
          </button>
        </div>
      </StoreShell>
    );
  }

  const outOfStock = book.stock <= 0;
  const reviews = book.reviews || [];
  const bookNumber = Math.max(1, books.findIndex((item) => item.id === book.id) + 1);

  const submitReview = async () => {
    if (!comment.trim()) {
      message.warning('Please write your review before submitting.');
      return;
    }
    setSubmitting(true);
    const ok = await addReview(book.id, rating, comment);
    setSubmitting(false);
    if (ok) {
      setComment('');
      setRating(5);
    }
  };

  return (
    <StoreShell crumbs={[{ label: `Book(${String(bookNumber).padStart(2, '0')})` }]}>
      <div className="site-container product-page">
        <div className="product-layout">
          <div className="product-gallery">
            <div className="product-gallery__main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={book.coverImage} alt={book.title} />
            </div>
            <div className="product-gallery__thumbs">
              <button
                type="button"
                className="product-gallery__thumb is-active"
                aria-label="View book cover"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={book.coverImage} alt="" />
              </button>
            </div>

            <div className="product-buy">
              <button
                type="button"
                className="btn btn--maroon"
                disabled={outOfStock}
                onClick={() => addToCart(book)}
              >
                Add to bag
              </button>

              <button
                type="button"
                className="btn btn--outline"
                onClick={() => toggleWishlist(book.id)}
              >
                {isInWishlist(book.id) ? <HeartFilled /> : <HeartOutlined />} Wishlist
              </button>
            </div>
          </div>

          <div className="product-info">
            <h1 className="product-info__title">{book.title}</h1>
            <div className="product-info__author">by {book.author}</div>

            <div className="product-info__rating">
              <span className="rating-chip">
                {book.rating.toFixed(1)} <StarFilled />
              </span>
              <span className="review-count">({book.reviewCount ?? reviews.length})</span>
            </div>

            <div className="product-info__price">
              <span className="price price--lg">{formatPrice(book.price)}</span>
              {book.originalPrice ? (
                <span className="price-original price-original--lg">
                  {formatPrice(book.originalPrice)}
                </span>
              ) : null}
            </div>

            {outOfStock && <div className="product-stock product-stock--out">Out of stock</div>}

            <div className="product-info__label">Book Detail</div>
            <p className="product-info__desc">
              {book.description}
              {book.publisher ? ` Published by ${book.publisher}.` : ''}
              {book.pages ? ` ${book.pages} pages.` : ''}
              {book.language ? ` Language: ${book.language}.` : ''}
            </p>

            <section className="feedback-panel">
              <h2 className="feedback-panel__title">Customer Feedback</h2>
              <div className="feedback-form">
                <div className="feedback-form__label">Overall rating</div>
                <div className="feedback-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= rating ? 'is-active' : ''}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Write your review"
                  aria-label="Write your review"
                />
                <div className="feedback-form__actions">
                  <button
                    type="button"
                    className="btn btn--blue"
                    onClick={submitReview}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </div>

              {reviews.length > 0 && (
                <div className="review-list">
                  {reviews.map((review) => (
                    <div className="review-item" key={review.id}>
                      <div className="review-item__avatar">{review.initials}</div>
                      <div>
                        <div className="review-item__name">{review.user}</div>
                        <div className="review-item__stars">
                          {'★'.repeat(Math.round(review.rating))}
                          {'☆'.repeat(Math.max(0, 5 - Math.round(review.rating)))}
                        </div>
                        <p className="review-item__comment">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
