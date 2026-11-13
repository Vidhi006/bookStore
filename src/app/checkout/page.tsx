'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { CheckoutSteps } from '@/components/site/CheckoutSteps';
import { formatPrice } from '@/components/site/SiteBookCard';
import { Address } from '@/types';

type CheckoutStage = 'address' | 'summary';

const addressLine = (address: Address) =>
  [
    address.address,
    address.locality,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ');

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, placeOrder, user } = useBookStore();
  const [address, setAddress] = useState<Address | null>(null);
  const [stage, setStage] = useState<CheckoutStage>('address');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('bookhaven_checkout_address');
      if (raw) setAddress(JSON.parse(raw) as Address);
    } catch {
      setAddress(null);
    }
  }, []);

  const delivery = address || user?.addresses?.[0] || null;

  const goToStep = (next: CheckoutStage) => {
    setStage(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToSummary = () => {
    if (cart.length === 0) {
      message.warning('Your cart is empty.');
      router.push('/cart');
      return;
    }
    if (!delivery) {
      message.warning('Please add a delivery address first.');
      router.push('/cart');
      return;
    }
    goToStep('summary');
  };

  const submit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      message.warning('Your cart is empty.');
      router.push('/cart');
      return;
    }
    if (!delivery) {
      message.warning('Please add a delivery address first.');
      goToStep('address');
      return;
    }
    setPlacing(true);
    const order = await placeOrder({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: addressLine(delivery),
    });
    setPlacing(false);
    if (order) {
      sessionStorage.removeItem('bookhaven_checkout_address');
      router.push(`/order-success?order=${encodeURIComponent(order.id)}`);
    }
  };

  return (
    <StoreShell crumbs={[{ label: 'My cart', href: '/cart' }, { label: 'Checkout' }]}>
      <div className="site-container">
        <CheckoutSteps current={stage} />
        <div className="cart-head">
          <h1 className="cart-head__title">Checkout</h1>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">Nothing to checkout</div>
            <Link href="/" className="btn btn--maroon">
              Browse books
            </Link>
          </div>
        ) : stage === 'address' ? (
          <>
            <section>
              <h2 className="cart-section-title">Customer Details</h2>
              <div className="cart-address" style={{ borderBottom: 0 }}>
                <div>
                  <div className="cart-address__label">Full Name</div>
                  <div className="cart-address__text">{user?.name || 'Guest'}</div>
                </div>
                <div>
                  <div className="cart-address__label">Mobile number</div>
                  <div className="cart-address__text">{user?.mobile || '—'}</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="cart-section-title">Delivery Address</h2>
              {delivery ? (
                <div className="checkout-delivery-card">
                  <div>
                    <div className="cart-address__label">
                      <span className="tag">{delivery.type}</span>
                      {delivery.fullName}
                    </div>
                    <div className="cart-address__text">{addressLine(delivery)}</div>
                    <div className="cart-address__meta">
                      <span>{delivery.city}</span>
                      <span>{delivery.state}</span>
                      <span>{delivery.mobile}</span>
                    </div>
                  </div>
                  <Link href="/cart" className="text-link" style={{ fontSize: 12 }}>
                    Change
                  </Link>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state__text">
                    Please add a delivery address to continue.
                  </div>
                  <Link href="/cart" className="btn btn--maroon">
                    Add address
                  </Link>
                </div>
              )}
            </section>

            <div className="cart-actions">
              <Link href="/cart" className="btn btn--outline">
                Back to cart
              </Link>
              <button
                type="button"
                className="btn btn--blue"
                onClick={goToSummary}
                disabled={!delivery}
              >
                Continue to summary
              </button>
            </div>
          </>
        ) : (
          <>
            <section>
              <h2 className="cart-section-title">Delivery Address</h2>
              {delivery ? (
                <div className="checkout-delivery-card">
                  <div>
                    <div className="cart-address__label">
                      <span className="tag">{delivery.type}</span>
                      {delivery.fullName}
                    </div>
                    <div className="cart-address__text">{addressLine(delivery)}</div>
                  </div>
                  <button
                    type="button"
                    className="text-link"
                    style={{ fontSize: 12, background: 'none', border: 0, cursor: 'pointer' }}
                    onClick={() => goToStep('address')}
                  >
                    Change
                  </button>
                </div>
              ) : null}
            </section>

            <section>
              <h2 className="cart-section-title">Order summary</h2>
              <div className="order-summary">
                {cart.map(({ book, quantity }) => (
                  <div className="order-summary__item" key={book.id}>
                    <span>
                      {book.title} × {quantity}
                    </span>
                    <span>{formatPrice(book.price * quantity)}</span>
                  </div>
                ))}
                <div className="order-summary__row">
                  <span>Delivery</span>
                  <span style={{ color: '#388e3c' }}>Free</span>
                </div>
                <div className="order-summary__row order-summary__row--total">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </section>

            <div className="cart-actions">
              <button type="button" className="btn btn--outline" onClick={() => goToStep('address')}>
                Back to address
              </button>
              <button type="button" className="btn btn--blue" onClick={submit} disabled={placing}>
                {placing ? 'Placing order…' : 'Place order'}
              </button>
            </div>
          </>
        )}
      </div>
    </StoreShell>
  );
}
