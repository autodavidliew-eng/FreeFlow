import type { WidgetRenderProps } from '../../lib/widgets/types';
import { WidgetFrame } from '../dashboard/WidgetFrame';

export const ALARM_WIDGET_ID = 'alarm-widget';

const alarms = [
  { label: 'Maximum demand current exceeded', severity: 'High', time: '09:42' },
  {
    label: 'Power utilization above baseline',
    severity: 'Medium',
    time: '10:18',
  },
  { label: 'Pump telemetry latency spike', severity: 'Low', time: '11:05' },
];

const severityClass: Record<string, string> = {
  High: 'is-high',
  Medium: 'is-medium',
  Low: 'is-low',
};

export function AlarmListWidget({ config }: WidgetRenderProps) {
  return (
    <WidgetFrame
      title="Active Alarms"
      subtitle="Alert feed"
      widgetId={config?.widgetId ?? ALARM_WIDGET_ID}
      variant="list"
      footer="Last updated 2 min ago"
    >
      <div className="ff-alarm-list">
        {alarms.map((alarm) => (
          <div key={alarm.label} className="ff-alarm-item">
            <div>
              <div className="ff-alarm-title">{alarm.label}</div>
              <div className="ff-alarm-time">{alarm.time}</div>
            </div>
            <span
              className={`ff-alarm-chip ${severityClass[alarm.severity] ?? ''}`}
            >
              {alarm.severity}
            </span>
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}
