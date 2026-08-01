import { Lock } from 'lucide-react';
import Link from 'next/link';

import { ROUTES } from '../../lib/routes';
import { EmptyState } from '../common/EmptyState';

// Phase 9 Milestone 5 ("Feature Gates" / "show upgrade prompts where
// appropriate"). Purely presentational -- callers decide WHETHER to show
// this from real backend-provided data (a `limits` flag from GET
// /billing/plan, or an ApiClientError's `PLAN_LIMIT_EXCEEDED` code), never
// from a hard-coded plan assumption here.
export function UpgradeRequiredNotice({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}): React.ReactElement {
  return (
    <EmptyState
      icon={Lock}
      title={title}
      description={description}
      className={className}
      action={
        <Link
          href={ROUTES.settings.billing}
          className="text-sm font-medium text-text-link hover:underline"
        >
          View plans →
        </Link>
      }
    />
  );
}
