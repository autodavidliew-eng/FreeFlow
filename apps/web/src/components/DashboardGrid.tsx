type Kpi = {
  label: string;
  value: string;
  delta: string;
};

const kpis: Kpi[] = [
  { label: 'Flow Rate', value: '92%', delta: '+4.2%' },
  { label: 'Energy Use', value: '1.2 MW', delta: '-1.1%' },
  { label: 'Active Tasks', value: '36', delta: '+8' },
  { label: 'Alerts', value: '3', delta: '-2' },
];

export function DashboardGrid() {
  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <div className="section-title">Today</div>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 600 }}>
              {kpi.value}
            </div>
            <div style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
              {kpi.delta}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        <div className="plane-card">
          <div className="section-title">System Load</div>
          <div
            style={{ height: 140, borderRadius: 12, background: '#0b1214' }}
          />
        </div>
        <div className="plane-card">
          <div className="section-title">Alarm Watch</div>
          <ul style={{ listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
            <li>Cooling loop pressure low</li>
            <li>Generator A maintenance due</li>
            <li>Network latency spike</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
