import { userEndpoints } from '@/config/apiEndpoints';
import { apiRequest, JSON_HEADERS } from '@/services/http';
import type { ApiResult } from '@/services/http';
import type { Address, User } from '@/types';

export interface ProfileUpdates {
  name?: string;
  mobile?: string;
  addresses?: Address[];
  wishlist?: string[];
}

export interface ProfileResponse {
  user?: User;
  purchases?: unknown[];
  error?: string;
}

export const userService = {
  /** Session restore + purchase history (`GET /api/auth/profile`). */
  getProfile: (): Promise<ApiResult<ProfileResponse>> =>
    apiRequest<ProfileResponse>(userEndpoints.profile),

  /**
   * Profile / address / wishlist updates (`PATCH /api/auth/profile`).
   * Wishlist persistence goes through here — there is no `/api/wishlist`.
   */
  updateProfile: (
    updates: ProfileUpdates
  ): Promise<ApiResult<ProfileResponse>> =>
    apiRequest<ProfileResponse>(userEndpoints.profile, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(updates),
    }),
};
