'use client';

import { Check, Play } from 'lucide-react';
import { useParams } from 'next/navigation';
import * as React from 'react';

import { EmptyState } from '../../../../../components/common/EmptyState';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { Spinner } from '../../../../../components/ui/spinner';
import {
  useActivateVersion,
  usePromptDiff,
  usePromptTestResult,
  usePromptVersions,
  useRunPromptTest,
  useTestFixtures,
} from '../../../../../hooks/use-prompts';
import { ApiClientError } from '../../../../../lib/api/client';
import { useToast } from '../../../../../providers/ToastProvider';

export default function PromptDetailPage(): React.ReactElement {
  const { name } = useParams<{ name: string }>();
  const { data: versions, isLoading, isError, error } = usePromptVersions(name);
  const activate = useActivateVersion();
  const { showToast } = useToast();

  async function handleActivate(version: number): Promise<void> {
    try {
      await activate.mutateAsync({ name, version });
      showToast({ title: `Activated version ${version}.`, variant: 'success' });
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to activate version.',
        variant: 'error',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (isError || !versions) {
    return (
      <EmptyState
        title="Couldn't load this prompt"
        description={
          error instanceof ApiClientError ? error.message : 'Please try refreshing the page.'
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">{name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Versions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-tertiary">
                <th className="p-4 font-medium">Version</th>
                <th className="p-4 font-medium">Model</th>
                <th className="p-4 font-medium">Notes</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.version} className="border-b border-border last:border-0">
                  <td className="p-4 text-text-primary">v{v.version}</td>
                  <td className="p-4 text-text-secondary">{v.model}</td>
                  <td
                    className="max-w-xs truncate p-4 text-text-tertiary"
                    title={v.notes ?? undefined}
                  >
                    {v.notes ?? '—'}
                  </td>
                  <td className="p-4">
                    {v.isActive ? <Badge variant="success">Active</Badge> : <Badge>Inactive</Badge>}
                  </td>
                  <td className="p-4 text-right">
                    {!v.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={activate.isPending}
                        onClick={() => void handleActivate(v.version)}
                      >
                        Activate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {versions.length > 1 ? (
        <DiffSection name={name} versions={versions.map((v) => v.version)} />
      ) : null}

      <TestHarnessSection name={name} versions={versions.map((v) => v.version)} />
    </div>
  );
}

function DiffSection({ name, versions }: { name: string; versions: number[] }): React.ReactElement {
  const [from, setFrom] = React.useState<number | null>(null);
  const [to, setTo] = React.useState<number | null>(null);
  const { data: diff, isFetching } = usePromptDiff(name, from, to);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare versions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-4">
          <VersionSelect label="From" versions={versions} value={from} onChange={setFrom} />
          <VersionSelect label="To" versions={versions} value={to} onChange={setTo} />
        </div>
        {isFetching ? (
          <Spinner />
        ) : diff ? (
          Object.keys(diff.changes).length === 0 ? (
            <p className="text-sm text-text-secondary">No differences.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(diff.changes).map(([field, change]) => (
                <div key={field} className="rounded-md border border-border p-3 text-xs">
                  <p className="mb-2 font-medium text-text-primary">{field}</p>
                  <p className="text-error">- {JSON.stringify(change?.from)}</p>
                  <p className="text-success">+ {JSON.stringify(change?.to)}</p>
                </div>
              ))}
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}

function VersionSelect({
  label,
  versions,
  value,
  onChange,
}: {
  label: string;
  versions: number[];
  value: number | null;
  onChange: (v: number) => void;
}): React.ReactElement {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <span className="text-xs text-text-tertiary">{label}</span>
      <Select value={value?.toString() ?? ''} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger>
          <SelectValue placeholder="Select a version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v} value={v.toString()}>
              v{v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TestHarnessSection({
  name,
  versions,
}: {
  name: string;
  versions: number[];
}): React.ReactElement {
  const { data: fixtures, isLoading: fixturesLoading } = useTestFixtures();
  const runTest = useRunPromptTest();
  const { showToast } = useToast();
  const [version, setVersion] = React.useState<number | null>(versions[0] ?? null);
  const [fixtureId, setFixtureId] = React.useState<string | null>(null);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [cachedOutput, setCachedOutput] = React.useState<unknown>(undefined);

  const { data: jobLog } = usePromptTestResult(name, jobId);

  async function handleRun(): Promise<void> {
    if (version === null || fixtureId === null) return;
    setJobId(null);
    setCachedOutput(undefined);
    try {
      const result = await runTest.mutateAsync({ name, version, fixtureId });
      if (result.cacheHit) {
        setCachedOutput(result.output);
      } else if (result.jobId) {
        setJobId(result.jobId);
      }
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to run test.',
        variant: 'error',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test harness</CardTitle>
        <CardDescription>
          Run this prompt against one of the 10 committed fixture videos. Without AI provider
          credentials in this environment, a fresh run will queue and eventually dead-letter
          (TD-023) rather than return real output -- a cached result from a previous run returns
          immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <VersionSelect
            label="Version"
            versions={versions}
            value={version}
            onChange={setVersion}
          />
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-xs text-text-tertiary">Fixture</span>
            <Select value={fixtureId ?? ''} onValueChange={setFixtureId} disabled={fixturesLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a fixture" />
              </SelectTrigger>
              <SelectContent>
                {fixtures?.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => void handleRun()}
              loading={runTest.isPending}
              disabled={version === null || fixtureId === null}
            >
              <Play className="h-4 w-4" /> Run test
            </Button>
          </div>
        </div>

        {cachedOutput !== undefined ? (
          <div className="rounded-md border border-success-border bg-success-subtle p-3 text-xs">
            <p className="mb-2 flex items-center gap-1 font-medium text-success">
              <Check className="h-3 w-3" /> Cache hit -- returned immediately
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(cachedOutput, null, 2)}
            </pre>
          </div>
        ) : null}

        {jobId ? <TestJobStatus jobLog={jobLog} jobId={jobId} /> : null}
      </CardContent>
    </Card>
  );
}

function TestJobStatus({
  jobLog,
  jobId,
}: {
  jobLog: ReturnType<typeof usePromptTestResult>['data'];
  jobId: string;
}): React.ReactElement {
  if (!jobLog) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Spinner /> Job {jobId} queued...
      </div>
    );
  }

  const variant =
    jobLog.status === 'completed' ? 'success' : jobLog.status === 'failed' ? 'error' : 'warning';

  return (
    <div className="rounded-md border border-border p-3 text-xs">
      <div className="mb-2 flex items-center gap-2">
        <Badge variant={variant}>{jobLog.status}</Badge>
        <span className="text-text-tertiary">job {jobId}</span>
      </div>
      {jobLog.errorMessage ? (
        <p className="text-error">
          {jobLog.errorMessage} -- expected without AI provider credentials (TD-023), not a bug.
        </p>
      ) : jobLog.status === 'completed' ? (
        <pre className="overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(jobLog.outputSummary, null, 2)}
        </pre>
      ) : (
        <p className="text-text-secondary">Still retrying in the background...</p>
      )}
    </div>
  );
}
