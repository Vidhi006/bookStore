'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, saveAddress } = useBookStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [form, setForm] = useState<Address>(emptyAddress);

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
    const saved = await updateProfile({ name, mobile });
    if (saved) setEditing(false);
  };

  const setField = (key: keyof Address, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setForm(emptyAddress);
    setShowForm(true);
  };

  const editAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setForm({ ...address });
    setShowForm(true);
  };

  const cancelAddressForm = () => {
    setShowForm(false);
    setEditingAddressId(null);
    setForm(emptyAddress);
  };

  const saveAddressDetails = async () => {
    if (!form.fullName || !form.mobile || !form.address || !form.city || !form.state) {
      message.warning('Please complete the required address fields.');
      return;
    }

    const saved = await saveAddress({
      ...form,
      id: editingAddressId || `addr-${Date.now()}`,
    });
    if (saved) cancelAddressForm();
  };

  return (
    <StoreShell crumbs={[{ label: 'Profile' }]}>
      <div className="site-container profile-page">
        <div className="profile-panel">
          <section className="profile-section">
            <div className="profile-panel__head">
              <h1>Personal Details</h1>
              {!editing ? (
                <button type="button" className="text-link" onClick={() => setEditing(true)}>
                  Edit
                </button>
              ) : (
                <div className="profile-panel__actions">
                  <button type="button" className="text-link" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="button" className="text-link" onClick={save}>
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="profile-fields">
              <label className="profile-field">
                <span>Full Name</span>
                {editing ? (
                  <input value={name} onChange={(event) => setName(event.target.value)} />
                ) : (
                  <div className="profile-field__value">{user.name}</div>
                )}
              </label>
              <label className="profile-field">
                <span>Email Id</span>
                <div className="profile-field__value">{user.email}</div>
              </label>
              <div className="profile-field">
                <span>Password</span>
                <div className="profile-field__value" aria-label="Password hidden">
                  ••••••••••
                </div>
              </div>
              <label className="profile-field">
                <span>Mobile Number</span>
                {editing ? (
                  <input value={mobile} onChange={(event) => setMobile(event.target.value)} />
                ) : (
                  <div className="profile-field__value">{user.mobile || '—'}</div>
                )}
              </label>
            </div>
          </section>

          <section className="profile-section profile-section--addresses">
            <div className="profile-panel__head">
              <h2>Address Details</h2>
              <button type="button" className="profile-add-address" onClick={openNewAddressForm}>
                Add New Address
              </button>
            </div>

            {(user.addresses || []).length === 0 && !showForm && (
              <p className="profile-empty-address">No saved addresses yet.</p>
            )}

            {(user.addresses || []).map((address, index) => (
              <div className="profile-address" key={address.id}>
                <div className="profile-address__head">
                  <h3>
                    {index + 1}. {address.type}
                  </h3>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => editAddress(address)}
                  >
                    Edit
                  </button>
                </div>
                <div className="profile-address__fields">
                  <div className="profile-field profile-field--full">
                    <span>Address</span>
                    <div className="profile-field__value profile-field__value--multiline">
                      {[address.address, address.locality, address.landmark]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                  <div className="profile-field">
                    <span>City/Town</span>
                    <div className="profile-field__value">{address.city}</div>
                  </div>
                  <div className="profile-field">
                    <span>State</span>
                    <div className="profile-field__value">{address.state}</div>
                  </div>
                  <div className="profile-address__type">
                    <span>Type</span>
                    <div className="profile-address__choices">
                      {(['Home', 'Work', 'Other'] as const).map((type) => (
                        <label key={type}>
                          <input type="radio" checked={address.type === type} readOnly />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

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
                  <button type="button" className="btn btn--outline" onClick={cancelAddressForm}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn--maroon"
                    onClick={saveAddressDetails}
                  >
                    {editingAddressId ? 'Save Changes' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </StoreShell>
  );
}
