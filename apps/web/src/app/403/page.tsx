import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div style={{ display: 'grid', gap: '1rem', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Access denied</h1>
        <p style={{ color: 'var(--muted)' }}>
          Your account does not have permission to view this page.
        </p>
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}
      >
        <Link
          href="/auth/login"
          style={{
            border: '1px solid var(--border)',
            padding: '0.5rem 1rem',
            borderRadius: 12,
            color: 'var(--text)',
            textDecoration: 'none',
          }}
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          style={{
            background: 'var(--accent)',
            padding: '0.5rem 1rem',
            borderRadius: 12,
            color: '#0c1416',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
