export function Nav() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.2rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(15, 21, 23, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          }}
        />
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>FreeFlow</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Ops Portal
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="pill">v0.1</span>
        <button
          type="button"
          style={{
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text)',
            padding: '0.5rem 0.9rem',
            borderRadius: 12,
          }}
        >
          Invite
        </button>
      </div>
    </header>
  );
}
