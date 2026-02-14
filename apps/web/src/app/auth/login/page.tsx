export default function LoginPage() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Sign in</h1>
        <p style={{ color: 'var(--muted)' }}>
          Authenticate with Keycloak to access FreeFlow.
        </p>
      </div>
      <a
        href="/auth/login/start"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.75rem 1.5rem',
          borderRadius: 14,
          background: 'var(--accent)',
          color: '#0c1416',
          fontWeight: 600,
          width: 'fit-content',
        }}
      >
        Continue to Keycloak
      </a>
      <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
        Dev env vars: KEYCLOAK_ISSUER, KEYCLOAK_ID, KEYCLOAK_REDIRECT_URI,
        SESSION_SECRET.
      </div>
    </div>
  );
}
