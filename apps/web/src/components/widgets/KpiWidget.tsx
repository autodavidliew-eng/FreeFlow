export const KPI_WIDGET_ID = 'kpi-widget';

const kpis = [
  { label: 'Flow Rate', value: '92%', delta: '+4.2%' },
  { label: 'Energy Use', value: '1.2 MW', delta: '-1.1%' },
  { label: 'Active Tasks', value: '36', delta: '+8' },
  { label: 'Alerts', value: '3', delta: '-2' },
];

export function KpiWidget() {
  return (
    <section
      data-widget-id={KPI_WIDGET_ID}
      style={{ display: 'grid', gap: '0.75rem' }}
    >
      <div className="section-title">Key Metrics</div>
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
    </section>
  );
}
