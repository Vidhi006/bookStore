'use client';

import React, { useState } from 'react';
import { message } from 'antd';
import { signIn } from 'next-auth/react';
import { authService } from '@/services/authService';

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.59.27-3.13.76-4.59l-7.97-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    /> 
  </svg>
);

interface SocialAuthButtonsProps {
  /** Same-origin path to open after the OAuth handshake completes. */
  next?: string;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ next = '/' }) => {
  const [redirecting, setRedirecting] = useState(false);

  const startOAuth = async () => {
    if (redirecting) return;
    setRedirecting(true);

    try {
      // Avoid sending users to Google with an empty client_id when the server
      // has no credentials configured yet.
      const { data: status } = await authService.getOAuthStatus();
      if (status?.google === false) {
        setRedirecting(false);
        message.error(
          'Google sign-in is not configured yet. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to .env.local and restart the server.'
        );
        return;
      }

      // Auth.js finishes the provider handshake, then hands control to the bridge
      // route which mints the application's existing `bookhaven_auth` JWT cookie.
      const callbackUrl = authService.oauthBridgeUrl(next);
      await signIn('google', { callbackUrl });
    } catch {
      setRedirecting(false);
      window.location.href = '/login?socialError=oauth_failed';
    }
  };

  return (
    <div className="auth-social">
      <button
        type="button"
        className="auth-social__btn auth-social__btn--google"
        onClick={startOAuth}
        disabled={redirecting}
      >
        <GoogleIcon />
        {redirecting ? 'Redirecting…' : 'Continue with Google'}
      </button>
    </div>
  );
};
