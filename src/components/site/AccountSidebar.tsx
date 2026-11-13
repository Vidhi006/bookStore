'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookStore } from '@/context/BookStoreContext';

export const AccountSidebar: React.FC<{ active: 'profile' | 'orders' | 'wishlist' }> = ({ active }) => {
  const router = useRouter();
  const { user, logout } = useBookStore();

  return (
    <aside className="account-sidebar">
      <div className="account-sidebar__hello">Hello {user?.name.split(' ')[0] || 'Reader'},</div>
      <Link href="/profile" className={`account-sidebar__link ${active === 'profile' ? 'is-active' : ''}`}>
        Profile
      </Link>
      <Link href="/orders" className={`account-sidebar__link ${active === 'orders' ? 'is-active' : ''}`}>
        My Orders
      </Link>
      <Link href="/wishlist" className={`account-sidebar__link ${active === 'wishlist' ? 'is-active' : ''}`}>
        Wishlist
      </Link>
      <button
        type="button"
        className="account-sidebar__link account-sidebar__logout"
        style={{ background: 'none', border: 0, padding: '8px 0', cursor: 'pointer', textAlign: 'left' }}
        onClick={async () => {
          await logout();
          router.push('/');
        }}
      >
        Logout
      </button>
    </aside>
  );
};
