const items = [
  { label: 'Dashboard', detail: 'Overview + KPIs' },
  { label: 'Mini Apps', detail: 'Field tools' },
  { label: 'Task Inbox', detail: 'Assignments' },
  { label: 'Alarms', detail: 'Active alerts' },
  { label: 'Profile', detail: 'Settings' },
];

export function QuickAccess() {
  return (
    <div>
      <div className="section-title">Quick Access</div>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '0.8rem 0.9rem',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ fontWeight: 600 }}>{item.label}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
