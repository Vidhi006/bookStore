'use client';

import React, { useState } from 'react';
import { Badge, Dropdown, Avatar, MenuProps, Drawer } from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  BookOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    cartTotal,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    activeView,
    setActiveView,
    navigateToDashboard,
    user,
    setIsAuthModalOpen,
    setAuthModalTab,
    setPendingVerificationEmail,
    logout,
  } = useBookStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenAuth = (tab: 'login' | 'signup' | 'verify') => {
    setAuthModalTab(tab);
    if (tab === 'verify' && user) setPendingVerificationEmail(user.email);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const userMenuItems: MenuProps['items'] = user
    ? [
        {
          key: 'header',
          label: (
            <div style={{ padding: '8px 4px', minWidth: '180px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#1C1917', marginBottom: '2px' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#78716C', marginBottom: '8px' }}>{user.email}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {user.isEmailVerified ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#3D5A3E', background: '#EBF2EB', borderRadius: '4px', padding: '2px 8px' }}>
                    <CheckCircleOutlined /> Verified
                  </span>
                ) : (
                  <span onClick={() => handleOpenAuth('verify')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#92400E', background: '#FEF3C7', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>
                    ⚠ Verify Email
                  </span>
                )}
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#57534E', background: '#F5F3EE', borderRadius: '4px', padding: '2px 8px' }}>
                  {user.role === 'admin' ? 'Store Manager' : 'Reader'}
                </span>
              </div>
            </div>
          ),
        },
        { type: 'divider' },
        ...(user.role === 'admin'
          ? [{ key: 'dashboard', icon: <DashboardOutlined style={{ color: '#3D5A3E' }} />, label: <span style={{ fontWeight: 500 }}>Store Dashboard</span>, onClick: navigateToDashboard }, { type: 'divider' as const }]
          : []),
        { key: 'logout', icon: <LogoutOutlined />, danger: true, label: <span style={{ fontWeight: 500 }}>Sign Out</span>, onClick: logout },
      ]
    : [];

  const navLinks = (
    <>
      <button
        onClick={() => { setActiveView('store'); setMobileMenuOpen(false); }}
        className={`nav-link${activeView === 'store' ? ' active' : ''}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontSize: '15px', fontWeight: activeView === 'store' ? 600 : 500, color: activeView === 'store' ? '#3D5A3E' : '#57534E', letterSpacing: '-0.01em', textAlign: 'left' }}
      >
        Browse Books
      </button>
      <button
        onClick={() => { setActiveView('public-archive'); setMobileMenuOpen(false); }}
        className={`nav-link${activeView === 'public-archive' ? ' active' : ''}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontSize: '15px', fontWeight: activeView === 'public-archive' ? 600 : 500, color: activeView === 'public-archive' ? '#3D5A3E' : '#57534E', letterSpacing: '-0.01em', textAlign: 'left' }}
      >
        Classic Archive
      </button>
    </>
  );

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%', background: '#FFFFFF', borderBottom: '1px solid #E8E4DE', boxShadow: '0 1px 0 0 #E8E4DE' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '64px' }}>
          
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }} onClick={() => setActiveView('store')}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#3D5A3E', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '16px', flexShrink: 0 }}>
              <BookOutlined />
            </div>
            <div>
              <div className="font-serif-title" style={{ fontWeight: 700, color: '#1C1917', fontSize: '18px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>BookHaven</div>
              <div style={{ fontSize: '9px', color: '#A8A29E', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, display: 'none' }} className="brand-subtitle">Independent Bookstore</div>
            </div>
          </div>

          {/* Desktop Center Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="desktop-nav">
            {navLinks}
          </nav>

          {/* Desktop Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} className="desktop-actions">
            {/* Wishlist */}
            <Badge count={wishlist.size} overflowCount={99} color="#7B5E3A" size="small">
              <button onClick={() => setIsWishlistOpen(true)} style={{ background: 'none', border: '1px solid #E8E4DE', borderRadius: '6px', cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#57534E', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {wishlist.size > 0 ? <HeartFilled style={{ color: '#9B3D38', fontSize: '14px' }} /> : <HeartOutlined style={{ fontSize: '14px' }} />}
                <span>Saved</span>
              </button>
            </Badge>

            {/* Cart */}
            <Badge count={cartCount} overflowCount={99} color="#3D5A3E" size="small">
              <button onClick={() => setIsCartOpen(true)} style={{ background: '#3D5A3E', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '7px', color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <ShoppingCartOutlined style={{ fontSize: '15px' }} />
                <span>Cart</span>
                <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '4px', padding: '0 6px', fontSize: '12px' }}>${cartTotal.toFixed(2)}</span>
              </button>
            </Badge>

            {/* Auth */}
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <button style={{ background: 'none', border: '1px solid #E8E4DE', borderRadius: '20px', cursor: 'pointer', padding: '4px 12px 4px 6px', display: 'flex', alignItems: 'center', gap: '7px', height: '36px', whiteSpace: 'nowrap' }}>
                  <Avatar size={24} style={{ backgroundColor: user.isEmailVerified ? '#3D5A3E' : '#B07D3A', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#1C1917' }}>{user.name.split(' ')[0]}</span>
                  {user.isEmailVerified && <CheckCircleOutlined style={{ color: '#3D5A3E', fontSize: '11px' }} />}
                </button>
              </Dropdown>
            ) : (
              <button onClick={() => handleOpenAuth('login')} style={{ background: '#1C1917', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <UserOutlined />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile: Cart icon + Hamburger */}
          <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="mobile-actions">
            <Badge count={cartCount} overflowCount={99} color="#3D5A3E" size="small">
              <button onClick={() => setIsCartOpen(true)} style={{ background: '#3D5A3E', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                <ShoppingCartOutlined />
                <span style={{ fontSize: '12px' }}>${cartTotal.toFixed(2)}</span>
              </button>
            </Badge>
            <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: '1px solid #E8E4DE', borderRadius: '6px', cursor: 'pointer', padding: '7px 10px', display: 'flex', alignItems: 'center', color: '#57534E' }}>
              <MenuOutlined style={{ fontSize: '16px' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        placement="right"
        width={280}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#3D5A3E', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '14px' }}>
              <BookOutlined />
            </div>
            <span className="font-serif-title" style={{ fontWeight: 700, fontSize: '16px', color: '#1C1917' }}>BookHaven</span>
          </div>
        }
        closeIcon={<CloseOutlined />}
        styles={{ body: { padding: '0', display: 'flex', flexDirection: 'column' }, header: { borderBottom: '1px solid #EDEAE3', padding: '16px 20px' } }}
      >
        {/* Nav Links */}
        <div style={{ padding: '20px', borderBottom: '1px solid #EDEAE3', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navLinks}
        </div>

        {/* Wishlist */}
        <div style={{ padding: '20px', borderBottom: '1px solid #EDEAE3' }}>
          <button onClick={() => { setIsWishlistOpen(true); setMobileMenuOpen(false); }} style={{ background: 'none', border: '1px solid #EDEAE3', borderRadius: '6px', cursor: 'pointer', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#57534E', fontSize: '14px', fontWeight: 500, width: '100%' }}>
            {wishlist.size > 0 ? <HeartFilled style={{ color: '#9B3D38' }} /> : <HeartOutlined />}
            Saved Books {wishlist.size > 0 && `(${wishlist.size})`}
          </button>
        </div>

        {/* Auth section */}
        <div style={{ padding: '20px', marginTop: 'auto' }}>
          {user ? (
            <div>
              <div style={{ padding: '12px', background: '#F5F3EE', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1C1917' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#78716C', marginTop: '2px' }}>{user.email}</div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                  {user.isEmailVerified
                    ? <span style={{ fontSize: '11px', fontWeight: 600, color: '#3D5A3E', background: '#EBF2EB', borderRadius: '4px', padding: '2px 8px' }}>✓ Verified</span>
                    : <span onClick={() => handleOpenAuth('verify')} style={{ fontSize: '11px', fontWeight: 600, color: '#92400E', background: '#FEF3C7', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>Verify Email</span>
                  }
                </div>
              </div>
              {user.role === 'admin' && (
                <button onClick={() => { navigateToDashboard(); setMobileMenuOpen(false); }} style={{ background: 'none', border: '1px solid #EDEAE3', borderRadius: '6px', cursor: 'pointer', padding: '10px 16px', fontSize: '14px', fontWeight: 500, color: '#3D5A3E', width: '100%', marginBottom: '8px', textAlign: 'left' }}>
                  <DashboardOutlined style={{ marginRight: '8px' }} /> Store Dashboard
                </button>
              )}
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', padding: '10px 16px', fontSize: '14px', fontWeight: 500, color: '#DC2626', width: '100%', textAlign: 'left' }}>
                <LogoutOutlined style={{ marginRight: '8px' }} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => handleOpenAuth('login')} style={{ background: '#1C1917', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#fff', width: '100%' }}>Sign In</button>
              <button onClick={() => handleOpenAuth('signup')} style={{ background: 'none', border: '1px solid #E8E4DE', borderRadius: '6px', cursor: 'pointer', padding: '12px', fontSize: '14px', fontWeight: 600, color: '#1C1917', width: '100%' }}>Create Account</button>
            </div>
          )}
        </div>
      </Drawer>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-actions { display: flex !important; }
        }
        @media (min-width: 861px) {
          .mobile-actions { display: none !important; }
        }
        @media (min-width: 861px) and (max-width: 1050px) {
          .desktop-nav { gap: 16px !important; }
          .desktop-actions { gap: 6px !important; }
        }
      `}</style>
    </>
  );
};
