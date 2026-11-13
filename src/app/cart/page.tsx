'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { CheckoutSteps } from '@/components/site/CheckoutSteps';
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

  const setField = (key: keyof Address, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSaveAddress = async () => {
    if (!form.fullName || !form.mobile || !form.address || !form.city || !form.state) {
      message.warning('Please complete the required address fields.');
      return;
    }
    const address: Address = { ...form, id: `addr-${Date.now()}` };
    const ok = await saveAddress(address);
    if (ok) {
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

  return (
    <StoreShell crumbs={[{ label: 'My cart' }]}>
      <div className="site-container">
        <CheckoutSteps current="cart" />
        <div className="cart-head">
          <h1 className="cart-head__title">My cart ({cart.length})</h1>
        </div>

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
            <div>
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
                  <div style={{ fontSize: 15, fontWeight: 700, paddingTop: 4 }}>
                    {formatPrice(book.price * quantity)}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="cart-section-title">Customer Details</h2>

            {!user ? (
              <div className="empty-state">
                <div className="empty-state__text">Please log in to add delivery details.</div>
                <Link href="/login" className="btn btn--maroon">
                  Login / Signup
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-address" style={{ borderBottom: 0 }}>
                  <div>
                    <div className="cart-address__label">Full Name</div>
                    <div className="cart-address__text">{user.name}</div>
                  </div>
                  <div>
                    <div className="cart-address__label">Mobile number</div>
                    <div className="cart-address__text">{user.mobile || '—'}</div>
                  </div>
                </div>

                {addresses.map((address) => (
                  <label key={address.id} className="cart-address" style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="radio"
                        name="delivery-address"
                        checked={selectedId === address.id}
                        onChange={() => setSelectedId(address.id)}
                        style={{ marginTop: 4 }}
                      />
                      <div>
                        <div className="cart-address__label">
                          <span className="tag">{address.type}</span>
                          {address.fullName}
                        </div>
                        <div className="cart-address__text">
                          {address.address}
                          {address.locality ? `, ${address.locality}` : ''}
                          {address.city ? `, ${address.city}` : ''}
                          {address.state ? `, ${address.state}` : ''}
                          {address.pincode ? ` - ${address.pincode}` : ''}
                        </div>
                        <div className="cart-address__meta">
                          <span>{address.city}</span>
                          <span>{address.state}</span>
                          <span>{address.mobile}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  className="text-link"
                  style={{ marginTop: 14, fontSize: 12 }}
                  onClick={() => setShowForm((prev) => !prev)}
                >
                  + Add New Address
                </button>

                {showForm && (
                  <div className="address-form">
                    <div className="address-form__grid">
                      <div className="field">
                        <label>Full Name</label>
                        <input value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Mobile number</label>
                        <input value={form.mobile} onChange={(e) => setField('mobile', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Pincode</label>
                        <input value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Locality</label>
                        <input value={form.locality} onChange={(e) => setField('locality', e.target.value)} />
                      </div>
                      <div className="field field--full">
                        <label>Address</label>
                        <textarea value={form.address} onChange={(e) => setField('address', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>City/Town</label>
                        <input value={form.city} onChange={(e) => setField('city', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>State</label>
                        <input value={form.state} onChange={(e) => setField('state', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Landmark</label>
                        <input value={form.landmark} onChange={(e) => setField('landmark', e.target.value)} />
                      </div>
                      <div className="field">
                        <label>Address type</label>
                        <select value={form.type} onChange={(e) => setField('type', e.target.value)}>
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="address-form__actions">
                      <button type="button" className="btn btn--outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </button>
                      <button type="button" className="btn btn--maroon" onClick={handleSaveAddress}>
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
          </>
        )}
      </div>
    </StoreShell>
  );
}
