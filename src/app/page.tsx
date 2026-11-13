'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Spin } from 'antd';
import { useBookStore } from '@/context/BookStoreContext';
import { StoreShell } from '@/components/site/StoreShell';
import { SiteBookCard } from '@/components/site/SiteBookCard';

const PAGE_SIZE = 12;
const PAGE_WINDOW = 4;

export default function HomePage() {
  const { filteredBooks, catalogLoading, filters, setFilters, user } = useBookStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filters.searchQuery, filters.sortBy, filters.selectedGenre]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filteredBooks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const windowStart = Math.min(
    Math.max(1, safePage),
    Math.max(1, totalPages - PAGE_WINDOW + 1)
  );
  const pageNumbers = Array.from(
    { length: Math.min(PAGE_WINDOW, totalPages) },
    (_, index) => windowStart + index
  );

  return (
    <StoreShell>
      <div className="site-container">
        <div className="home-toolbar">
          <div className="home-toolbar__left">
            <h1 className="home-toolbar__title">Books</h1>
            <span className="home-toolbar__count">({filteredBooks.length} Items)</span>
          </div>
          <div className="home-toolbar__right">
            <span>Sort by</span>
            <select
              className="sort-select"
              value={filters.sortBy}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: event.target.value as typeof prev.sortBy,
                }))
              }
              aria-label="Sort books"
            >
              <option value="none">relevance</option>
              <option value="price-asc">Price : Low to High</option>
              <option value="price-desc">Price : High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        <div className="home-welcome">
          {user ? (
            <>
              <span className="home-welcome__hello">Hello {user.name.split(' ')[0]},</span>
              <span>
                <Link href="/orders" className="text-link">
                  My Orders
                </Link>
                <span style={{ margin: '0 10px', color: '#dcdcdc' }}>|</span>
                <Link href="/wishlist" className="text-link">
                  Wishlist
                </Link>
              </span>
            </>
          ) : (
            <>
              <span>
                <span className="home-welcome__hello">Welcome</span> — to access your account and manage orders
              </span>
              <Link href="/login" className="text-link">
                LOGIN/SIGNUP
              </Link>
            </>
          )}
        </div>

        {catalogLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '90px 0' }}>
            <Spin size="large" />
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No books found</div>
            <div className="empty-state__text">Try a different search or filter.</div>
          </div>
        ) : (
          <div className="book-grid">
            {visible.map((book) => (
              <SiteBookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button
              type="button"
              className="pagination__btn"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`pagination__btn ${safePage === pageNumber ? 'is-active' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="pagination__btn"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </nav>
        )}
      </div>
    </StoreShell>
  );
}
