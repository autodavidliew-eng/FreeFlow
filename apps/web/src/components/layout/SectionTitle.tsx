import type { ReactNode } from 'react';

type SectionTitleProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function SectionTitle({ children, icon, className }: SectionTitleProps) {
  const classes = ['ff-section-title', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </div>
  );
}
