import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '../../components/ui/card';

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: string;
}): React.ReactElement {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-text-secondary">{label}</span>
          <span className="text-2xl font-semibold text-text-primary">{value}</span>
          {hint ? <span className="text-xs text-text-tertiary">{hint}</span> : null}
        </div>
        {Icon ? <Icon className="h-5 w-5 text-text-tertiary" aria-hidden="true" /> : null}
      </CardContent>
    </Card>
  );
}
