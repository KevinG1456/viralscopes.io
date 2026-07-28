import type { ApiFailure, ApiResponse, PaginationMeta } from '../../types/api';

// Base URL for the Fastify API (a separate origin/port -- see the new
// apps/api CORS plugin). NEXT_PUBLIC_ prefix per Next.js convention:
// baked in at build time, safe to expose (it's just a URL).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// The access token is held in memory only, never in localStorage/
// sessionStorage (XSS risk -- Frontend_Architecture.md section 8/
// Security_Architecture.md section 4). It does not survive a full page
// reload; AuthProvider re-hydrates it via POST /auth/refresh (the
// httpOnly, SameSite=Strict refresh-token cookie) on mount.
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// Double-submit CSRF cookie (middleware/csrf.ts on the backend) -- only
// logout and session-revocation require this; every other mutation is
// Bearer-token-only and inherently CSRF-safe (see PROJECT_STATUS.md's
// Phase 8 plan for why).
function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface ApiResult<T> {
  data: T;
  meta?: PaginationMeta;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  csrf?: boolean;
  // Set by the one internal retry-after-refresh call to avoid infinite
  // recursion if the refreshed token is somehow still rejected.
  _isRetry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Calls POST /auth/refresh directly (bypassing apiRequest to avoid
 * recursion), using the httpOnly refresh-token cookie. Updates the
 * in-memory access token on success. Used both by AuthProvider on mount
 * and by apiRequest itself on a 401.
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(buildUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      setAccessToken(null);
      return false;
    }
    const body = (await res.json()) as ApiResponse<{ accessToken: string }>;
    if (!body.success) {
      setAccessToken(null);
      return false;
    }
    setAccessToken(body.data.accessToken);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (options.csrf) {
    const csrfToken = readCsrfCookie();
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  }

  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // A single silent refresh-and-retry on 401 -- covers the common case of
  // an access token that expired (15min lifetime) while the tab was idle.
  if (res.status === 401 && !options._isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _isRetry: true });
    }
  }

  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      'NETWORK_ERROR',
      'The server returned an unreadable response.',
      res.status,
    );
  }

  if (!body.success) {
    const failure = body as ApiFailure;
    throw new ApiClientError(
      failure.error.code,
      failure.error.message,
      res.status,
      failure.error.details,
    );
  }

  return { data: body.data, meta: body.meta };
}
