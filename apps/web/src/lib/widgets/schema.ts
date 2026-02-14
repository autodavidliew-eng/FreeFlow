import { z } from 'zod';

import type { DashboardLayout } from './types';

const widgetSizeSchema = z.enum(['full', 'half', 'third']);

export const widgetConfigSchema = z.object({
  instanceId: z.string().min(1),
  widgetId: z.string().min(1),
  title: z.string().optional(),
  size: widgetSizeSchema.optional(),
  options: z.record(z.unknown()).optional(),
});

export const widgetSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  layout: z.enum(['grid', 'stack']).optional(),
  columns: z.number().int().min(1).max(4).optional(),
  widgets: z.array(widgetConfigSchema).min(1),
});

export const dashboardLayoutSchema = z.object({
  version: z.number().int().min(1),
  sections: z.array(widgetSectionSchema).min(1),
});

const mockDashboardLayout: DashboardLayout = {
  version: 1,
  sections: [
    {
      id: 'metrics',
      title: 'Today',
      layout: 'stack',
      widgets: [
        {
          instanceId: 'kpi-primary',
          widgetId: 'kpi-widget',
          size: 'full',
        },
      ],
    },
    {
      id: 'ops-overview',
      title: 'Operational Overview',
      layout: 'grid',
      columns: 2,
      widgets: [
        {
          instanceId: 'chart-load',
          widgetId: 'chart-widget',
          size: 'half',
        },
        {
          instanceId: 'alarm-list',
          widgetId: 'alarm-widget',
          size: 'half',
        },
      ],
    },
  ],
};

export async function getDashboardLayout(): Promise<DashboardLayout> {
  // TODO: Replace with backend fetch once the gateway endpoint exists.
  return dashboardLayoutSchema.parse(mockDashboardLayout);
}
