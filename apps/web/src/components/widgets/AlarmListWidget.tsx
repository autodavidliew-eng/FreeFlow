export const ALARM_WIDGET_ID = 'alarm-widget';

const alarms = [
  { label: 'Cooling loop pressure low', severity: 'High' },
  { label: 'Generator A maintenance due', severity: 'Medium' },
  { label: 'Network latency spike', severity: 'Low' },
];

export function AlarmListWidget() {
  return (
    <section
      data-widget-id={ALARM_WIDGET_ID}
      className="plane-card"
      style={{ display: 'grid', gap: '0.75rem' }}
    >
      <div className="section-title">Active Alarms</div>
      <ul style={{ listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
        {alarms.map((alarm) => (
          <li
            key={alarm.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>{alarm.label}</span>
            <span style={{ color: 'var(--accent)' }}>{alarm.severity}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
