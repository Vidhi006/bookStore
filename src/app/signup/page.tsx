'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/site/AuthLayout';
import { SocialAuthButtons } from '@/components/site/SocialAuthButtons';
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
      <header className="auth-heading">
        <h1>Create account</h1>
        <p>It only takes a minute.</p>
      </header>
      <form className="auth-form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            required={!needsVerify}
          />
        </div>
        <div className="field">
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required={!needsVerify}
          />
        </div>
        <div className="field">
          <label htmlFor="signup-mobile">Mobile number</label>
          <input
            id="signup-mobile"
            type="tel"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            placeholder="10-digit mobile number"
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
              placeholder="At least 6 characters"
              required={!needsVerify}
              minLength={6}
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

        {error && <p style={{ color: '#a03037', fontSize: 11 }}>{error}</p>}

        <button type="submit" className="btn btn--maroon btn--block auth-form__submit" disabled={loading}>
          {loading ? 'Please wait…' : needsVerify ? 'Verify Email' : 'Create account'}
        </button>
      </form>

      {needsVerify && (
        <div className="auth-card__hint">
          Check your email for the 6-digit verification code and enter it above.
        </div>
      )}

      <div className="auth-divider">OR</div>
      <SocialAuthButtons />

      <div className="auth-card__footer">
        Already a member? <Link href="/login">Login</Link>
      </div>
    </AuthLayout>
  );
}
