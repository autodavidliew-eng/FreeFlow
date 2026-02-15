import type { WidgetRenderProps } from '../../lib/widgets/types';
import { WidgetFrame } from '../dashboard/WidgetFrame';

export const KPI_WIDGET_ID = 'kpi-widget';

const kpis = [
  { label: 'Daily Energy', value: '0.00 kWh', delta: '+0.4%' },
  { label: 'Water Usage', value: '0.0 L', delta: '+1.1%' },
  { label: 'Power Factor', value: '0.94', delta: '+0.02' },
  { label: 'Active Devices', value: '12', delta: '+2' },
];

export function KpiWidget({ config }: WidgetRenderProps) {
  return (
    <WidgetFrame
      title="Key Metrics"
      subtitle="Riverside Primary School"
      widgetId={config?.widgetId ?? KPI_WIDGET_ID}
      variant="kpi"
    >
      <div className="ff-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="ff-kpi-card">
            <div className="ff-kpi-label">{kpi.label}</div>
            <div className="ff-kpi-value">{kpi.value}</div>
            <div className="ff-kpi-delta">{kpi.delta}</div>
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}
