'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { formatPrice } from '@/components/site/SiteBookCard';

export default function OrdersPage() {
  const router = useRouter();
  const { user, orders } = useBookStore();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  const mine = orders.filter(
    (order) => order.userId === user.id || order.customerEmail === user.email
  );

  return (
    <StoreShell crumbs={[{ label: 'My Order' }]}>
      <div className="site-container orders-page">
        {mine.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No orders yet</div>
            <div className="empty-state__text">Your placed orders will appear here.</div>
            <Link href="/" className="btn btn--maroon">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {mine.map((order) => {
              const first = order.items[0];
              const createdDate = new Date(order.createdAt);
              const placedDate =
                order.orderDate ||
                (Number.isNaN(createdDate.getTime())
                  ? order.createdAt
                  : new Intl.DateTimeFormat('en-US', {
                      month: 'long',
                      day: '2-digit',
                    }).format(createdDate));

              return (
                <article className="order-card" key={order.id}>
                  <div className="order-card__thumb">
                    {first ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={first.book.coverImage} alt={first.book.title} />
                    ) : null}
                  </div>
                  <div className="order-card__details">
                    <div className="order-card__title">{first?.book.title || 'Order'}</div>
                    <div className="order-card__author">
                      by {first?.book.author || 'Bookstore'}
                    </div>
                    {first && (
                      <div className="order-card__price">
                        <span className="price price--md">{formatPrice(first.book.price)}</span>
                        {first.book.originalPrice ? (
                          <span className="price-original">
                            {formatPrice(first.book.originalPrice)}
                          </span>
                        ) : null}
                      </div>
                    )}
                    {order.items.length > 1 && (
                      <div className="order-card__more">
                        + {order.items.length - 1} more item(s)
                      </div>
                    )}
                  </div>
                  <div className="order-card__meta">
                    <span className="order-card__dot" aria-hidden="true" />
                    <span>Order Placed on {placedDate}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </StoreShell>
  );
}
