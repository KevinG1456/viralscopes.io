import { apiRequest } from './client';
import type {
  JobLog,
  PromptDiff,
  PromptSummary,
  PromptTestResult,
  PromptVersion,
} from '../../types/api';

export async function listPrompts(): Promise<PromptSummary[]> {
  const { data } = await apiRequest<PromptSummary[]>('/api/v1/admin/prompts');
  return data;
}

export async function listVersions(name: string): Promise<PromptVersion[]> {
  const { data } = await apiRequest<PromptVersion[]>(`/api/v1/admin/prompts/${name}`);
  return data;
}

export async function getVersion(name: string, version: number): Promise<PromptVersion> {
  const { data } = await apiRequest<PromptVersion>(`/api/v1/admin/prompts/${name}/${version}`);
  return data;
}

export async function diffVersions(name: string, from: number, to: number): Promise<PromptDiff> {
  const { data } = await apiRequest<PromptDiff>(`/api/v1/admin/prompts/${name}/diff`, {
    query: { from, to },
  });
  return data;
}

export async function activateVersion(name: string, version: number): Promise<PromptVersion> {
  const { data } = await apiRequest<PromptVersion>(`/api/v1/admin/prompts/${name}/activate`, {
    method: 'POST',
    body: { version },
  });
  return data;
}

export async function listTestFixtures(): Promise<string[]> {
  const { data } = await apiRequest<string[]>('/api/v1/admin/prompts/test-fixtures');
  return data;
}

export async function runTest(
  name: string,
  version: number,
  fixtureId: string,
): Promise<PromptTestResult> {
  const { data } = await apiRequest<PromptTestResult>(`/api/v1/admin/prompts/${name}/test`, {
    method: 'POST',
    body: { version, fixtureId },
  });
  return data;
}

export async function getTestResult(name: string, jobId: string): Promise<JobLog> {
  const { data } = await apiRequest<JobLog>(`/api/v1/admin/prompts/${name}/test/${jobId}`);
  return data;
}
