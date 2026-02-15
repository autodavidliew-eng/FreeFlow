import { widgetRegistry } from '../../lib/widgets/registry';
import type { DashboardLayout, WidgetConfig } from '../../lib/widgets/types';

import { DashboardGrid } from './DashboardGrid';
import { WidgetFrame } from './WidgetFrame';

type WidgetRendererProps = {
  layout: DashboardLayout;
  allowedWidgets?: Set<string>;
};

function isAllowed(widgetId: string, allowed?: Set<string>) {
  if (!allowed) {
    return true;
  }
  return allowed.has(widgetId);
}

function renderWidget(config: WidgetConfig) {
  const entry = widgetRegistry[config.widgetId];
  if (!entry) {
    return (
      <WidgetFrame
        title="Unknown widget"
        subtitle={config.widgetId}
        widgetId={config.widgetId}
      >
        <div className="ff-empty-state">Unknown widget: {config.widgetId}</div>
      </WidgetFrame>
    );
  }

  const Widget = entry.component;
  return <Widget config={config} />;
}

export function WidgetRenderer({
  layout,
  allowedWidgets,
}: WidgetRendererProps) {
  const visibleSections = layout.sections
    .map((section) => ({
      ...section,
      widgets: section.widgets.filter((widget) =>
        isAllowed(widget.widgetId, allowedWidgets)
      ),
    }))
    .filter((section) => section.widgets.length > 0);

  if (visibleSections.length === 0) {
    return (
      <WidgetFrame title="No widgets available">
        <div className="ff-empty-state">
          No dashboard widgets are available for your role set.
        </div>
      </WidgetFrame>
    );
  }

  return (
    <DashboardGrid sections={visibleSections} renderWidget={renderWidget} />
  );
}
