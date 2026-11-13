'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DeleteOutlined } from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { formatPrice } from '@/components/site/SiteBookCard';

export default function WishlistPage() {
  const { user, wishlist, books, toggleWishlist } = useBookStore();
  const items = books.filter((book) => wishlist.has(book.id));

  if (!user) {
    return (
      <StoreShell crumbs={[{ label: 'My Wishlist' }]}>
        <div className="site-container login-required">
          <h1 className="login-required__title">PLEASE LOG IN</h1>
          <p className="login-required__text">Login to view items in your wishlist.</p>
          <div className="login-required__icon">
            <Image
              src="/wishlist-login.png"
              alt=""
              width={67}
              height={73}
              priority
            />
          </div>
          <div className="login-required__action">
            <Link href="/login" className="btn btn--outline">
              LOGIN/SIGNUP
            </Link>
          </div>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell crumbs={[{ label: 'My Wishlist' }]}>
      <div className="site-container wishlist-page">
        <section className="wishlist-panel">
          <h1 className="wishlist-panel__heading">
            My Wishlist ({String(items.length).padStart(2, '0')})
          </h1>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__title">Your wishlist is empty</div>
              <div className="empty-state__text">Tap the heart on any book to save it for later.</div>
              <Link href="/" className="btn btn--maroon">
                Browse books
              </Link>
            </div>
          ) : (
            items.map((book) => (
              <article className="wishlist-item" key={book.id}>
                <Link href={`/books/${book.id}`} className="wishlist-item__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.coverImage} alt={book.title} />
                </Link>
                <div className="wishlist-item__details">
                  <Link href={`/books/${book.id}`} className="wishlist-item__title">
                    {book.title}
                  </Link>
                  <div className="wishlist-item__author">by {book.author}</div>
                  <div className="cart-item__price-row">
                    <span className="price price--md">{formatPrice(book.price)}</span>
                    {book.originalPrice ? (
                      <span className="price-original">{formatPrice(book.originalPrice)}</span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="wishlist-item__remove"
                  onClick={() => toggleWishlist(book.id)}
                  aria-label={`Remove ${book.title} from wishlist`}
                  title="Remove from wishlist"
                >
                  <DeleteOutlined />
                </button>
              </article>
            ))
          )}
        </section>
      </div>
    </StoreShell>
  );
}
