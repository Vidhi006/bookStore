'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, message } from 'antd';
import {
  HeartFilled,
  HeartOutlined,
  StarFilled,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
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
    user,
  } = useBookStore();

  const book = useMemo(() => books.find((item) => item.id === params.id), [books, params.id]);
  const [quantity, setQuantity] = useState(1);
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
    <StoreShell crumbs={[{ label: `Book(${book.id.replace(/\D/g, '').padStart(2, '0')})` }]}>
      <div className="site-container">
        <div className="product-layout">
          <div className="product-gallery">
            <div className="product-gallery__main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={book.coverImage} alt={book.title} />
            </div>
            <div className="product-gallery__thumbs">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  type="button"
                  className={`product-gallery__thumb ${index === 0 ? 'is-active' : ''}`}
                  aria-label={`View cover ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.coverImage}
                    alt=""
                    style={{
                      objectPosition: ['center', 'top', 'bottom'][index],
                      filter: index === 1 ? 'brightness(0.95)' : index === 2 ? 'brightness(0.9)' : undefined,
                    }}
                  />
                </button>
              ))}
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

            <div className={`product-stock ${outOfStock ? 'product-stock--out' : ''}`}>
              {outOfStock
                ? 'Out of stock'
                : `${book.stock} ${book.stock === 1 ? 'copy' : 'copies'} in stock`}
            </div>

            <div className="product-info__label">Book Detail</div>
            <p className="product-info__desc">
              {book.description}
              {book.publisher ? ` Published by ${book.publisher}.` : ''}
              {book.pages ? ` ${book.pages} pages.` : ''}
              {book.language ? ` Language: ${book.language}.` : ''}
            </p>

            <div className="product-buy">
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <MinusOutlined />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(book.stock || 99, prev + 1))}
                  disabled={quantity >= book.stock}
                  aria-label="Increase quantity"
                >
                  <PlusOutlined />
                </button>
              </div>

              <button
                type="button"
                className="btn btn--maroon"
                disabled={outOfStock}
                onClick={() => addToCart(book, quantity)}
              >
                <ShoppingCartOutlined /> Add to bag
              </button>

              <button
                type="button"
                className="btn btn--outline"
                onClick={() => toggleWishlist(book.id)}
              >
                {isInWishlist(book.id) ? <HeartFilled /> : <HeartOutlined />} Wishlist
              </button>
            </div>

            {outOfStock && (
              <p style={{ color: '#a03037', marginTop: 14, fontSize: 13 }}>
                This title is currently out of stock.
              </p>
            )}
          </div>
        </div>

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
            {!user && (
              <p style={{ fontSize: 11, color: '#878787', marginTop: 8 }}>
                Please log in to post a review.
              </p>
            )}
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
    </StoreShell>
  );
}
