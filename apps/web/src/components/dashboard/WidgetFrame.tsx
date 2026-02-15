import type { ReactNode } from 'react';

import type { WidgetSize } from '../../lib/widgets/types';

type WidgetFrameProps = {
  title?: string;
  subtitle?: string;
  meta?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  widgetId?: string;
  size?: WidgetSize;
  variant?: 'default' | 'kpi' | 'list' | 'chart';
  className?: string;
};

export function WidgetFrame({
  title,
  subtitle,
  meta,
  actions,
  footer,
  children,
  widgetId,
  variant = 'default',
  className,
}: WidgetFrameProps) {
  const classes = ['ff-widget', `ff-widget--${variant}`];
  if (className) {
    classes.push(className);
  }

  const hasHeader = Boolean(title || subtitle || meta || actions);

  return (
    <section data-widget-id={widgetId} className={classes.join(' ')}>
      {hasHeader ? (
        <header className="ff-widget__header">
          <div>
            {title ? <div className="ff-widget__title">{title}</div> : null}
            {subtitle ? (
              <div className="ff-widget__subtitle">{subtitle}</div>
            ) : null}
            {meta ? <div className="ff-widget__meta">{meta}</div> : null}
          </div>
          {actions ? <div className="ff-widget__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="ff-widget__body">{children}</div>
      {footer ? <div className="ff-widget__footer">{footer}</div> : null}
    </section>
  );
}
