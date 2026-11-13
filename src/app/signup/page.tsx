'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/site/AuthLayout';
import { useBookStore } from '@/context/BookStoreContext';

export default function SignupPage() {
  const router = useRouter();
  const { signup, verifyEmail } = useBookStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    if (needsVerify) {
      const result = await verifyEmail(email, code);
      setLoading(false);
      if (result.success) router.push('/');
      else setError(result.error || 'Verification failed.');
      return;
    }
    const result = await signup(name, email, password, mobile);
    setLoading(false);
    if (result.success) setNeedsVerify(true);
    else setError(result.error || 'Signup failed.');
  };

  return (
    <AuthLayout mode="signup">
      <header>
        <nav className="auth-mode-tabs" aria-label="Account access">
          <Link href="/login">LOGIN</Link>
          <h1 aria-current="page">SIGNUP</h1>
        </nav>
      </header>
      <form className="auth-form auth-form--reference" onSubmit={submit}>
        <div className="field">
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required={!needsVerify}
          />
        </div>
        <div className="field">
          <label htmlFor="signup-email">Email Id</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required={!needsVerify}
          />
        </div>
        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <div className="auth-password-field">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required={!needsVerify}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="signup-mobile">Mobile Number</label>
          <input
            id="signup-mobile"
            type="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
          />
        </div>

        {needsVerify && (
          <div className="field">
            <label htmlFor="signup-code">Verification code</label>
            <input
              id="signup-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </div>
        )}

        {error && <p className="auth-error--reference" role="alert">{error}</p>}

        <button type="submit" className="btn btn--maroon btn--block auth-form__submit" disabled={loading}>
          {loading ? 'Please wait…' : needsVerify ? 'Verify Email' : 'Signup'}
        </button>
      </form>

      {needsVerify && (
        <div className="auth-card__hint">
          Check your email for the 6-digit verification code and enter it above.
        </div>
      )}
    </AuthLayout>
  );
}
