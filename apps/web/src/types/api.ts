import type { PlanLimits, PlanTier } from '@viralscopes/shared';

// Mirrors apps/api/src/lib/response.ts's envelope exactly -- every backend
// response is one of these two shapes. Response *body* shapes below are
// still defined here rather than shared with the backend (keep in sync
// manually if the envelope ever changes); `PlanLimits`/`PlanTier` are the
// one exception -- those come from `@viralscopes/shared`, the actual
// source of truth both apps/api and apps/web import (Phase 9 DEC-026).
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// --- Auth ---
export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  onboardingDone: boolean;
}

export interface LoginResult {
  accessToken: string;
  user: PublicUser;
}

export interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastUsedAt: string;
  isCurrent: boolean;
}

// --- Analytics / Usage ---
export interface AnalyticsOverview {
  watchlists: { active: number };
  alertRules: { active: number };
  // Per-status breakdown (e.g. {sent: 5, failed: 1}), not a flat count --
  // see countAlertEventsByStatusSince in the backend.
  alertEvents: { last30Days: Record<string, number> };
  apiKeys: { active: number };
  usage: UsageSummary;
}

export interface UsageSummary {
  periodStart: string;
  periodEnd: string;
  usage: Record<string, number>;
  videosAnalyzed: { used: number; limit: number | null; remaining: number | null };
}

// --- Billing (Phase 9) --- mirrors apps/api/src/services/billing.service.ts's
// CurrentPlanSummary/PlanAndLimits/CheckoutSessionResponse/PortalSessionResponse
// response shapes exactly. No provider IDs (Stripe customer/subscription/
// checkout-session IDs) ever appear here -- the backend never returns them.
export interface CurrentPlanSummary {
  plan: PlanTier;
  status: string;
  billingProvider: string;
  billingCycle: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
}

export interface PlanAndLimits {
  plan: PlanTier;
  limits: PlanLimits;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface PortalSessionResponse {
  portalUrl: string;
}

// --- Watchlists ---
export type WatchlistType = 'channel' | 'keyword' | 'niche' | 'competitor';

export interface Watchlist {
  id: string;
  orgId: string;
  workspaceId: string | null;
  createdBy: string;
  name: string;
  type: WatchlistType;
  target: string;
  targetMetadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Alerts ---
export type AlertTriggerType =
  'viral_score_threshold' | 'trend_spike' | 'channel_upload' | 'breakout_prediction';

export interface AlertRule {
  id: string;
  orgId: string;
  watchlistId: string | null;
  createdBy: string;
  name: string;
  triggerType: AlertTriggerType;
  thresholdValue: string | null;
  deliveryChannels: unknown[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AlertEventStatus = 'sent' | 'failed' | 'throttled';

export interface AlertEvent {
  id: string;
  orgId: string;
  alertRuleId: string;
  triggerType: string;
  payload: Record<string, unknown>;
  deliveryChannel: string;
  deliveryTarget: string;
  status: AlertEventStatus;
  errorMessage: string | null;
  createdAt: string;
}

// --- API Keys ---
export interface ApiKey {
  id: string;
  orgId: string;
  createdBy: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CreatedApiKey extends ApiKey {
  key: string;
}

// --- Recommendations ---
export interface Recommendation {
  id: string;
  videoId: string;
  orgId: string;
  titleConcept: string | null;
  hookConcept: string | null;
  contentOutline: unknown;
  thumbnailConcept: string | null;
  keywords: string[] | null;
  ctaSuggestion: string | null;
  toneNotes: string | null;
  promptVersion: string;
  modelUsed: string;
  createdAt: string;
  updatedAt: string;
}

// --- Prompt Library (Phase 7) ---
export interface PromptSummary {
  name: string;
  versionCount: number;
  activeVersion: number | null;
}

export interface PromptVersion {
  id: string;
  name: string;
  version: number;
  model: string;
  systemPrompt: string;
  userTemplate: string;
  outputSchema: Record<string, unknown>;
  isActive: boolean;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface PromptDiff {
  from: number;
  to: number;
  changes: Partial<
    Record<
      'model' | 'systemPrompt' | 'userTemplate' | 'outputSchema' | 'notes',
      { from: unknown; to: unknown }
    >
  >;
}

export interface PromptTestResult {
  cacheHit: boolean;
  output?: unknown;
  jobId?: string;
  status?: 'queued';
}

// Phase 10 Milestone 5 -- GET /api/v1/account/export's response shape.
export interface AccountExportData {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    createdAt: string;
  };
  organizationMemberships: Array<{
    orgId: string;
    orgName: string;
    role: string;
    joinedAt: string | null;
  }>;
  linkedOAuthAccounts: Array<{ provider: string; linkedAt: string }>;
  sessions: Array<{
    ipAddress: string | null;
    userAgent: string | null;
    lastUsedAt: string;
    createdAt: string;
  }>;
  apiKeys: Array<{
    name: string;
    keyPrefix: string;
    createdAt: string;
    lastUsedAt: string | null;
    revokedAt: string | null;
  }>;
  watchlists: Array<{ name: string; type: string; target: string; createdAt: string }>;
  alertRules: Array<{ name: string; triggerType: string; createdAt: string }>;
}

export interface JobLog {
  id: string;
  workflowName: string;
  workflowId: string;
  executionId: string;
  status: 'started' | 'retrying' | 'completed' | 'failed';
  triggerType: string;
  inputSummary: Record<string, unknown>;
  outputSummary: Record<string, unknown>;
  errorMessage: string | null;
  retryCount: number;
  durationMs: number | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}
