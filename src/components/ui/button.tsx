'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-400',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-950 focus-visible:ring-slate-900 disabled:bg-slate-700',
  outline:
    'border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400 disabled:text-slate-400',
  ghost:
    'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 disabled:text-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-400',
};

const sizeStyles: Record<Size, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded-md',
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm font-medium rounded-lg',
  lg: 'px-5 py-3 text-base font-medium rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        <span className={clsx({ 'opacity-0': loading })}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
