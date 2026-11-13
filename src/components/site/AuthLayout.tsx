import React from 'react';
import Image from 'next/image';

type AuthLayoutProps = {
  children: React.ReactNode;
  mode?: 'default' | 'login' | 'signup';
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, mode = 'default' }) => {
  const isSignup = mode === 'signup';
  const isLogin = mode === 'login';
  const isReference = isLogin || isSignup;

  return (
    <div className={`auth-page${isReference ? ' auth-page--reference' : ''}`}>
      <div className={`auth-card auth-card--split${isReference ? ' auth-card--reference' : ''}`}>
        <aside className={`auth-brand-panel${isReference ? ' auth-brand-panel--reference' : ''}`}>
          {isReference ? (
            <div className="auth-brand-panel__content">
              <Image
                className="auth-brand-panel__illustration"
                src="/signup-shopping.png"
                alt="Reader shopping for books in a cart"
                width={857}
                height={857}
                priority
              />
              <h2>ONLINE BOOK SHOPPING</h2>
            </div>
          ) : (
            <svg
              className="auth-brand-panel__illustration"
              viewBox="0 0 200 200"
              role="img"
              aria-label="Open book inside a blue circle"
            >
              <circle cx="100" cy="100" r="96" fill="#3275d9" />
              <circle cx="100" cy="100" r="82" fill="none" stroke="#8eb5f4" strokeWidth="3" />
              <path d="M100 78c-18-13-37-15-57-10v67c20-5 39-3 57 10V78Z" fill="#fff" />
              <path d="M100 78c18-13 37-15 57-10v67c-20-5-39-3-57 10V78Z" fill="#eaf1ff" />
              <path d="M100 78v67" stroke="#3275d9" strokeWidth="3" />
              <path
                d="M61 87c10-3 20-2 29 2m-29 10c10-3 20-2 29 2m-29 10c10-3 20-2 29 2m20-24c9-4 19-5 29-2m-29 14c9-4 19-5 29-2"
                fill="none"
                stroke="#8eb5f4"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <path
                d="m45 54 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Zm110-8 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z"
                fill="#fff"
              />
              <circle cx="37" cy="139" r="4" fill="#8eb5f4" />
              <circle cx="164" cy="145" r="5" fill="#8eb5f4" />
            </svg>
          )}
          {!isReference && (
            <>
              <h2>Welcome back!</h2>
              <p>Sign in to see your wishlist, track orders and get book recommendations.</p>
            </>
          )}
        </aside>
        <section
          className={`auth-form-panel${isReference ? ' auth-form-panel--reference' : ''}${isLogin ? ' auth-form-panel--login' : ''}`}
          aria-label={isSignup ? 'Create account' : 'Login'}
        >
          {children}
        </section>
      </div>
    </div>
  );
};
