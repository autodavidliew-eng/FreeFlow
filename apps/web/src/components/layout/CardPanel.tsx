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
  const classes = ['m3-card', 'ff-card-panel'];

  if (variant === 'soft') {
    classes.push('m3-card--tonal', 'is-soft');
  }

  if (variant === 'outline') {
    classes.push('m3-card--outline', 'is-outline');
  }

  if (className) {
    classes.push(className);
  }

  return <div className={classes.join(' ')}>{children}</div>;
}
