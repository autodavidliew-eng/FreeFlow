'use client';

import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      setError('Missing authorization code.');
      return;
    }

    const state = searchParams.get('state') ?? '';
    const url = `/auth/callback/complete?code=${encodeURIComponent(
      code
    )}&state=${encodeURIComponent(state)}`;
    window.location.replace(url);
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>
        Completing sign-in
      </h1>
      {error ? (
        <p style={{ color: '#ff8f8f' }}>Auth error: {error}</p>
      ) : (
        <p style={{ color: 'var(--muted)' }}>Redirecting back to FreeFlow.</p>
      )}
    </div>
  );
}
