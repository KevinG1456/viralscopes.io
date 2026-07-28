'use client';

import { ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '../../../../components/common/EmptyState';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { Spinner } from '../../../../components/ui/spinner';
import { usePrompts } from '../../../../hooks/use-prompts';
import { ApiClientError } from '../../../../lib/api/client';

export default function AdminPromptsPage(): React.ReactElement {
  const { data, isLoading, isError, error } = usePrompts();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    const isForbidden = error instanceof ApiClientError && error.status === 403;
    return (
      <EmptyState
        icon={isForbidden ? ShieldAlert : Sparkles}
        title={isForbidden ? "You don't have access to this page" : "Couldn't load prompts"}
        description={
          isForbidden
            ? 'The AI Prompt Library is restricted to platform admins.'
            : error instanceof ApiClientError
              ? error.message
              : 'Please try refreshing the page.'
        }
        className="mt-6"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">AI Prompt Library</h1>
        <p className="text-sm text-text-secondary">
          Prompt storage, versioning, caching, and testing (Phase 7). No `ANTHROPIC_API_KEY`/
          `OPENAI_API_KEY` exist in this environment, so a test run will queue and eventually
          dead-letter rather than return a real AI response -- see TD-023 in PROJECT_STATUS.md.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-tertiary">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Versions</th>
                <th className="p-4 font-medium">Active version</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((prompt) => (
                <tr key={prompt.name} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <Link
                      href={`/admin/prompts/${prompt.name}`}
                      className="text-text-link hover:underline"
                    >
                      {prompt.name}
                    </Link>
                  </td>
                  <td className="p-4 text-text-secondary">{prompt.versionCount}</td>
                  <td className="p-4">
                    {prompt.activeVersion !== null ? (
                      <Badge variant="success">v{prompt.activeVersion}</Badge>
                    ) : (
                      <Badge variant="warning">none active</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
