import type { ReactNode } from 'react';

export type WidgetSize = 'full' | 'half' | 'third';

export type WidgetConfig = {
  instanceId: string;
  widgetId: string;
  title?: string;
  size?: WidgetSize;
  options?: Record<string, unknown>;
};

export type WidgetSection = {
  id: string;
  title?: string;
  layout?: 'grid' | 'stack';
  columns?: number;
  widgets: WidgetConfig[];
};

export type DashboardLayout = {
  version: number;
  sections: WidgetSection[];
};

export type WidgetRenderProps = {
  config?: WidgetConfig;
};

export type WidgetComponent = (props: WidgetRenderProps) => ReactNode;

export type WidgetRegistryEntry = {
  id: string;
  displayName: string;
  description?: string;
  component: WidgetComponent;
  defaultSize?: WidgetSize;
};

export type WidgetRegistry = Record<string, WidgetRegistryEntry>;
