'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import {
  DownOutlined,
  EnvironmentOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { formatPrice } from '@/components/site/SiteBookCard';
import { Address } from '@/types';

const emptyAddress: Address = {
  id: '',
  type: 'Home',
  fullName: '',
  mobile: '',
  pincode: '',
  locality: '',
  address: '',
  city: '',
  state: '',
  landmark: '',
};

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    user,
    saveAddress,
  } = useBookStore();

  const [selectedId, setSelectedId] = useState(user?.addresses?.[0]?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Address>(emptyAddress);

  const addresses = user?.addresses || [];
  const activeAddress = addresses.find((address) => address.id === selectedId) || addresses[0];

  const setField = (key: keyof Address, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSaveAddress = async () => {
    if (!form.fullName || !form.mobile || !form.address || !form.city || !form.state) {
      message.warning('Please complete the required address fields.');
      return;
    }

    const address: Address = { ...form, id: `addr-${Date.now()}` };
    const saved = await saveAddress(address);
    if (saved) {
      setSelectedId(address.id);
      setForm(emptyAddress);
      setShowForm(false);
    }
  };

  const continueToCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      message.warning('Your cart is empty.');
      return;
    }

    const address = addresses.find((item) => item.id === selectedId) || addresses[0];
    if (!address) {
      message.warning('Please add a delivery address to continue.');
      setShowForm(true);
      return;
    }

    sessionStorage.setItem('bookhaven_checkout_address', JSON.stringify(address));
    router.push('/checkout');
  };

  const addressText = activeAddress
    ? [
        activeAddress.address,
        activeAddress.locality,
        activeAddress.landmark,
        activeAddress.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <StoreShell crumbs={[{ label: 'My cart' }]}>
      <div className="site-container cart-page">
        <div className="cart-page__content">
          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__title">Your cart is empty</div>
              <div className="empty-state__text">Browse the catalogue and add a few good books.</div>
              <Link href="/" className="btn btn--maroon">
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <section className="cart-panel">
                <div className="cart-panel__header">
                  <h1 className="cart-head__title">My cart ({cart.length})</h1>
                  {addresses.length > 0 ? (
                    <label className="cart-location">
                      <EnvironmentOutlined />
                      <select
                        aria-label="Delivery address"
                        value={selectedId || addresses[0].id}
                        onChange={(event) => setSelectedId(event.target.value)}
                      >
                        {addresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.city || address.locality || address.type}
                          </option>
                        ))}
                      </select>
                      <DownOutlined />
                    </label>
                  ) : (
                    <button
                      type="button"
                      className="cart-location"
                      onClick={() => setShowForm(true)}
                    >
                      <EnvironmentOutlined />
                      Add delivery address
                      <DownOutlined />
                    </button>
                  )}
                </div>

                {cart.map(({ book, quantity }) => (
                  <div className="cart-item" key={book.id}>
                    <Link href={`/books/${book.id}`} className="cart-item__thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={book.coverImage} alt={book.title} />
                    </Link>
                    <div>
                      <Link href={`/books/${book.id}`} className="cart-item__title">
                        {book.title}
                      </Link>
                      <div className="cart-item__author">by {book.author}</div>
                      <div className="cart-item__price-row">
                        <span className="price price--md">{formatPrice(book.price)}</span>
                        {book.originalPrice ? (
                          <span className="price-original">{formatPrice(book.originalPrice)}</span>
                        ) : null}
                      </div>
                      <div className="cart-item__controls">
                        <div className="qty-stepper" style={{ height: 32 }}>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(book.id, quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <MinusOutlined />
                          </button>
                          <span>{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(book.id, quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <PlusOutlined />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-item__remove"
                          onClick={() => removeFromCart(book.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <section className="cart-customer-panel">
                <div className="cart-customer-panel__header">
                  <h2>Customer Details</h2>
                  {user && (
                    <button
                      type="button"
                      className="cart-add-address"
                      onClick={() => setShowForm((previous) => !previous)}
                    >
                      {showForm ? 'Cancel' : 'Add New Address'}
                    </button>
                  )}
                </div>

                {!user ? (
                  <div className="empty-state">
                    <div className="empty-state__text">Please log in to add delivery details.</div>
                    <Link href="/login" className="btn btn--maroon">
                      Login / Signup
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="cart-customer-fields">
                      <label className="field">
                        <span>Full Name</span>
                        <input readOnly value={activeAddress?.fullName || user.name} />
                      </label>
                      <label className="field">
                        <span>Mobile Number</span>
                        <input readOnly value={activeAddress?.mobile || user.mobile || ''} />
                      </label>
                      <label className="field field--full">
                        <span>Address</span>
                        <textarea readOnly value={addressText} />
                      </label>
                      <label className="field">
                        <span>City/Town</span>
                        <input readOnly value={activeAddress?.city || ''} />
                      </label>
                      <label className="field">
                        <span>State</span>
                        <input readOnly value={activeAddress?.state || ''} />
                      </label>
                      <div className="cart-address-type">
                        <span>Type</span>
                        <div>
                          {(['Home', 'Work', 'Other'] as const).map((type) => (
                            <label key={type}>
                              <input
                                type="radio"
                                checked={activeAddress?.type === type}
                                disabled
                                readOnly
                              />
                              {type}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {showForm && (
                      <div className="address-form">
                        <div className="address-form__grid">
                          <div className="field">
                            <label>Full Name</label>
                            <input
                              value={form.fullName}
                              onChange={(event) => setField('fullName', event.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>Mobile number</label>
                            <input
                              value={form.mobile}
                              onChange={(event) => setField('mobile', event.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>Pincode</label>
                            <input
                              value={form.pincode}
                              onChange={(event) => setField('pincode', event.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>Locality</label>
                            <input
                              value={form.locality}
                              onChange={(event) => setField('locality', event.target.value)}
                            />
                          </div>
                          <div className="field field--full">
                            <label>Address</label>
                            <textarea
                              value={form.address}
                              onChange={(event) => setField('address', event.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>City/Town</label>
                            <input
                              value={form.city}
                              onChange={(event) => setField('city', event.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>State</label>
                            <input
                              value={form.state}
                              onChange={(event) => setField('state', event.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>Landmark</label>
                            <input
                              value={form.landmark}
                              onChange={(event) => setField('landmark', event.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>Address type</label>
                            <select
                              value={form.type}
                              onChange={(event) => setField('type', event.target.value)}
                            >
                              <option value="Home">Home</option>
                              <option value="Work">Work</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="address-form__actions">
                          <button
                            type="button"
                            className="btn btn--maroon"
                            onClick={handleSaveAddress}
                          >
                            Save Address
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="order-summary">
                      <div className="order-summary__title">Order summary</div>
                      {cart.map(({ book, quantity }) => (
                        <div className="order-summary__item" key={book.id}>
                          <span>
                            {book.title} × {quantity}
                          </span>
                          <span>{formatPrice(book.price * quantity)}</span>
                        </div>
                      ))}
                      <div className="order-summary__row order-summary__row--total">
                        <span>Total</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                    </div>

                    <div className="cart-actions">
                      <button type="button" className="btn btn--blue" onClick={continueToCheckout}>
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </StoreShell>
  );
}
