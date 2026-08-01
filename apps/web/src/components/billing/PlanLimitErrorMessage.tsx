import Link from 'next/link';

import { ApiClientError } from '../../lib/api/client';
import { ROUTES } from '../../lib/routes';

const PLAN_LIMIT_CODES = new Set(['PLAN_LIMIT_EXCEEDED', 'ENTERPRISE_CUSTOM_ONLY']);

// Renders whatever a create/update mutation threw, plus an upgrade link
// when (and only when) the backend's own error code says the cause was a
// plan limit -- never a client-side guess at why the request failed.
export function PlanLimitErrorMessage({ error }: { error: unknown }): React.ReactElement | null {
  if (!error) return null;

  const message = error instanceof ApiClientError ? error.message : 'Something went wrong.';
  const isPlanLimit = error instanceof ApiClientError && PLAN_LIMIT_CODES.has(error.code);

  return (
    <p className="text-sm text-error">
      {message}
      {isPlanLimit ? (
        <>
          {' '}
          <Link href={ROUTES.settings.billing} className="font-medium underline">
            View plans →
          </Link>
        </>
      ) : null}
    </p>
  );
}
