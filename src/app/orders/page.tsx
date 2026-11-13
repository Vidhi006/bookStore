'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { AccountSidebar } from '@/components/site/AccountSidebar';
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
      <div className="site-container account-layout">
        <AccountSidebar active="orders" />
        <div>
          <h1 className="list-page__title">My Orders</h1>
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
                return (
                  <div className="order-card" key={order.id}>
                    <div className="order-card__thumb">
                      {first ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={first.book.coverImage} alt={first.book.title} />
                      ) : null}
                    </div>
                    <div>
                      <div className="order-card__title">{first?.book.title || 'Order'}</div>
                      <div className="order-card__author">by {first?.book.author || 'Bookstore'}</div>
                      {first && (
                        <div className="order-card__price">
                          <span className="price price--md">{formatPrice(first.book.price)}</span>
                          {first.book.originalPrice ? (
                            <span className="price-original">{formatPrice(first.book.originalPrice)}</span>
                          ) : null}
                        </div>
                      )}
                      {order.items.length > 1 && (
                        <div style={{ fontSize: 11, color: '#878787', marginTop: 6 }}>
                          + {order.items.length - 1} more item(s)
                        </div>
                      )}
                    </div>
                    <div className="order-card__meta">
                      <div style={{ fontWeight: 700, color: '#0a0102' }}>
                        Order Placed on {order.orderDate || order.createdAt}
                      </div>
                      <div>Order #{order.id}</div>
                      <div>{formatPrice(order.totalAmount)}</div>
                      <span
                        className={`order-card__status ${
                          order.status === 'Pending' || order.status === 'Processing' ? 'is-pending' : ''
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StoreShell>
  );
}
