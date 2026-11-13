'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/site/AuthLayout';
import { SocialAuthButtons } from '@/components/site/SocialAuthButtons';
import { useBookStore } from '@/context/BookStoreContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyEmail } = useBookStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialError, setSocialError] = useState('');
  const [nextPath, setNextPath] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Preserve a same-origin destination so login/OAuth returns the user there.
    const requestedNext = params.get('next');
    if (requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')) {
      setNextPath(requestedNext);
    }

    const socialCode = params.get('socialError');
    const authError = params.get('error');

    const messages: Record<string, string> = {
      google_not_configured:
        'Google sign-in is not configured yet. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to .env.local, then restart the server.',
      access_denied: 'Sign-in was cancelled.',
      invalid_state: 'Your sign-in session expired. Please try again.',
      oauth_failed: "We couldn't complete sign-in with that provider. Please try again.",
      unsupported_provider: 'That sign-in provider is not supported.',
      email_missing:
        'That account did not share an email address, so we could not sign you in.',
      email_not_verified:
        'Your email address is not verified with that provider, so we could not link the account.',
    };

    // Auth.js redirects back with `?error=<code>` on failure.
    const authErrorMessages: Record<string, string> = {
      Configuration:
        'Social sign-in is not configured yet. Add the AUTH_* provider credentials to .env.local and restart the server.',
      AccessDenied: 'Sign-in was cancelled or this account is not allowed.',
      Verification: 'That sign-in link is no longer valid. Please try again.',
      OAuthAccountNotLinked:
        'An account with this email already exists. Sign in with your password, then link the provider from your profile.',
      OAuthSignin: "We couldn't start sign-in with that provider. Please try again.",
      OAuthCallback: "We couldn't finish sign-in with that provider. Please try again.",
      Default: 'Social sign-in could not be completed.',
    };

    if (socialCode) {
      setSocialError(messages[socialCode] || 'Social sign-in could not be completed.');
    } else if (authError) {
      setSocialError(authErrorMessages[authError] || authErrorMessages.Default);
    }

    if (socialCode || authError) {
      params.delete('socialError');
      params.delete('error');
      const query = params.toString();
      window.history.replaceState({}, '', `/login${query ? `?${query}` : ''}`);
    }
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    if (needsVerify) {
      const result = await verifyEmail(email, code);
      setLoading(false);
      if (result.success) router.push(nextPath);
      else setError(result.error || 'Verification failed.');
      return;
    }
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push(nextPath);
    } else if (result.requireVerification) {
      setNeedsVerify(true);
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <AuthLayout mode="login">
      <header className="auth-heading">
        <h1>Login</h1>
        <p>Welcome back! Sign in to your account.</p>
      </header>
      {socialError && (
        <p className="auth-social-error" role="alert">
          {socialError}
        </p>
      )}

      <form className="auth-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-password-field">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required={!needsVerify}
            />
            <button type="button" onClick={() => setShowPassword((shown) => !shown)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {needsVerify && (
          <div className="field">
            <label>Verification code</label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="6-digit code"
              required
            />
          </div>
        )}

        <Link href="/forgot-password" className="auth-form__forgot">
          Forgot Password?
        </Link>

        {error && <p style={{ color: '#a03037', fontSize: 11 }}>{error}</p>}

        <button type="submit" className="btn btn--maroon btn--block auth-form__submit" disabled={loading}>
          {loading ? 'Please wait…' : needsVerify ? 'Verify Email' : 'Login'}
        </button>
      </form>

      <div className="auth-divider">OR</div>
      <SocialAuthButtons next={nextPath} />
      <div className="auth-card__footer">
        New to Bookstore? <Link href="/signup">Create an account</Link>
      </div>
    </AuthLayout>
  );
}
