'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type TooltipItem,
} from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';

import type { WidgetRenderProps } from '../../lib/widgets/types';
import { WidgetFrame } from '../dashboard/WidgetFrame';

export const EMETER_WEEKLY_WIDGET_ID = 'emeter-weekly-widget';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type WeeklyPoint = {
  date: string;
  energyKWh: number;
  powerAvgW: number;
};

type WeeklyResponse = {
  meterId: string;
  from: string;
  to: string;
  points: WeeklyPoint[];
};

const DEFAULT_METER_ID = 'emeter-001';
const DEFAULT_RANGE_DAYS = 7;
const REFRESH_MS = 60_000;

const formatDay = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export function EmeterWeeklyWidget({ config }: WidgetRenderProps) {
  const [series, setSeries] = useState<WeeklyResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  const meterId =
    (config?.options?.meterId as string | undefined) ?? DEFAULT_METER_ID;
  const rangeDays =
    typeof config?.options?.rangeDays === 'number'
      ? config.options.rangeDays
      : DEFAULT_RANGE_DAYS;

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        const url = new URL('/api/emeter/weekly', window.location.origin);
        url.searchParams.set('meterId', meterId);
        url.searchParams.set('days', String(rangeDays));

        const response = await fetch(url.toString(), {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const payload = (await response.json()) as WeeklyResponse;
        if (!active) {
          return;
        }
        setSeries(payload);
        setStatus('ready');
      } catch {
        if (!active) {
          return;
        }
        setStatus('error');
      }
    };

    setStatus('loading');
    load();
    interval = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [meterId, rangeDays]);

  const chartData = useMemo(() => {
    const points = series?.points ?? [];
    return {
      labels: points.map((point) => formatDay(point.date)),
      datasets: [
        {
          label: 'Energy (kWh)',
          data: points.map((point) => Number(point.energyKWh ?? 0)),
          borderColor: '#5ce0d8',
          backgroundColor: 'rgba(92, 224, 216, 0.2)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    };
  }, [series]);

  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) => {
              const raw =
                typeof context.raw === 'number'
                  ? context.raw
                  : Number(context.raw ?? 0);
              return `Energy: ${raw.toFixed(2)} kWh`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#9aa7c1' },
          grid: { color: 'rgba(154, 167, 193, 0.12)' },
        },
        y: {
          ticks: { color: '#9aa7c1' },
          grid: { color: 'rgba(154, 167, 193, 0.12)' },
        },
      },
    }),
    []
  );

  let body = null;

  if (status === 'loading') {
    body = <div className="ff-chart-loading">Loading weekly data…</div>;
  } else if (status === 'error') {
    body = <div className="ff-chart-error">Unable to load meter data.</div>;
  } else if (!series || series.points.length === 0) {
    body = (
      <div className="ff-chart-empty">
        No data for the last {rangeDays} days.
      </div>
    );
  } else {
    body = (
      <div className="ff-chart-shell ff-chart-shell--line">
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  }

  const subtitle = series
    ? `Meter ${series.meterId} • ${new Date(series.from).toLocaleDateString()} - ${new Date(
        series.to
      ).toLocaleDateString()}`
    : 'Last 7 days';

  return (
    <WidgetFrame
      title="Emeter Weekly Trend"
      subtitle={subtitle}
      widgetId={config?.widgetId ?? EMETER_WEEKLY_WIDGET_ID}
      variant="chart"
    >
      {body}
    </WidgetFrame>
  );
}
