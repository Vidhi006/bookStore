'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/site/AuthLayout';
import { useBookStore } from '@/context/BookStoreContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useBookStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    if (step === 1) {
      const result = await forgotPassword(email);
      setLoading(false);
      if (result.success) setStep(2);
      else setError(result.error || 'Could not send the reset code.');
      return;
    }
    const result = await resetPassword(email, code, newPassword);
    setLoading(false);
    if (result.success) router.push('/login');
    else setError(result.error || 'Could not reset your password.');
  };

  return (
    <AuthLayout>
      <Link href="/login" className="auth-back">
        ← Back to Login
      </Link>
      <h1 style={{ fontSize: 25, fontWeight: 500, marginBottom: 12 }}>
        {step === 1 ? 'Forgot your Password?' : 'Reset your Password'}
      </h1>
      <p style={{ fontSize: 15, color: '#878787', lineHeight: 1.35, marginBottom: 18 }}>
        {step === 1
          ? "Enter your email address and we'll send you a code to reset your password."
          : 'Enter the code we emailed you along with your new password.'}
      </p>

      <form className="auth-form" onSubmit={submit}>
        <div className="field">
          <label>Email Id</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            readOnly={step === 2}
          />
        </div>

        {step === 2 && (
          <>
            <div className="field">
              <label>Reset code</label>
              <input value={code} onChange={(event) => setCode(event.target.value)} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>
          </>
        )}

        {error && <p style={{ color: '#a03037', fontSize: 11 }}>{error}</p>}

        <button type="submit" className="btn btn--maroon btn--block auth-form__submit" disabled={loading}>
          {loading ? 'Please wait…' : step === 1 ? 'Reset Password' : 'Save New Password'}
        </button>
      </form>

      <div className="auth-card__footer">
        <Link href="/signup">Create Account</Link>
      </div>
    </AuthLayout>
  );
}
