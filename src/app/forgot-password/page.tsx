'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    <main className="forgot-password-page">
      <div className="forgot-password-canvas">
        <header className="forgot-password-header">
          <Link href="/" className="forgot-password-brand" aria-label="Bookstore home">
            <Image src="/book-logo.png" alt="" width={18} height={14} priority />
            <span>Bookstore</span>
          </Link>
        </header>

        <section className="forgot-password-content">
          <h1>{step === 1 ? 'Forgot Your Password?' : 'Reset Your Password'}</h1>
          <div className="forgot-password-card">
            <div className="forgot-password-card__body">
              <p>
                {step === 1
                  ? "Enter your email address and we'll send you a code to reset your password."
                  : 'Enter the code we emailed you along with your new password.'}
              </p>

              <form className="forgot-password-form" onSubmit={submit}>
                <div className="field">
                  <label htmlFor="forgot-email">Email Id</label>
                  <input
                    id="forgot-email"
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
                      <label htmlFor="forgot-code">Reset code</label>
                      <input
                        id="forgot-code"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="forgot-new-password">New password</label>
                      <input
                        id="forgot-new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </>
                )}

                {error && <p className="forgot-password-error" role="alert">{error}</p>}

                <button type="submit" className="forgot-password-submit" disabled={loading}>
                  {loading ? 'Please wait…' : step === 1 ? 'Reset Password' : 'Save New Password'}
                </button>
              </form>
            </div>

            <div className="forgot-password-card__footer">
              <Link href="/signup">Create Account</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
