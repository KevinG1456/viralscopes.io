'use client';

import { Bell, Gauge, KeyRound, ListChecks, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '../../../components/common/EmptyState';
import { StatCard } from '../../../components/common/StatCard';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Spinner } from '../../../components/ui/spinner';
import { useAlertEvents } from '../../../hooks/use-alerts';
import { useAnalyticsOverview } from '../../../hooks/use-analytics';
import { useRecommendations } from '../../../hooks/use-recommendations';
import { useWatchlists } from '../../../hooks/use-watchlists';
import { ROUTES } from '../../../lib/routes';
import { useAuth } from '../../../providers/AuthProvider';

export default function HomePage(): React.ReactElement {
  const { user, orgId } = useAuth();

  if (!orgId) {
    return (
      <EmptyState
        icon={Sparkles}
        title="You're not part of an organisation yet"
        description="Organisation creation isn't available in this environment yet (TD-011 in PROJECT_STATUS.md) -- an existing organisation member will need to add you."
        className="mt-12"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">
        Welcome back{user?.name ? `, ${user.name}` : ''}
      </h1>
      <OverviewSection />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentWatchlists />
        <RecentRecommendations />
      </div>
      <RecentAlerts />
    </div>
  );
}

function OverviewSection(): React.ReactElement {
  const { data, isLoading, isError } = useAnalyticsOverview();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <EmptyState
        title="Couldn't load your overview"
        description="Please try refreshing the page."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Active watchlists" value={data.watchlists.active} icon={ListChecks} />
      <StatCard label="Active alert rules" value={data.alertRules.active} icon={Bell} />
      <StatCard
        label="Alerts (30 days)"
        value={Object.values(data.alertEvents.last30Days).reduce((sum, n) => sum + n, 0)}
        icon={Bell}
      />
      <StatCard label="Active API keys" value={data.apiKeys.active} icon={KeyRound} />
      <StatCard
        label="Videos analyzed this period"
        value={
          data.usage.videosAnalyzed.limit === null
            ? data.usage.videosAnalyzed.used
            : `${data.usage.videosAnalyzed.used} / ${data.usage.videosAnalyzed.limit}`
        }
        icon={Gauge}
        hint={
          data.usage.videosAnalyzed.remaining !== null
            ? `${data.usage.videosAnalyzed.remaining} remaining`
            : undefined
        }
      />
    </div>
  );
}

function RecentWatchlists(): React.ReactElement {
  const { data, isLoading } = useWatchlists(1, 5);
  const rows = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Watchlists</CardTitle>
        <Link href={ROUTES.watchlists} className="text-xs text-text-link hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No watchlists yet"
            description="Create one to start monitoring a channel, keyword, or niche."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((w) => (
              <li key={w.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{w.name}</span>
                <Badge variant="default">{w.type}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentRecommendations(): React.ReactElement {
  const { data, isLoading } = useRecommendations(1, 5);
  const rows = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No recommendations yet"
            description="Recommendations appear once the AI analysis pipeline has processed videos in your watchlists (see TD-020 in PROJECT_STATUS.md)."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <li key={r.id} className="text-sm text-text-primary">
                {r.titleConcept ?? 'Untitled recommendation'}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentAlerts(): React.ReactElement {
  const { data, isLoading } = useAlertEvents(1, 5);
  const rows = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent alerts</CardTitle>
        <Link href={ROUTES.alerts} className="text-xs text-text-link hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alerts yet"
            description="Alerts appear here once a rule fires."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((event) => (
              <li key={event.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{event.triggerType}</span>
                <Badge
                  variant={
                    event.status === 'sent'
                      ? 'success'
                      : event.status === 'failed'
                        ? 'error'
                        : 'warning'
                  }
                >
                  {event.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
