import { authEndpoints } from '@/config/apiEndpoints';
import { apiRequest, JSON_HEADERS } from '@/services/http';
import type { ApiResult } from '@/services/http';
import type { DispatchedEmail, User } from '@/types';

export interface LoginResponse {
  user?: User;
  error?: string;
  message?: string;
  requireVerification?: boolean;
  verificationCode?: string;
}

export interface SignupResponse {
  error?: string;
  emailSent?: boolean;
}

export interface VerifyEmailResponse {
  user?: User;
  error?: string;
}

export interface ResendCodeResponse {
  error?: string;
  verificationCode?: string;
}

export interface SimpleMessageResponse {
  error?: string;
}

export interface InboxResponse {
  count?: number;
  emails?: DispatchedEmail[];
}

export interface OAuthStatusResponse {
  google?: boolean;
}

export const authService = {
  login: (email: string, password: string): Promise<ApiResult<LoginResponse>> =>
    apiRequest<LoginResponse>(authEndpoints.login, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, password }),
    }),

  signup: (
    name: string,
    email: string,
    password: string,
    mobile?: string
  ): Promise<ApiResult<SignupResponse>> =>
    apiRequest<SignupResponse>(authEndpoints.signup, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ name, email, password, mobile }),
    }),

  verifyEmail: (
    email: string,
    code: string
  ): Promise<ApiResult<VerifyEmailResponse>> =>
    apiRequest<VerifyEmailResponse>(authEndpoints.verifyEmail, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, code }),
    }),

  resendCode: (email: string): Promise<ApiResult<ResendCodeResponse>> =>
    apiRequest<ResendCodeResponse>(authEndpoints.resendCode, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string): Promise<ApiResult<SimpleMessageResponse>> =>
    apiRequest<SimpleMessageResponse>(authEndpoints.forgotPassword, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email }),
    }),

  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ): Promise<ApiResult<SimpleMessageResponse>> =>
    apiRequest<SimpleMessageResponse>(authEndpoints.resetPassword, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ email, code, newPassword }),
    }),

  logout: (): Promise<ApiResult<SimpleMessageResponse>> =>
    apiRequest<SimpleMessageResponse>(authEndpoints.logout, { method: 'POST' }),

  getInbox: (): Promise<ApiResult<InboxResponse>> =>
    apiRequest<InboxResponse>(authEndpoints.inbox),

  getOAuthStatus: (): Promise<ApiResult<OAuthStatusResponse>> =>
    apiRequest<OAuthStatusResponse>(authEndpoints.oauthStatus),

  /** URL the OAuth button sends the browser to after Google completes. */
  oauthBridgeUrl: (next = '/'): string => authEndpoints.oauthBridge(next),
};
