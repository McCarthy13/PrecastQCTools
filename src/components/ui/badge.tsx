'use client';

import clsx from 'clsx';
import { HTMLAttributes } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-slate-900/10 text-slate-900',
  success: 'bg-emerald-500/10 text-emerald-700',
  warning: 'bg-amber-500/10 text-amber-700',
  danger: 'bg-red-500/10 text-red-700',
  info: 'bg-blue-500/10 text-blue-700',
  outline: 'border border-slate-200 text-slate-600',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
