'use client';

import type { ButtonHTMLAttributes } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function IconButton({
  active,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  const classes = ['ff-icon-button', active ? 'is-active' : null, className]
    .filter(Boolean)
    .join(' ');

  return <button {...props} type={type} className={classes} />;
}
