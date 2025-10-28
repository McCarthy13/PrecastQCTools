'use client';

import clsx from 'clsx';
import { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  border?: boolean;
}

export function Card({ className, padded = true, border = true, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5',
        border ? 'border border-slate-200' : 'border border-transparent',
        padded && 'p-6',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('mb-4 flex flex-col gap-1', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={clsx('text-lg font-semibold text-slate-900', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx('text-sm text-slate-500', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('flex flex-col gap-4', className)} {...props} />;
}
