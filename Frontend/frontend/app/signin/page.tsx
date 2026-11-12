'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError, apiRequest, type AuthUser } from '../../lib/api';

export default function SignIn() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest<{ user: AuthUser }>('/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((requestError: unknown) => {
        if (!(requestError instanceof ApiError && requestError.status === 401)) {
          setError(requestError instanceof Error ? requestError.message : 'Could not connect to TrustTrade.');
        }
      });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const formData = new FormData(event.currentTarget);

    try {
      const result = await apiRequest<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: {
          email: formData.get('email'),
          password: formData.get('password'),
        },
      });
      setUser(result.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setError('');
    setBusy(true);
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not sign out.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="connection-page">
      <Link href="/" className="back">← Back to TrustTrade</Link>
      <span className="eyebrow">WELCOME BACK</span>
      <h1>Sign in to TrustTrade</h1>
      {user ? (
        <section className="connection-card">
          <p>Signed in as <strong>{user.firstName} {user.lastName}</strong> ({user.role.toLowerCase()}).</p>
          <button className="button" type="button" onClick={signOut} disabled={busy}>
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </section>
      ) : (
        <form className="connection-card connection-form" onSubmit={submit}>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p>New to TrustTrade? <Link href="/signup/artisan">Create an artisan account</Link></p>
        </form>
      )}
      {user && error && <p className="form-error" role="alert">{error}</p>}
      {!user && error && <p className="connection-help">Check that the API is running, then try again.</p>}
    </main>
  );
}
