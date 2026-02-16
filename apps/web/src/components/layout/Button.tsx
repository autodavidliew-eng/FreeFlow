'use client';

import type { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'filled' | 'tonal' | 'outline' | 'text';
};

export function Button({
  className,
  variant = 'filled',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = ['m3-button', className];

  if (variant === 'tonal') {
    classes.push('m3-button--tonal');
  }

  if (variant === 'outline') {
    classes.push('m3-button--outline');
  }

  if (variant === 'text') {
    classes.push('m3-button--text');
  }

  return (
    <button
      {...props}
      type={type}
      className={classes.filter(Boolean).join(' ')}
    />
  );
}
