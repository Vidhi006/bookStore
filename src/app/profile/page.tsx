'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { AccountSidebar } from '@/components/site/AccountSidebar';
import { Address } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, saveAddress } = useBookStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Address>({
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
  });

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setMobile(user.mobile || '');
    }
  }, [user]);

  if (!user) return null;

  const save = async () => {
    const ok = await updateProfile({ name, mobile });
    if (ok) setEditing(false);
  };

  const setField = (key: keyof Address, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addAddress = async () => {
    if (!form.fullName || !form.mobile || !form.address || !form.city || !form.state) {
      message.warning('Please complete the required address fields.');
      return;
    }
    const ok = await saveAddress({ ...form, id: `addr-${Date.now()}` });
    if (ok) {
      setShowForm(false);
      setForm({ ...form, id: '', fullName: '', mobile: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '' });
    }
  };

  return (
    <StoreShell crumbs={[{ label: 'Profile' }]}>
      <div className="site-container account-layout">
        <AccountSidebar active="profile" />
        <div className="profile-panel">
          <div className="profile-panel__head">
            <h2>Personal Details</h2>
            {!editing ? (
              <button type="button" className="text-link" onClick={() => setEditing(true)}>
                Edit
              </button>
            ) : (
              <button type="button" className="btn btn--maroon btn--sm" onClick={save}>
                Save
              </button>
            )}
          </div>

          <div className="profile-field">
            <label>Full Name</label>
            {editing ? (
              <input value={name} onChange={(event) => setName(event.target.value)} />
            ) : (
              <div className="profile-field__value">{user.name}</div>
            )}
          </div>
          <div className="profile-field">
            <label>Email Id</label>
            <div className="profile-field__value">{user.email}</div>
          </div>
          <div className="profile-field">
            <label>Mobile</label>
            {editing ? (
              <input value={mobile} onChange={(event) => setMobile(event.target.value)} />
            ) : (
              <div className="profile-field__value">{user.mobile || '—'}</div>
            )}
          </div>

          <div className="profile-panel__head" style={{ marginTop: 26 }}>
            <h2>Addresses</h2>
            <button type="button" className="text-link" onClick={() => setShowForm((prev) => !prev)}>
              Add New Address
            </button>
          </div>

          {(user.addresses || []).length === 0 && !showForm && (
            <p style={{ fontSize: 12, color: '#878787' }}>No saved addresses yet.</p>
          )}

          {(user.addresses || []).map((address) => (
            <div className="profile-address" key={address.id}>
              <div className="profile-address__type">{address.type}</div>
              <div className="profile-address__text">
                {address.fullName}, {address.address}
                {address.locality ? `, ${address.locality}` : ''}, {address.city}, {address.state}
                {address.pincode ? ` - ${address.pincode}` : ''} · {address.mobile}
              </div>
            </div>
          ))}

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
                <button type="button" className="btn btn--maroon" onClick={addAddress}>
                  Save Address
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StoreShell>
  );
}
