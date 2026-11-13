'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { AdminPanel } from '@/components/AdminPanel';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useBookStore();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <StoreShell crumbs={[{ label: 'Admin' }]}>
        <div className="site-container empty-state">
          <div className="empty-state__title">Administrator access only</div>
          <div className="empty-state__text">Sign in with an admin account to manage the store.</div>
          <Link href="/" className="btn btn--maroon">
            Back to store
          </Link>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell crumbs={[{ label: 'Admin Dashboard' }]}>
      <div className="site-container admin-page">
        <AdminPanel />
      </div>
    </StoreShell>
  );
}
