import type { ReactNode } from 'react';

import type {
  WidgetConfig,
  WidgetSection,
  WidgetSize,
} from '../../lib/widgets/types';

type DashboardGridProps = {
  sections: WidgetSection[];
  renderWidget: (widget: WidgetConfig) => ReactNode;
};

const resolveColumns = (section: WidgetSection) => {
  if (section.layout === 'stack') {
    return 1;
  }
  if (section.columns) {
    return section.columns;
  }
  return Math.min(3, Math.max(1, section.widgets.length));
};

const resolveSpan = (size: WidgetSize | undefined, columns: number) => {
  if (columns <= 1) {
    return 1;
  }
  if (size === 'full') {
    return columns;
  }
  if (size === 'half') {
    return Math.min(columns, Math.max(1, Math.ceil(columns / 2)));
  }
  if (size === 'third') {
    return 1;
  }
  return 1;
};

export function DashboardGrid({ sections, renderWidget }: DashboardGridProps) {
  return (
    <div className="ff-dashboard">
      {sections.map((section) => {
        const columns = resolveColumns(section);
        const gridTemplateColumns =
          columns === 1 ? '1fr' : `repeat(${columns}, minmax(260px, 1fr))`;

        return (
          <section key={section.id} className="ff-dashboard-section">
            {section.title ? (
              <div className="ff-dashboard-section__title">{section.title}</div>
            ) : null}
            <div className="ff-dashboard-grid" style={{ gridTemplateColumns }}>
              {section.widgets.map((widget) => {
                const span = resolveSpan(widget.size, columns);
                return (
                  <div
                    key={widget.instanceId}
                    style={{ gridColumn: `span ${span}` }}
                  >
                    {renderWidget(widget)}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
