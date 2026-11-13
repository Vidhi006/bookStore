import { apiRequest } from '@/services/http';
import type { ApiResult } from '@/services/http';

/**
 * Network access for the external catalogue proxies.
 *
 * The proxy URLs themselves are built by `catalogEndpoints` so that paging
 * links (`?page=`, `?startIndex=`, `?next=`) stay in one place. This service
 * only owns the request.
 */
export const catalogService = {
  fetchPage: <T = unknown>(url: string): Promise<ApiResult<T>> =>
    apiRequest<T>(url),
};
