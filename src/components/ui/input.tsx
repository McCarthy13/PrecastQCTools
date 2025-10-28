'use client';

import clsx from 'clsx';
import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-100',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-300',
            className
          )}
          {...props}
        />
        {(hint || error) && (
          <p className={clsx('text-xs', error ? 'text-red-600' : 'text-slate-500')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
