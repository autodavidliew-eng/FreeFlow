import type { ReactNode } from 'react';

type CardPanelVariant = 'default' | 'soft' | 'outline';

type CardPanelProps = {
  children: ReactNode;
  className?: string;
  variant?: CardPanelVariant;
};

export function CardPanel({
  children,
  className,
  variant = 'default',
}: CardPanelProps) {
  const classes = ['ff-card-panel'];

  if (variant === 'soft') {
    classes.push('is-soft');
  }

  if (variant === 'outline') {
    classes.push('is-outline');
  }

  if (className) {
    classes.push(className);
  }

  return <div className={classes.join(' ')}>{children}</div>;
}
