import type { CSSProperties } from 'react';

import { widgetRegistry } from '../../lib/widgets/registry';
import type { DashboardLayout, WidgetConfig } from '../../lib/widgets/types';

type WidgetRendererProps = {
  layout: DashboardLayout;
  allowedWidgets?: Set<string>;
};

const emptyStateStyle: CSSProperties = {
  textAlign: 'center',
  color: 'var(--muted)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: '1rem',
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
      <div className="plane-card" style={emptyStateStyle}>
        Unknown widget: {config.widgetId}
      </div>
    );
  }

  const Widget = entry.component;
  return <Widget config={config} />;
}

function resolveColumns(section: {
  layout?: 'grid' | 'stack';
  columns?: number;
  widgets: WidgetConfig[];
}) {
  if (section.layout === 'stack') {
    return 1;
  }
  if (section.columns) {
    return section.columns;
  }
  return Math.min(3, Math.max(1, section.widgets.length));
}

export function WidgetRenderer({ layout, allowedWidgets }: WidgetRendererProps) {
  const visibleSections = layout.sections
    .map((section) => ({
      ...section,
      widgets: section.widgets.filter((widget) =>
        isAllowed(widget.widgetId, allowedWidgets),
      ),
    }))
    .filter((section) => section.widgets.length > 0);

  if (visibleSections.length === 0) {
    return (
      <div className="plane-card" style={emptyStateStyle}>
        No dashboard widgets are available for your role set.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {visibleSections.map((section) => {
        const columns = resolveColumns(section);
        const gridTemplateColumns =
          columns === 1
            ? '1fr'
            : `repeat(${columns}, minmax(260px, 1fr))`;

        return (
          <section key={section.id} style={gridStyle}>
            {section.title ? (
              <div className="section-title">{section.title}</div>
            ) : null}
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns,
              }}
            >
              {section.widgets.map((widget) => (
                <div key={widget.instanceId}>{renderWidget(widget)}</div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
