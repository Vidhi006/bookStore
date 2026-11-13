/**
 * Centralised API endpoint configuration.
 *
 * This file contains ONLY paths and URL builders. It must never perform a
 * network request — all request logic lives in `src/services/*`.
 *
 * Backend handlers stay where Next.js expects them (`src/app/api/**\/route.ts`).
 * This file is the single frontend source of truth for those paths.
 */

const API_ROOT = '/api';

type QueryValue = string | number | undefined | null;

/** Append only the query parameters that actually have a value. */
function withQuery(path: string, params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

// ── Authentication ───────────────────────────────────────────────────────────
const AUTH_ROOT = `${API_ROOT}/auth`;

export const authEndpoints = {
  login: `${AUTH_ROOT}/login`,
  signup: `${AUTH_ROOT}/signup`,
  verifyEmail: `${AUTH_ROOT}/verify-email`,
  resendCode: `${AUTH_ROOT}/resend-code`,
  forgotPassword: `${AUTH_ROOT}/forgot-password`,
  resetPassword: `${AUTH_ROOT}/reset-password`,
  logout: `${AUTH_ROOT}/logout`,
  /** Dev-only email log. Supports `?email=` on the server, unused by the UI. */
  inbox: `${AUTH_ROOT}/inbox`,
  oauthStatus: `${AUTH_ROOT}/oauth-status`,
  /** Auth.js handshake completion; mints the existing `bookhaven_auth` JWT. */
  oauthBridge: (next = '/') =>
    withQuery(`${AUTH_ROOT}/oauth-bridge`, { next }),
  /** Dev utility that seeds the demo accounts. No UI caller. */
  seed: `${AUTH_ROOT}/seed`,
} as const;

// ── User / Profile ───────────────────────────────────────────────────────────
// `GET` reads the profile + purchase history, `PATCH` updates profile,
// addresses and the persisted wishlist.
export const userEndpoints = {
  profile: `${AUTH_ROOT}/profile`,
} as const;

// ── Books ────────────────────────────────────────────────────────────────────
const BOOKS_ROOT = `${API_ROOT}/books`;

export interface BookListQuery {
  search?: string;
  isbn?: string;
  id?: string;
  genre?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const bookEndpoints = {
  list: (params: BookListQuery = {}) => withQuery(BOOKS_ROOT, { ...params }),
  create: BOOKS_ROOT,
  review: (bookId: string) =>
    `${BOOKS_ROOT}/${encodeURIComponent(bookId)}/review`,
} as const;

// ── Orders ───────────────────────────────────────────────────────────────────
// One path, three verbs: GET (queue), POST (place order), PATCH (status).
export const orderEndpoints = {
  base: `${API_ROOT}/orders`,
} as const;

// ── External catalogue proxies ───────────────────────────────────────────────
const CATALOG_ROOT = `${API_ROOT}/catalog`;

export const catalogEndpoints = {
  gutendex: (params: {
    search?: string;
    languages?: string;
    page?: string | number;
    next?: string;
  } = {}) => {
    const path = withQuery(`${CATALOG_ROOT}/gutendex`, {
      search: params.search,
      // "all" means "no language filter" in the UI.
      languages:
        params.languages && params.languages !== 'all'
          ? params.languages
          : undefined,
      page: params.page,
      next: params.next,
    });
    // Preserve the original default when no filters are supplied.
    return path === `${CATALOG_ROOT}/gutendex`
      ? `${CATALOG_ROOT}/gutendex?languages=en`
      : path;
  },

  openlibrary: (params: {
    q?: string;
    page?: string | number;
    limit?: string | number;
  } = {}) =>
    withQuery(`${CATALOG_ROOT}/openlibrary`, {
      q: params.q?.trim() || 'fiction',
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }),

  google: (params: {
    q?: string;
    startIndex?: string | number;
    maxResults?: string | number;
  } = {}) =>
    withQuery(`${CATALOG_ROOT}/google`, {
      q: params.q?.trim() || 'fiction',
      startIndex: params.startIndex ?? 0,
      maxResults: params.maxResults ?? 20,
    }),
} as const;

/**
 * Cart and Wishlist have no REST endpoints in this project.
 *
 * - Cart lives entirely in `localStorage` (`bookhaven_cart:<userId>`).
 * - Wishlist is stored in `localStorage` and persisted through
 *   `PATCH /api/auth/profile` with `{ wishlist: [...] }`
 *   (see `userEndpoints.profile`).
 *
 * No constants are declared here because inventing `/api/cart` or
 * `/api/wishlist` paths would create endpoints that do not exist.
 */
