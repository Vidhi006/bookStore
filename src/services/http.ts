/**
 * Shared HTTP helper for all frontend API services.
 *
 * The only place that calls `fetch`. It intentionally does NOT throw on
 * 4xx/5xx responses: callers receive `{ ok, status, data }` and keep their
 * existing error handling (server messages, toasts, branches) unchanged.
 *
 * Network failures and invalid JSON still throw, matching the previous
 * `await fetch(...); await response.json()` behaviour.
 */

export const JSON_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
};

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

export async function apiRequest<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const response = await fetch(url, init);
  const data = (await response.json()) as T;
  return { ok: response.ok, status: response.status, data };
}
