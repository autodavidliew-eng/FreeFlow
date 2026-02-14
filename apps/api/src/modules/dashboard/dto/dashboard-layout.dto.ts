export type DashboardWidgetConfigDto = {
  instanceId: string;
  widgetId: string;
  title?: string;
  size?: 'full' | 'half' | 'third';
  options?: Record<string, unknown>;
};

export type DashboardSectionDto = {
  id: string;
  title?: string;
  layout?: 'grid' | 'stack';
  columns?: number;
  widgets: DashboardWidgetConfigDto[];
};

export type DashboardLayoutDto = {
  version: number;
  sections: DashboardSectionDto[];
};
