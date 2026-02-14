export type DashboardWidgetConfigDto = {
  instanceId: string;
  widgetId: string;
  title?: string;
  size?: 'full' | 'half' | 'third';
  options?: Record<string, unknown>;
};
