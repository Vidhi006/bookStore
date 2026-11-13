'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Input, Select, Spin } from 'antd';
import {
  BookOutlined,
  GlobalOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { CatalogCard, CatalogSource, GutendexBook, GutendexResponse } from '@/types';
import { useBookStore } from '@/context/BookStoreContext';
import { catalogEndpoints } from '@/config/apiEndpoints';
import { catalogService } from '@/services/catalogService';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

interface InfiniteCatalogProps {
  title?: string;
  subtitle?: string;
}

export const InfiniteCatalog: React.FC<InfiniteCatalogProps> = ({
  title = 'Classic Literature Archive',
  subtitle = 'Explore over 10,000 timeless literary classics with real-time continuous scroll. Read free online or order archival print editions.',
}) => {
  const { addToCart, user } = useBookStore();
  const [source, setSource] = useState<CatalogSource>('gutendex');
  const [books, setBooks] = useState<CatalogCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [totalHint, setTotalHint] = useState<number | null>(null);

  const nextUrlRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sourceRef = useRef<CatalogSource>('gutendex');

  const firstPageFor = useCallback((src: CatalogSource, query: string, lang: string) => {
    if (src === 'gutendex') {
      return catalogEndpoints.gutendex({ search: query.trim(), languages: lang });
    }
    if (src === 'openlibrary') {
      return catalogEndpoints.openlibrary({
        q: query.trim() || 'fiction',
        page: 1,
        limit: 20,
      });
    }
    return catalogEndpoints.google({
      q: query.trim() || 'fiction',
      startIndex: 0,
      maxResults: 20,
    });
  }, []);

  const mapGutendex = (item: GutendexBook): CatalogCard => ({
    id: `gutendex-${item.id}`,
    title: item.title,
    authors: item.authors.map((a) => a.name).join(', ') || 'Unknown author',
    coverUrl: item.formats['image/jpeg'],
    source: 'gutendex',
    downloads: item.download_count,
    readUrl: item.formats['text/html'] || item.formats['text/plain; charset=utf-8'] || item.formats['text/plain'],
    raw: item,
  });

  const loadMore = useCallback(async (customUrl?: string, replace: boolean = false) => {
    const url = customUrl || nextUrlRef.current;
    if (!url || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await catalogService.fetchPage<any>(url);
      if (!result.ok) {
        throw new Error(`Unable to load books (${result.status}).`);
      }

      const src = sourceRef.current;
      let mapped: CatalogCard[] = [];
      let next: string | null = null;
      let more = false;
      let count: number | null = null;

      if (src === 'gutendex') {
        const data: GutendexResponse = result.data;
        mapped = (data.results || []).map(mapGutendex);
        count = data.count ?? null;
        more = data.next !== null;
        next = data.next ? catalogEndpoints.gutendex({ next: data.next }) : null;
      } else if (src === 'openlibrary') {
        const data = result.data as any;
        mapped = (data.docs || []).map((doc: {
          key?: string;
          title?: string;
          author_name?: string[];
          cover_i?: number;
          first_publish_year?: number;
        }) => ({
          id: `ol-${doc.key || doc.title}`,
          title: doc.title || 'Untitled',
          authors: (doc.author_name || []).join(', ') || 'Unknown author',
          coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
          source: 'openlibrary' as const,
          year: doc.first_publish_year,
          readUrl: doc.key ? `https://openlibrary.org${doc.key}` : undefined,
          raw: doc,
        }));
        count = data.count ?? null;
        more = Boolean(data.hasMore);
        next = more
          ? catalogEndpoints.openlibrary({
              q: searchQuery.trim() || 'fiction',
              page: data.nextPage,
              limit: 20,
            })
          : null;
      } else {
        const data = result.data as any;
        mapped = (data.items || []).map((item: {
          id?: string;
          volumeInfo?: {
            title?: string;
            authors?: string[];
            imageLinks?: { thumbnail?: string; smallThumbnail?: string };
            publishedDate?: string;
            previewLink?: string;
            infoLink?: string;
          };
        }) => ({
          id: `google-${item.id || item.volumeInfo?.title}`,
          title: item.volumeInfo?.title || 'Untitled',
          authors: (item.volumeInfo?.authors || []).join(', ') || 'Unknown author',
          coverUrl: item.volumeInfo?.imageLinks?.thumbnail || item.volumeInfo?.imageLinks?.smallThumbnail,
          source: 'google' as const,
          year: item.volumeInfo?.publishedDate ? Number(item.volumeInfo.publishedDate.slice(0, 4)) : undefined,
          readUrl: item.volumeInfo?.previewLink || item.volumeInfo?.infoLink,
          raw: item,
        }));
        count = data.totalItems ?? null;
        more = Boolean(data.hasMore);
        next = more
          ? catalogEndpoints.google({
              q: searchQuery.trim() || 'fiction',
              startIndex: data.nextIndex,
              maxResults: 20,
            })
          : null;
      }

      setTotalHint(count);
      setBooks((previous) => {
        const base = replace ? [] : previous;
        const ids = new Set(base.map((book) => book.id));
        return [...base, ...mapped.filter((book) => !ids.has(book.id))];
      });
      nextUrlRef.current = next;
      setHasMore(more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [searchQuery]);

  const resetAndLoad = useCallback(
    (src: CatalogSource, query: string, lang: string) => {
      sourceRef.current = src;
      setBooks([]);
      setHasMore(true);
      setError(null);
      const url = firstPageFor(src, query, lang);
      nextUrlRef.current = url;
      void loadMore(url, true);
    },
    [firstPageFor, loadMore]
  );

  useEffect(() => {
    resetAndLoad('gutendex', '', 'en');
    // first paint only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, error, books.length]);

  const handleSearch = (nextSource = source, nextLang = language) => {
    setSource(nextSource);
    resetAndLoad(nextSource, searchQuery, nextLang);
  };

  const handleAddToCart = (card: CatalogCard) => {
    addToCart({
      id: card.id,
      isbn: card.id.replace(/[^\w-]/g, '').slice(0, 20),
      title: card.title,
      author: card.authors,
      price: card.source === 'gutendex' ? 14.99 : 16.5,
      rating: 4.6,
      genre: 'Classic',
      stock: 12,
      coverImage: card.coverUrl || FALLBACK_COVER,
      description: `${card.title} from the ${card.source} public catalog.`,
      publishedYear: card.year || 1900,
      badge: 'Archive Print',
    });
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 40px 64px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 className="font-serif-title" style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 700, color: '#1C1917' }}>
              {title}
            </h2>
            <p style={{ margin: 0, color: '#78716C', fontSize: '15px', maxWidth: '640px' }}>{subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Select
              value={source}
              onChange={(val) => handleSearch(val)}
              style={{ width: 150 }}
              options={[
                { value: 'gutendex', label: 'Gutendex' },
                { value: 'openlibrary', label: 'Open Library' },
                { value: 'google', label: 'Google Books' },
              ]}
            />
            {source === 'gutendex' && (
              <Select
                value={language}
                onChange={(val) => {
                  setLanguage(val);
                  handleSearch(source, val);
                }}
                style={{ width: 110 }}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'all', label: 'All langs' },
                ]}
              />
            )}
            <Input
              prefix={<SearchOutlined style={{ color: '#C9C0B0' }} />}
              placeholder="Search title or author…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={() => handleSearch()}
              allowClear
              style={{ width: 240, borderRadius: 6 }}
            />
            <Button type="primary" onClick={() => handleSearch()} style={{ background: '#3D5A3E', borderColor: '#3D5A3E' }}>
              Search
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #EDEAE3' }}>
          <span style={{ fontSize: 13, color: '#A8A29E' }}>
            <strong style={{ color: '#1C1917' }}>{books.length}</strong> books loaded
            {totalHint ? ` · ${totalHint.toLocaleString()} matching` : ''}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#3D5A3E', background: '#EBF2EB', borderRadius: 4, padding: '3px 10px' }}>
            {source === 'gutendex' ? 'Project Gutenberg Public Domain' : source === 'openlibrary' ? 'Open Library Editions' : 'Google Books Catalog'}
          </span>
        </div>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 24,
        }}
      >
        {books.map((book) => (
          <article
            key={book.id}
            className="book-card-hover"
            style={{ border: '1px solid #EDEAE3', padding: 0, borderRadius: 10, background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ height: 210, background: '#F5F3EE', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  loading="lazy"
                  width={150}
                  height={210}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <div style={{ height: 210, display: 'grid', placeItems: 'center', color: '#A8A29E' }}>
                  <BookOutlined style={{ fontSize: 28 }} />
                  <div>No cover available</div>
                </div>
              )}
            </div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <h2 style={{ fontSize: 16, margin: 0, color: '#1C1917', lineHeight: 1.35 }}>{book.title}</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#A8A29E' }}>{book.authors}</p>
              {typeof book.downloads === 'number' && (
                <span style={{ fontSize: 11, color: '#3D5A3E', background: '#EBF2EB', alignSelf: 'flex-start', borderRadius: 4, padding: '2px 8px' }}>
                  <GlobalOutlined /> {book.downloads.toLocaleString()} reads
                </span>
              )}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {book.readUrl && (
                  <a
                    href={book.readUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textAlign: 'center', padding: '7px 0', border: '1px solid #EDEAE3', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#57534E', textDecoration: 'none' }}
                  >
                    Open listing
                  </a>
                )}
                <button
                  onClick={() => handleAddToCart(book)}
                  style={{
                    background: '#3D5A3E',
                    border: 'none',
                    borderRadius: 6,
                    padding: '9px 0',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <ShoppingCartOutlined />
                  {user ? 'Order print' : 'Sign in to order'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {error && (
        <div role="alert" style={{ marginTop: 24, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          <Alert
            message="Connection notice"
            description={error}
            type="warning"
            showIcon
            action={
              <Button size="small" icon={<ReloadOutlined />} onClick={() => void loadMore()} disabled={loading}>
                Retry
              </Button>
            }
          />
        </div>
      )}

      <div ref={sentinelRef} style={{ height: 1, marginTop: 24 }} />
      <div aria-live="polite" style={{ textAlign: 'center', padding: '12px 0 24px' }}>
        {loading && <Spin tip="Loading more books..." />}
        {!hasMore && !loading && <p style={{ color: '#8c8072' }}>You have reached the end of the catalog.</p>}
      </div>
    </div>
  );
};
