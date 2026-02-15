import { render, screen } from '@testing-library/react';

import type { DashboardLayout } from '../../../lib/widgets/types';
import { WidgetRenderer } from '../WidgetRenderer';

describe('WidgetRenderer', () => {
  const layout: DashboardLayout = {
    version: 1,
    sections: [
      {
        id: 'overview',
        title: 'Today',
        layout: 'grid',
        columns: 2,
        widgets: [
          { instanceId: 'kpi-1', widgetId: 'kpi-widget' },
          { instanceId: 'chart-1', widgetId: 'chart-widget' },
        ],
      },
      {
        id: 'alerts',
        title: 'Alerts',
        layout: 'stack',
        widgets: [{ instanceId: 'alarm-1', widgetId: 'alarm-widget' }],
      },
    ],
  };

  it('renders only the allowed widgets', () => {
    const allowed = new Set(['kpi-widget', 'alarm-widget']);
    render(<WidgetRenderer layout={layout} allowedWidgets={allowed} />);

    expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    expect(screen.getByText('Active Alarms')).toBeInTheDocument();
    expect(screen.queryByText('Load Distribution')).not.toBeInTheDocument();
  });

  it('shows a fallback for unknown widgets', () => {
    const unknownLayout: DashboardLayout = {
      version: 1,
      sections: [
        {
          id: 'mystery',
          widgets: [{ instanceId: 'unknown-1', widgetId: 'unknown-widget' }],
        },
      ],
    };

    render(<WidgetRenderer layout={unknownLayout} />);
    expect(
      screen.getByText('Unknown widget: unknown-widget')
    ).toBeInTheDocument();
  });
});
