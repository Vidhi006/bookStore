'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircleFilled } from '@ant-design/icons';
import { StoreShell } from '@/components/site/StoreShell';
import { CheckoutSteps } from '@/components/site/CheckoutSteps';

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
        <CheckoutSteps current="done" />
        <div className="success-page">
          <div className="success-check">
            <CheckCircleFilled />
          </div>
          <h1 className="success-page__title">Order placed successfully</h1>
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
