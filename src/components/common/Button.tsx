import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'champagne' | 'ghost' | 'danger' | 'outline-light';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}) => {
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-forest text-soft-white hover:bg-forest-hover hover:-translate-y-[1px] active:translate-y-0 border border-forest shadow-subtle',
    secondary:
      'bg-soft-white text-charcoal border border-warm-border hover:border-sage hover:bg-ivory/70',
    champagne:
      'bg-champagne text-forest-dark hover:bg-[#B89D72] border border-champagne font-medium shadow-subtle',
    ghost:
      'bg-transparent text-charcoal hover:bg-forest/5 border border-transparent',
    danger:
      'bg-error text-soft-white hover:bg-[#A3554F] border border-error shadow-subtle',
    'outline-light':
      'bg-soft-white/10 text-ivory border border-soft-white/25 hover:bg-soft-white/20 hover:border-soft-white/40',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-9 px-3.5 text-xs gap-1.5',
    md: 'h-11 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-sm gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center rounded-btn font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

