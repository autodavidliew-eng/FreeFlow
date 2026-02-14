export const CHART_WIDGET_ID = 'chart-widget';

export function ChartPlaneWidget() {
  return (
    <section
      data-widget-id={CHART_WIDGET_ID}
      className="plane-card"
      style={{ display: 'grid', gap: '0.75rem' }}
    >
      <div className="section-title">Load Distribution</div>
      <div
        style={{
          height: 180,
          borderRadius: 12,
          background:
            'linear-gradient(120deg, rgba(104, 240, 200, 0.15), rgba(121, 167, 255, 0.08))',
          border: '1px solid rgba(104, 240, 200, 0.25)',
        }}
      />
      <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
        Mock data for peak utilization across assets.
      </div>
    </section>
  );
}
