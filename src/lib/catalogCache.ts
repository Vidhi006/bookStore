import { Book } from '@/types';

const CACHE_TTL_MS = 60_000;

type CatalogCache = { at: number; books: Book[] };

const globalForCatalog = globalThis as typeof globalThis & {
  __bookhavenCatalogCache?: CatalogCache | null;
};

/** Returns the cached catalogue, or null when missing/expired. */
export function getCachedCatalog(): Book[] | null {
  const cache = globalForCatalog.__bookhavenCatalogCache;
  if (!cache) return null;
  if (Date.now() - cache.at >= CACHE_TTL_MS) {
    globalForCatalog.__bookhavenCatalogCache = null;
    return null;
  }
  return cache.books;
}

/** Stores the catalogue for the next CACHE_TTL_MS. */
export function setCachedCatalog(books: Book[]): void {
  globalForCatalog.__bookhavenCatalogCache = { at: Date.now(), books };
}

/** Clears the cache so the next request reads fresh stock values from MongoDB. */
export function invalidateCatalogCache(): void {
  globalForCatalog.__bookhavenCatalogCache = null;
}
