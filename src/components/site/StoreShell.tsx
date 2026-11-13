import React from 'react';
import Link from 'next/link';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';

export interface Crumb {
  label: string;
  href?: string;
}

export const StoreShell: React.FC<{ crumbs?: Crumb[]; children: React.ReactNode }> = ({
  crumbs = [],
  children,
}) => (
  <div className="app-shell">
    <StoreHeader />
    {crumbs.length > 0 && (
      <div className="site-container breadcrumb">
        <Link href="/">Home</Link>
        {crumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb.label}-${index}`}>
            <span>/</span>
            {crumb.href ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span className="current">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    )}
    <main className="app-main">{children}</main>
    <StoreFooter />
  </div>
);
