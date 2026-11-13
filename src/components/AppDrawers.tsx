'use client';

import React from 'react';
import { BookDetailModal } from '@/components/BookDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { AuthModal } from '@/components/AuthModal';

export const AppDrawers: React.FC = () => (
  <>
    <BookDetailModal />
    <CartDrawer />
    <WishlistDrawer />
    <CheckoutModal />
    <AuthModal />
  </>
);
