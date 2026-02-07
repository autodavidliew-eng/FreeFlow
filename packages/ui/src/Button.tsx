import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const baseStyles = {
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  };

  const variantStyles =
    variant === 'primary'
      ? { backgroundColor: '#0070f3', color: 'white' }
      : { backgroundColor: '#f0f0f0', color: '#333' };

  return (
    <button style={{ ...baseStyles, ...variantStyles }} {...props}>
      {children}
    </button>
  );
}
