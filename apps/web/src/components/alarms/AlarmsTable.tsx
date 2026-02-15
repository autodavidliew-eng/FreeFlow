import type { AlarmRecord } from '../../lib/alarms/types';

const severityClass: Record<string, string> = {
  High: 'is-high',
  Medium: 'is-medium',
  Low: 'is-low',
};

const statusClass: Record<string, string> = {
  Open: 'is-open',
  Acknowledged: 'is-ack',
  Resolved: 'is-resolved',
};

type AlarmsTableProps = {
  alarms: AlarmRecord[];
};

export function AlarmsTable({ alarms }: AlarmsTableProps) {
  if (alarms.length === 0) {
    return <div className="ff-empty-state">No alarms match your filters.</div>;
  }

  return (
    <div className="ff-alarm-table">
      <div className="ff-alarm-table__header">
        <div>Site</div>
        <div>Device</div>
        <div>Category</div>
        <div>Severity</div>
        <div>Description</div>
        <div>Last Action</div>
        <div>Status</div>
      </div>
      {alarms.map((alarm) => (
        <div key={alarm.id} className="ff-alarm-table__row">
          <div className="ff-alarm-site">{alarm.site}</div>
          <div>{alarm.device}</div>
          <div>{alarm.category}</div>
          <div>
            <span
              className={`ff-alarm-chip ${severityClass[alarm.severity] ?? ''}`}
            >
              {alarm.severity}
            </span>
          </div>
          <div className="ff-alarm-desc">{alarm.description}</div>
          <div className="ff-alarm-time">{alarm.timestamp}</div>
          <div>
            <span
              className={`ff-alarm-status ${statusClass[alarm.status] ?? ''}`}
            >
              {alarm.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
