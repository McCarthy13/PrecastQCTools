'use client';

import clsx from 'clsx';
import { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, options, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-100',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-300',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(hint || error) && (
          <p className={clsx('text-xs', error ? 'text-red-600' : 'text-slate-500')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
