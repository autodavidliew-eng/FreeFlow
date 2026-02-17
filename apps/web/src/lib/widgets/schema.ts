import { z } from 'zod';

import type {
  DashboardLayout,
  WidgetCatalogItem,
  WidgetCatalogResponse,
} from './types';

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
  widgets: z.array(widgetConfigSchema).default([]),
});

export const dashboardLayoutSchema = z.object({
  version: z.number().int().min(1),
  sections: z.array(widgetSectionSchema).default([]),
});

export const widgetCatalogItemSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  defaultConfig: z.record(z.unknown()).nullable().optional(),
});

export const widgetCatalogResponseSchema = z.object({
  items: z.array(widgetCatalogItemSchema).default([]),
  total: z.number().int().default(0),
});

export const fallbackWidgetCatalog: WidgetCatalogItem[] = [
  {
    key: 'kpi-widget',
    name: 'Key Metrics',
    type: 'kpi',
    defaultConfig: { emphasis: 'summary' },
  },
  {
    key: 'chart-widget',
    name: 'Load Distribution',
    type: 'chart',
    defaultConfig: { series: ['Energy', 'Water'] },
  },
  {
    key: 'emeter-weekly-widget',
    name: 'Emeter Weekly',
    type: 'chart',
    defaultConfig: { meterId: 'emeter-001', rangeDays: 7 },
  },
  {
    key: 'alarm-widget',
    name: 'Active Alarms',
    type: 'alarm-list',
    defaultConfig: { severities: ['high', 'medium', 'low'] },
  },
];

export const fallbackWidgetCatalogResponse: WidgetCatalogResponse = {
  items: fallbackWidgetCatalog,
  total: fallbackWidgetCatalog.length,
};

export const fallbackDashboardLayout: DashboardLayout = {
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
    {
      id: 'energy-weekly',
      title: 'Energy Trend',
      layout: 'stack',
      widgets: [
        {
          instanceId: 'emeter-weekly',
          widgetId: 'emeter-weekly-widget',
          size: 'full',
          options: { meterId: 'emeter-001' },
        },
      ],
    },
  ],
};
