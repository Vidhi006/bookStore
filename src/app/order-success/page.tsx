'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreShell } from '@/components/site/StoreShell';

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState('123456');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order');
    if (id) setOrderId(id.replace(/^ORD-?/i, ''));
  }, []);

  return (
    <StoreShell>
      <div className="site-container">
        <div className="success-page">
          <div className="success-celebration" aria-hidden="true">
            <svg viewBox="0 0 160 110" role="presentation">
              <path d="M53 29 45 16M66 22l-3-15M96 21l5-14M108 29l11-12M47 48l-12-5M113 47l12-5" />
              <path d="m79 10 2 9m35 18 8-7M59 13l-6-4" />
              <path className="success-confetti--green" d="m92 17 8-12" />
              <path className="success-confetti--pink" d="m49 39-10-7" />
              <path className="success-confetti--orange" d="m119 43 10-5" />
              <path className="success-confetti--purple" d="m69 15-2-9" />
              <circle cx="69" cy="31" r="2" />
              <circle cx="96" cy="34" r="2.5" />
              <circle cx="45" cy="35" r="2" />
              <path className="success-confetti--pink" d="m58 36 4-7" />
              <path className="success-confetti--green" d="m105 38 5-7" />
              <path className="success-confetti--orange" d="m71 20 2-7" />
              <path className="success-star success-star--left" d="m55 55 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
              <path className="success-star" d="m82 45 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" />
              <path className="success-star success-star--right" d="m109 56 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
            </svg>
          </div>
          <h1 className="success-page__title">Order Placed Successfully</h1>
          <div className="success-firework" aria-hidden="true">
            <svg viewBox="0 0 80 32" role="presentation">
              <path className="success-firework__blue" d="M27 8c-6 6-9 12-9 20M53 8c6 6 9 12 9 20M40 11v17" />
              <path className="success-firework__pink" d="M32 13c-3 4-5 8-5 12M48 13c3 4 5 8 5 12" />
              <circle cx="13" cy="17" r="2" />
              <circle cx="67" cy="17" r="2" />
              <circle cx="22" cy="7" r="2" />
              <circle cx="58" cy="7" r="2" />
            </svg>
          </div>
          <p className="success-page__copy">
            hurray!!! your order is confirmed
            <br />
            the order id is <strong>#{orderId}</strong> save the order id for
            <br />
            further communication..
          </p>

          <div className="success-table">
            <div className="success-table__row">
              <div className="success-table__cell success-table__head">Email us</div>
              <div className="success-table__cell success-table__head">Contact us</div>
              <div className="success-table__cell success-table__head">Address</div>
            </div>
            <div className="success-table__row">
              <div className="success-table__cell">admin@bookstore.com</div>
              <div className="success-table__cell">+91 8163475881</div>
              <div className="success-table__cell">
                42, 14th Main, 15th Cross, Sector 4, opp to BDA complex, near Kumarakom
                restaurant, HSR Layout, Bangalore 560034
              </div>
            </div>
          </div>

          <div className="success-page__action">
            <Link href="/" className="btn btn--blue">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
