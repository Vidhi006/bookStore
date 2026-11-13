'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dropdown, MenuProps } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  HeartOutlined,
  ProfileOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  DesktopOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';
import { useTheme } from '@/context/ThemeContext';

export const StoreHeader: React.FC = () => {
  const router = useRouter();
  const {
    user,
    cartCount,
    filters,
    setFilters,
    logout,
  } = useBookStore();
  const { mode, setMode } = useTheme();
  const [query, setQuery] = useState(filters.searchQuery);

  const themeItems: MenuProps['items'] = [
    { key: 'system', icon: <DesktopOutlined />, label: 'Use system setting' },
    { key: 'light', icon: <SunOutlined />, label: 'Light' },
    { key: 'dark', icon: <MoonOutlined />, label: 'Dark' },
  ];

  const handleThemeChange: MenuProps['onClick'] = ({ key }) => {
    if (key === 'system' || key === 'light' || key === 'dark') {
      setMode(key);
    }
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    if (window.location.pathname !== '/') router.push('/');
  };

  const menuItems = user
    ? [
        {
          key: 'hello',
          label: <div className="account-menu__hello">Hello {user.name.split(' ')[0]},</div>,
        },
        { key: 'profile', icon: <ProfileOutlined />, label: 'Profile' },
        { key: 'orders', icon: <ShoppingOutlined />, label: 'My Orders' },
        { key: 'wishlist', icon: <HeartOutlined />, label: 'Wishlist' },
        ...(user.role === 'admin'
          ? [{ key: 'admin', icon: <DashboardOutlined />, label: 'Admin Dashboard' }]
          : []),
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
      ]
    : [
        {
          key: 'hello',
          label: <div className="account-menu__hello">Welcome</div>,
        },
        {
          key: 'signin',
          label: <div style={{ padding: '2px 14px 6px', fontSize: 11, color: '#878787' }}>To access account and manage orders</div>,
        },
        { key: 'login', icon: <UserOutlined />, label: 'Login / Signup' },
        { key: 'wishlist', icon: <HeartOutlined />, label: 'Wishlist' },
      ];

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      await logout();
      router.push('/');
      return;
    }
    if (key === 'login' || key === 'signin') router.push('/login');
    if (key === 'profile') router.push('/profile');
    if (key === 'orders') router.push('/orders');
    if (key === 'wishlist') router.push('/wishlist');
    if (key === 'admin') router.push('/admin');
  };

  return (
    <header className="store-header">
      <div className="site-container store-header__inner">
        <Link href="/" className="brand" aria-label="Bookstore home">
          <span className="brand__icon" aria-hidden="true">
            <Image src="/book-logo.png" alt="" width={32} height={24} />
          </span>
          Bookstore
        </Link>

        <form className="header-search" onSubmit={submitSearch}>
          <SearchOutlined />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ..."
            aria-label="Search books"
          />
        </form>

        <div className="header-actions">
          <Dropdown
            menu={{ items: themeItems, onClick: handleThemeChange, selectedKeys: [mode] }}
            trigger={['click']}
          >
            <button
              type="button"
              className="header-action"
              aria-label={`Color theme: ${mode}`}
              title={`Color theme: ${mode}`}
            >
              {mode === 'dark' ? <MoonOutlined /> : mode === 'light' ? <SunOutlined /> : <DesktopOutlined />}
              <span>Theme</span>
            </button>
          </Dropdown>

          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
            <button type="button" className="header-action" aria-label="Account menu">
              <UserOutlined />
              <span>{user ? user.name.split(' ')[0] : 'Profile'}</span>
            </button>
          </Dropdown>

          <Link href="/cart" className="header-action" aria-label="Cart">
            <ShoppingCartOutlined />
            <span>Cart</span>
            {cartCount > 0 && <em className="header-action__badge">{cartCount}</em>}
          </Link>
        </div>
      </div>
    </header>
  );
};
