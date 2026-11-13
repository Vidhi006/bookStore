import React from 'react';
import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { BookStoreProvider } from '@/context/BookStoreContext';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bookstore — Online Book Shopping',
  description: 'Browse, wishlist and order books online from Bookstore.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ThemeProvider>
            <BookStoreProvider>{children}</BookStoreProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
