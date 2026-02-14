import { DashboardGrid } from '../components/DashboardGrid';

export default function HomePage() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>
            Operations Dashboard
          </h1>
          <p style={{ color: 'var(--muted)' }}>
            Real-time monitoring for FreeFlow assets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
            Export
          </button>
          <button
            type="button"
            style={{
              border: 'none',
              background: 'var(--accent)',
              color: '#0c1416',
              padding: '0.5rem 1rem',
              borderRadius: 12,
              fontWeight: 600,
            }}
          >
            New Task
          </button>
        </div>
      </section>
      <DashboardGrid />
    </div>
  );
}
