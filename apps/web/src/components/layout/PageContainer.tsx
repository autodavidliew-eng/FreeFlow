import type { ReactNode } from 'react';

type PageContainerProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function PageContainer({
  title,
  subtitle,
  actions,
  className,
  children,
}: PageContainerProps) {
  const classes = ['ff-page', className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      {title ? (
        <header className="ff-page-header">
          <div>
            <div className="ff-page-title">{title}</div>
            {subtitle ? (
              <div className="ff-page-subtitle">{subtitle}</div>
            ) : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
