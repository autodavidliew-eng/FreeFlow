import type { WidgetRenderProps } from '../../lib/widgets/types';
import { WidgetFrame } from '../dashboard/WidgetFrame';

export const LINE_CHART_WIDGET_ID = 'chart-widget';

const series = [12, 18, 14, 24, 19, 28, 22, 30];

const buildPath = (values: number[]) => {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
};

export function LineChartWidget({ config }: WidgetRenderProps) {
  return (
    <WidgetFrame
      title="Load Distribution"
      subtitle="Daily energy & water usage"
      widgetId={config?.widgetId ?? LINE_CHART_WIDGET_ID}
      variant="chart"
    >
      <div className="ff-chart-shell">
        <svg viewBox="0 0 100 100" className="ff-chart-svg">
          <path
            d={buildPath(series)}
            fill="none"
            stroke="url(#ffChartGradient)"
            strokeWidth="2.5"
          />
          <defs>
            <linearGradient id="ffChartGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#46d2c6" />
              <stop offset="100%" stopColor="#6ba5ff" />
            </linearGradient>
          </defs>
        </svg>
        <div className="ff-chart-grid" />
      </div>
      <div className="ff-chart-meta">
        Updated 11:30 AM • Forecast +3.2% peak load
      </div>
    </WidgetFrame>
  );
}
