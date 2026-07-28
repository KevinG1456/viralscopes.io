import type { LucideIcon } from 'lucide-react';

import { cn } from '../../lib/utils/cn';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-12 text-center',
        className,
      )}
    >
      {Icon ? <Icon className="h-8 w-8 text-text-tertiary" aria-hidden="true" /> : null}
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description ? <p className="max-w-sm text-sm text-text-secondary">{description}</p> : null}
      {action}
    </div>
  );
}
