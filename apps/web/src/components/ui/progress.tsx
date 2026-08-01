import * as React from 'react';

import { cn } from '../../lib/utils/cn';

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'aria-label'> {
  /** 0-100. Values outside that range are clamped. */
  value: number;
  variant?: 'default' | 'warning' | 'error';
  label: string;
}

const BAR_COLOR: Record<NonNullable<ProgressProps['variant']>, string> = {
  default: 'bg-primary',
  warning: 'bg-warning',
  error: 'bg-error',
};

export function Progress({
  value,
  variant = 'default',
  label,
  className,
  ...props
}: ProgressProps): React.ReactElement {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-inset', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-fast', BAR_COLOR[variant])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
