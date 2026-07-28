'use client';

import { EmptyState } from '../../../../components/common/EmptyState';
import { Badge } from '../../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { useAuth } from '../../../../providers/AuthProvider';

// Deliberately read-only: there is no organisation read/update endpoint
// for non-admin users yet -- Organisation & Workspace Management (TD-011)
// was deferred back in Phase 4 and still hasn't been built. Everything
// shown here comes from the JWT itself, not a dedicated endpoint.
export default function OrganisationPage(): React.ReactElement {
  const { orgId, orgRole, planTier } = useAuth();

  if (!orgId) {
    return (
      <EmptyState
        title="You're not part of an organisation yet"
        description="Organisation creation isn't available in this environment yet (TD-011 in PROJECT_STATUS.md)."
        className="mt-6"
      />
    );
  }

  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Organisation</CardTitle>
        <CardDescription>
          Full organisation management (name, members, invites) isn&apos;t built yet -- see TD-011
          in PROJECT_STATUS.md. This is everything currently available about your organisation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Your role</span>
          <Badge variant="primary">{orgRole ?? 'unknown'}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Plan</span>
          <Badge>{planTier ?? 'unknown'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
