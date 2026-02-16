import type { InputHTMLAttributes } from 'react';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: 'sm' | 'md' | 'lg';
};

export function Input({ className, size = 'md', ...props }: InputProps) {
  const classes = ['m3-input', className];

  if (size === 'sm') {
    classes.push('m3-input--sm');
  }

  if (size === 'lg') {
    classes.push('m3-input--lg');
  }

  return <input className={classes.filter(Boolean).join(' ')} {...props} />;
}
