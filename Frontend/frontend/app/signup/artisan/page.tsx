'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { apiRequest } from '../../../lib/api';

export default function ArtisanSignup() {
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());
    if (!body.phone) delete body.phone;

    try {
      await apiRequest('/auth/register/artisan', {
        method: 'POST',
        body,
      });
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create your artisan account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="connection-page">
      <Link href="/" className="back">← Back to TrustTrade</Link>
      <span className="eyebrow">FOR SKILLED PROFESSIONALS</span>
      <h1>Start building your reputation.</h1>
      {submitted ? (
        <section className="connection-card" role="status">
          <h2>Registration received</h2>
          <p>Your artisan profile was created. Sign in to continue.</p>
          <Link className="button" href="/signin">Go to sign in</Link>
        </section>
      ) : (
        <form className="connection-card connection-form" onSubmit={submit}>
          <div className="connection-fields">
            <label>First name<input name="firstName" autoComplete="given-name" minLength={2} required /></label>
            <label>Last name<input name="lastName" autoComplete="family-name" minLength={2} required /></label>
          </div>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Phone number <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <label>Business or profile name<input name="businessName" minLength={2} required /></label>
          <label>Your trade or skill<input name="skill" minLength={2} placeholder="e.g. Electrician" required /></label>
          <div className="connection-fields">
            <label>City<input name="city" autoComplete="address-level2" minLength={2} required /></label>
            <label>Region<input name="region" autoComplete="address-level1" minLength={2} required /></label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Creating profile…' : 'Create artisan profile'}
          </button>
          <p>Already have an account? <Link href="/signin">Sign in</Link></p>
        </form>
      )}
    </main>
  );
}
