# Frontend_Architecture.md
# ViralScopes.io — Frontend Architecture

> **Version:** 1.0 | **Last Updated:** 2026-07-20
> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query
> **Cross-references:** [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) · [UI_Design_System.md](./UI_Design_System.md) · [URL_and_API_Structure.md](./URL_and_API_Structure.md) · [Security_Architecture.md](./Security_Architecture.md)

---

## Table of Contents

1. [Architecture Principles](#1-architecture-principles)
2. [Application Structure](#2-application-structure)
3. [Folder Structure](#3-folder-structure)
4. [Routing](#4-routing)
5. [State Management](#5-state-management)
6. [API Integration](#6-api-integration)
7. [Performance](#7-performance)
8. [Security](#8-security)
9. [Testing Strategy](#9-testing-strategy)

---

## 1. Architecture Principles

### P1 — Server-First Rendering

Data that can be fetched on the server should be. React Server Components (RSCs) are the default. Client components are used only when interactivity, browser APIs, or real-time updates are required. This keeps the JavaScript bundle small and initial page loads fast.

### P2 — Feature-Based Organisation

Code is organised by product feature, not by technical type. `app/videos/` contains everything related to videos — page, components, hooks, types. This makes it easy to find and change code related to a specific feature without navigating across the entire project.

### P3 — Typed Everything

TypeScript strict mode is enforced. All API responses, component props, and internal data structures are typed. No `any` types in production code. Shared types live in `packages/shared` and are consumed by both the frontend and the API.

### P4 — Separation of Concerns

| Layer | Responsibility | Where |
|---|---|---|
| Page components | Data fetching (RSC) + layout assembly | `app/*/page.tsx` |
| Feature components | Feature-specific UI and logic | `app/*/components/` |
| Shared components | Reusable UI primitives | `components/` |
| Hooks | Stateful logic and data fetching (client) | `hooks/` |
| Services | API communication layer | `lib/api/` |
| Utilities | Pure functions, formatters | `lib/utils/` |
| Types | TypeScript type definitions | `types/` + `packages/shared` |

### P5 — Optimistic by Default

Mutations that update the UI should be optimistic (update the UI immediately, revert on failure). TanStack Query's `useMutation` provides this capability. Users should never wait for a server round-trip to see the result of simple actions.

### P6 — Progressive Enhancement

Core content (trending videos, viral scores, trend data) is rendered server-side and is visible without JavaScript. Interactive features (filters, search, alert creation) layer on top of the static content.

---

## 2. Application Structure

### Rendering Strategy by Route

| Route category | Strategy | Reason |
|---|---|---|
| Marketing pages (`/`, `/pricing`) | SSG (Static Site Generation) | Public, rarely changing; maximum performance |
| Auth pages (`/login`, `/register`) | SSR (Server-Side Rendering) | Need runtime environment variables; not cached |
| Dashboard pages (`/home`, `/videos`, etc.) | RSC + Client components | Server renders initial data; client handles interactivity |
| Video/Channel detail pages | ISR (Incremental Static Regeneration, 1h revalidation) | Data changes but not every second |
| Admin pages | SSR | Admin data must always be current |
| API routes | Edge or Node.js runtime | Depends on the handler's needs |

### Next.js App Router Layout Hierarchy

```
app/
├── layout.tsx                    ← Root layout: fonts, providers, metadata
├── (marketing)/                  ← Route group: no auth required
│   ├── layout.tsx                ← Marketing layout: no sidebar
│   ├── page.tsx                  ← / (home/landing)
│   ├── pricing/page.tsx
│   ├── changelog/page.tsx
│   └── privacy/page.tsx
│
├── (auth)/                       ← Route group: auth pages
│   ├── layout.tsx                ← Auth layout: centred card, no sidebar
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── verify-email/page.tsx
│   └── reset-password/
│       ├── page.tsx
│       └── confirm/page.tsx
│
├── onboarding/                   ← Auth-required, no sidebar
│   ├── layout.tsx
│   ├── create-org/page.tsx
│   ├── choose-plan/page.tsx
│   ├── first-watchlist/page.tsx
│   └── tour/page.tsx
│
├── (dashboard)/                  ← Auth-required, sidebar layout
│   ├── layout.tsx                ← AppShell: Topbar + Sidebar + Main
│   ├── home/page.tsx
│   ├── trending/page.tsx
│   ├── videos/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── channels/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── trends/page.tsx
│   ├── opportunities/page.tsx
│   ├── recommendations/page.tsx
│   ├── watchlists/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── alerts/
│   │   ├── rules/page.tsx
│   │   └── history/page.tsx
│   ├── search/page.tsx
│   ├── export/page.tsx
│   └── settings/
│       ├── layout.tsx            ← Settings sidebar layout
│       ├── profile/page.tsx
│       ├── organisation/page.tsx
│       ├── billing/page.tsx
│       ├── team/page.tsx
│       ├── api-keys/page.tsx
│       └── notifications/page.tsx
│
└── admin/                        ← Admin-required
    ├── layout.tsx
    ├── page.tsx
    ├── users/page.tsx
    ├── organisations/page.tsx
    ├── jobs/page.tsx
    ├── dead-letter/page.tsx
    ├── prompts/page.tsx
    ├── system/page.tsx
    └── quota/page.tsx
```

---

## 3. Folder Structure

```
apps/web/
├── app/                          ← Next.js App Router pages (see above)
├── components/
│   ├── ui/                       ← shadcn/ui base components (generated, do not edit manually)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                   ← Application shell components
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── MobileNav.tsx
│   │   └── SettingsSidebar.tsx
│   ├── common/                   ← Shared components used across features
│   │   ├── ViralScoreBadge.tsx
│   │   ├── HookTypeBadge.tsx
│   │   ├── TrendStatusBadge.tsx
│   │   ├── VideoCard.tsx
│   │   ├── ChannelCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── DataTable.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchInput.tsx
│   │   └── ErrorBoundary.tsx
│   └── charts/                   ← Chart components (Recharts wrappers)
│       ├── LineChart.tsx
│       ├── BarChart.tsx
│       ├── AreaChart.tsx
│       ├── SparkLine.tsx
│       ├── ViralScoreGauge.tsx
│       └── UploadHeatmap.tsx
├── hooks/                        ← Custom React hooks
│   ├── use-videos.ts             ← TanStack Query hooks for videos
│   ├── use-trends.ts
│   ├── use-watchlists.ts
│   ├── use-alerts.ts
│   ├── use-recommendations.ts
│   ├── use-analytics.ts
│   ├── use-auth.ts
│   ├── use-pagination.ts
│   ├── use-filters.ts
│   ├── use-debounce.ts
│   └── use-toast.ts
├── lib/
│   ├── api/                      ← API client layer
│   │   ├── client.ts             ← Base fetch wrapper (auth headers, error handling)
│   │   ├── videos.ts
│   │   ├── channels.ts
│   │   ├── trends.ts
│   │   ├── watchlists.ts
│   │   ├── alerts.ts
│   │   ├── recommendations.ts
│   │   ├── analytics.ts
│   │   ├── exports.ts
│   │   ├── auth.ts
│   │   └── billing.ts
│   ├── utils/                    ← Pure utility functions
│   │   ├── format.ts             ← Number, date, currency formatters
│   │   ├── viral-score.ts        ← Score → colour, label, tier
│   │   ├── cn.ts                 ← clsx + tailwind-merge helper
│   │   ├── url.ts                ← URL builder utilities
│   │   └── validation.ts         ← Client-side Zod schemas
│   └── routes.ts                 ← Typed route constants
├── providers/                    ← React context providers
│   ├── QueryProvider.tsx         ← TanStack Query provider
│   ├── ThemeProvider.tsx         ← Dark/light theme
│   ├── AuthProvider.tsx          ← Auth context (user, org, plan)
│   ├── ToastProvider.tsx         ← Toast notification context
│   └── index.tsx                 ← Composed provider tree
├── types/                        ← Frontend-specific TypeScript types
│   ├── api.ts                    ← API response types
│   ├── ui.ts                     ← Component prop types
│   └── index.ts
├── styles/
│   └── globals.css               ← Tailwind base + CSS custom properties (design tokens)
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   └── og-image.png
├── middleware.ts                 ← Next.js middleware (auth route guards)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Directory Purposes

| Directory | Purpose |
|---|---|
| `app/` | Next.js App Router pages, layouts, and route handlers. Each feature has its own subdirectory. |
| `components/ui/` | shadcn/ui generated components. Never edited directly — regenerated when updating shadcn. |
| `components/layout/` | The application shell: sidebar, topbar, mobile nav. Used once per session. |
| `components/common/` | Reusable components shared across ≥ 2 features. `ViralScoreBadge`, `DataTable`, `EmptyState`. |
| `components/charts/` | Thin wrappers around Recharts that apply ViralScopes design tokens. |
| `hooks/` | Custom React hooks. Each hook encapsulates one concern (data fetching for a resource, or a UI behaviour like debounce). |
| `lib/api/` | The API client layer. Every function makes one API call and returns typed data. No business logic. |
| `lib/utils/` | Pure, stateless utility functions. Formatters, helpers, the `cn()` function. |
| `providers/` | React Context providers. Composed at the root layout. |
| `types/` | TypeScript types that are frontend-specific. Shared types come from `packages/shared`. |
| `styles/globals.css` | Tailwind directives and CSS custom properties (design tokens). |

---

## 4. Routing

### Route Constants

All routes are defined as constants to prevent magic strings and enable refactoring:

```typescript
// lib/routes.ts
export const ROUTES = {
  home: "/home",
  trending: "/trending",
  videos: {
    list: "/videos",
    detail: (id: string) => `/videos/${id}`,
  },
  channels: {
    list: "/channels",
    detail: (id: string) => `/channels/${id}`,
  },
  trends: "/trends",
  opportunities: "/opportunities",
  recommendations: "/recommendations",
  watchlists: {
    list: "/watchlists",
    detail: (id: string) => `/watchlists/${id}`,
  },
  alerts: {
    rules: "/alerts/rules",
    history: "/alerts/history",
  },
  search: "/search",
  export: "/export",
  settings: {
    profile: "/settings/profile",
    organisation: "/settings/organisation",
    billing: "/settings/billing",
    team: "/settings/team",
    apiKeys: "/settings/api-keys",
    notifications: "/settings/notifications",
  },
  admin: {
    root: "/admin",
    users: "/admin/users",
    jobs: "/admin/jobs",
    deadLetter: "/admin/dead-letter",
    prompts: "/admin/prompts",
    quota: "/admin/quota",
  },
  auth: {
    login: "/login",
    register: "/register",
    verifyEmail: "/verify-email",
    resetPassword: "/reset-password",
  },
  onboarding: {
    createOrg: "/onboarding/create-org",
    choosePlan: "/onboarding/choose-plan",
    firstWatchlist: "/onboarding/first-watchlist",
    tour: "/onboarding/tour",
  },
} as const;
```

### Route Guards (Next.js Middleware)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwtEdge } from "@/lib/auth/jwt-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — no auth check
  const publicPaths = ["/", "/pricing", "/login", "/register",
    "/verify-email", "/reset-password", "/api/auth"];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Verify JWT from Authorization header or access_token cookie
  const token = request.cookies.get("access_token")?.value
    ?? request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyJwtEdge(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin routes require super_admin role
  if (pathname.startsWith("/admin") && payload.role !== "super_admin") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Onboarding: if onboarding not done, redirect to onboarding
  if (!pathname.startsWith("/onboarding") && !payload.onboardingDone) {
    return NextResponse.redirect(new URL("/onboarding/create-org", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Dynamic Routes

| Pattern | Example | Notes |
|---|---|---|
| `/videos/[id]` | `/videos/01HXYZ...` | Video detail with UUID |
| `/channels/[id]` | `/channels/01HABC...` | Channel profile |
| `/watchlists/[id]` | `/watchlists/01HDEF...` | Watchlist detail |

All dynamic routes include `generateMetadata()` for SEO and `notFound()` from `next/navigation` when the resource does not exist.

### Error Pages

| File | Route | Content |
|---|---|---|
| `app/not-found.tsx` | Any 404 | Friendly message + link to `/home` |
| `app/error.tsx` | Any uncaught error | Error boundary with retry button |
| `app/(dashboard)/error.tsx` | Dashboard error | Sidebar preserved; error in main area only |
| `app/global-error.tsx` | Root layout error | Full page; used when layout itself fails |

---

## 5. State Management

### Philosophy

**Server state** (data from the API) is managed exclusively by **TanStack Query**. It handles caching, background refetching, loading/error states, and optimistic updates. This covers 90% of state in a data-heavy dashboard application.

**Local UI state** (toggle open/closed, form inputs, selected rows) is managed by `useState` and `useReducer` within components. No global state library is used for UI state.

**Global application state** (authenticated user, current org, theme preference) is managed by React Context + `useState`. There are very few true global state values.

### TanStack Query Configuration

```typescript
// providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,          // 1 minute: data is fresh for 1 min
      gcTime: 5 * 60 * 1000,         // 5 minutes: unused data stays in cache
      retry: 2,                       // Retry failed requests twice
      refetchOnWindowFocus: false,    // Don't refetch when switching tabs
    },
    mutations: {
      retry: 0,                       // Don't retry mutations automatically
    },
  },
});
```

### Query Key Factory

Consistent query keys prevent cache collisions and enable precise cache invalidation:

```typescript
// lib/query-keys.ts
export const queryKeys = {
  videos: {
    all: ["videos"] as const,
    list: (filters: VideoFilters) => ["videos", "list", filters] as const,
    detail: (id: string) => ["videos", "detail", id] as const,
    recommendations: (id: string) => ["videos", id, "recommendations"] as const,
  },
  trends: {
    all: ["trends"] as const,
    list: (filters: TrendFilters) => ["trends", "list", filters] as const,
    opportunities: ["trends", "opportunities"] as const,
  },
  watchlists: {
    all: ["watchlists"] as const,
    list: () => ["watchlists", "list"] as const,
    detail: (id: string) => ["watchlists", "detail", id] as const,
  },
  alerts: {
    rules: ["alerts", "rules"] as const,
    events: (filters: AlertFilters) => ["alerts", "events", filters] as const,
  },
  analytics: {
    overview: ["analytics", "overview"] as const,
    viralScores: (period: string) => ["analytics", "viral-scores", period] as const,
  },
} as const;
```

### Cache Strategy

| Data type | `staleTime` | `gcTime` | Reasoning |
|---|---|---|---|
| Video list (trending) | 2 minutes | 10 minutes | Updates every 6 hours; 2-min stale is fine |
| Video detail | 5 minutes | 15 minutes | Analysis is immutable once complete |
| Trends | 10 minutes | 30 minutes | Computed daily; no need to refresh often |
| Watchlists | 30 seconds | 5 minutes | User modifies frequently |
| Alert rules | 30 seconds | 5 minutes | User modifies frequently |
| Analytics/KPIs | 5 minutes | 15 minutes | Summary data; frequent refresh not needed |
| Auth user | Infinity | Infinity | Stable until logout |

### Optimistic Updates

Used for: watchlist CRUD, alert rule CRUD, bulk selections, star/bookmark actions.

```typescript
// hooks/use-watchlists.ts
export function useDeleteWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (watchlistId: string) => api.watchlists.delete(watchlistId),

    onMutate: async (watchlistId) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({ queryKey: queryKeys.watchlists.list() });

      // Snapshot the previous value
      const previous = queryClient.getQueryData(queryKeys.watchlists.list());

      // Optimistically remove from the cache
      queryClient.setQueryData(queryKeys.watchlists.list(), (old: Watchlist[]) =>
        old.filter(w => w.id !== watchlistId)
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      // Revert on failure
      queryClient.setQueryData(queryKeys.watchlists.list(), context?.previous);
    },

    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlists.all });
    },
  });
}
```

### Global State (Auth Context)

```typescript
// providers/AuthProvider.tsx
interface AuthContextValue {
  user: User | null;
  org: Organisation | null;
  plan: PlanTier | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

---

## 6. API Integration

### API Client Architecture

The API client is a typed fetch wrapper that handles auth headers, error parsing, and token refresh automatically.

```typescript
// lib/api/client.ts
class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;
  private accessToken: string | null = null;

  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...options?.headers,
      },
    });

    // Handle 401: attempt token refresh
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.fetch<T>(path, options); // Retry with new token
      }
      // Refresh failed — redirect to login
      window.location.href = "/login";
      throw new ApiError("SESSION_EXPIRED", "Session expired", 401);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.error?.code ?? "UNKNOWN_ERROR",
        error.error?.message ?? "An error occurred",
        response.status,
        error.error?.details
      );
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include", // sends refresh token cookie
      });
      if (!res.ok) return false;
      const { data } = await res.json();
      this.accessToken = data.accessToken;
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
```

### Resource-Specific API Modules

Each resource has its own API module with typed functions:

```typescript
// lib/api/videos.ts
import { apiClient } from "./client";
import type { Video, VideoDetail, PaginatedResponse, VideoFilters } from "@/types/api";

export const videosApi = {
  list: (filters: VideoFilters): Promise<PaginatedResponse<Video>> =>
    apiClient.fetch(`/api/v1/videos?${buildQueryString(filters)}`),

  detail: (id: string): Promise<{ data: { video: VideoDetail } }> =>
    apiClient.fetch(`/api/v1/videos/${id}`),

  analyze: (url: string): Promise<{ data: { jobId: string } }> =>
    apiClient.fetch("/api/v1/videos/analyze", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),

  refresh: (id: string): Promise<{ data: { jobId: string } }> =>
    apiClient.fetch(`/api/v1/videos/${id}/refresh`, { method: "POST" }),

  recommendations: (id: string): Promise<{ data: { recommendation: Recommendation } }> =>
    apiClient.fetch(`/api/v1/videos/${id}/recommendations`),
};
```

### Error Handling

```typescript
// lib/api/client.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Usage in components: handle errors at the UI layer
function VideoList() {
  const { data, error, isLoading } = useVideos(filters);

  if (error instanceof ApiError) {
    if (error.code === "RATE_LIMIT_EXCEEDED") {
      return <PlanUpgradePrompt feature="video_list" />;
    }
    return <ErrorState message={error.message} />;
  }

  // ...
}
```

### Retry Strategy

```typescript
// In TanStack Query config:
{
  retry: (failureCount, error) => {
    // Don't retry on auth errors or validation errors
    if (error instanceof ApiError) {
      if ([401, 403, 422, 404].includes(error.status)) return false;
    }
    // Retry up to 2 times for network errors and 5xx
    return failureCount < 2;
  },
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
}
```

### Pagination

All paginated endpoints use cursor-based pagination. The frontend uses an infinite query pattern for "load more" behaviour:

```typescript
// hooks/use-videos.ts
export function useInfiniteVideos(filters: VideoFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.list(filters),
    queryFn: ({ pageParam }) =>
      videosApi.list({ ...filters, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data.pagination.hasMore
        ? lastPage.data.pagination.cursor
        : undefined,
  });
}
```

---

## 7. Performance

### Code Splitting

Next.js App Router automatically splits code at the route level. Additional splitting:

- **Client components** are split from the RSC bundle automatically
- **Heavy libraries** (Recharts, date pickers) are dynamically imported:

```typescript
// Lazy load chart components
const ViralScoreGauge = dynamic(() => import("@/components/charts/ViralScoreGauge"), {
  loading: () => <Skeleton className="h-48 w-48 rounded-full" />,
  ssr: false, // Recharts requires browser environment
});
```

### Image Optimisation

All images use Next.js `<Image>` component for automatic format conversion (WebP), size optimisation, and lazy loading:

```tsx
<Image
  src={video.thumbnailUrl}
  alt={video.title}
  width={320}
  height={180}
  className="rounded-sm object-cover"
  loading="lazy"
  unoptimized={false}  // Always use Next.js optimisation
/>
```

YouTube thumbnails served from `i.ytimg.com` are configured as a trusted image domain in `next.config.ts`.

### Font Loading

```typescript
// app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false, // Only loaded when monospace is used
});
```

### Bundle Optimisation

Checks run in CI:

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  bundlePagesRouterDependencies: true,
};
```

Bundle size budget enforced in CI via `@next/bundle-analyzer`. The initial JS bundle for the dashboard shell must remain under 150KB gzipped.

### Rendering Performance

- **Virtualised lists:** Tables with > 100 rows use `react-virtual` or native browser virtualization to avoid rendering off-screen DOM nodes
- **Debounced search:** Search input debounced at 300ms before triggering API calls
- **Memoisation:** `useMemo` and `useCallback` applied only where profiling identifies unnecessary re-renders. Not applied speculatively.
- **Transition API:** `useTransition` wraps filter changes on the Trending and Videos pages to prevent the UI from feeling blocked during data fetching

### Caching Strategy

| Layer | Cache mechanism | TTL |
|---|---|---|
| CDN (Cloudflare) | Static assets: 1 year; page HTML: not cached | — |
| Next.js data cache | `fetch()` cache in RSCs with `revalidate` option | Per route (see Section 2) |
| TanStack Query | In-memory client cache | Per query (see Section 5) |
| Service Worker | Not used at MVP (PWA planned for v2.0) | — |

---

## 8. Security

### XSS Prevention

React's JSX escaping prevents XSS by default. Additional protections:

- `dangerouslySetInnerHTML` is prohibited in ESLint rules (enforced by `eslint-plugin-no-danger`)
- When rendering user-supplied content as HTML (video descriptions with basic formatting), `DOMPurify` is applied first
- YouTube thumbnails displayed via `<Image>` — no `<img src>` with user-supplied URLs

### CSRF Considerations

The API uses HTTP-only cookies for the refresh token. All state-changing API calls from the browser include:
1. The `Authorization: Bearer <accessToken>` header (CSRF-safe — custom header)
2. The `X-CSRF-Token` header (double-submit cookie pattern)

The `apiClient` automatically attaches the CSRF token from the `csrf_token` cookie.

### Content Security Policy

The CSP is set by the Fastify API via the `Helmet.js` middleware. For Next.js-rendered pages, the CSP is set via `next.config.ts` headers and per-request nonces in middleware:

```typescript
// middleware.ts (nonce generation)
const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}';
  style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
  img-src 'self' data: https://cdn.viralscopes.io https://i.ytimg.com;
  connect-src 'self' https://api.viralscopes.io;
  frame-ancestors 'none';
`;
```

### Secure Token Handling

- **Access token:** Stored in JavaScript memory (React state/context). Never in `localStorage` or `sessionStorage`. Lost on page refresh → silent refresh via `/api/v1/auth/refresh` on app mount.
- **Refresh token:** HTTP-only Secure SameSite=Strict cookie. Never accessible to JavaScript.
- **CSRF token:** Regular cookie (JavaScript-readable) for double-submit pattern.

```typescript
// providers/AuthProvider.tsx
// On mount: attempt silent refresh to get a new access token
useEffect(() => {
  const silentRefresh = async () => {
    try {
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const { data } = await res.json();
        setAccessToken(data.accessToken);
      }
    } catch {
      // Refresh failed — user must log in
    } finally {
      setIsLoading(false);
    }
  };
  silentRefresh();
}, []);
```

### Input Validation

Client-side validation uses Zod schemas (mirroring the server-side schemas from `packages/shared`). Validation runs on form submit and optionally on blur for password and URL fields.

```typescript
// lib/utils/validation.ts
import { z } from "zod";

export const analyzeVideoSchema = z.object({
  url: z.string()
    .url("Must be a valid URL")
    .refine(u => u.includes("youtube.com/watch") || u.includes("youtu.be"),
      "Must be a YouTube video URL"),
});

export const createWatchlistSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
  type: z.enum(["channel", "keyword", "niche", "competitor"]),
  target: z.string().min(1, "Target is required").max(500),
});
```

### Client-Side Authorisation Boundaries

The UI conditionally renders features based on the user's plan and role. This is **not** a security control — it is a UX control. The API enforces authorisation; the UI provides the appropriate experience:

```typescript
// components/common/PlanGate.tsx
interface PlanGateProps {
  requiredPlan: PlanTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ requiredPlan, children, fallback }: PlanGateProps) {
  const { plan } = useAuth();
  const hasAccess = PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[requiredPlan];
  return hasAccess ? <>{children}</> : <>{fallback ?? <UpgradePrompt plan={requiredPlan} />}</>;
}
```

---

## 9. Testing Strategy

### Unit Tests (Vitest)

**Target:** > 80% coverage on utility functions, formatters, and pure logic.

```typescript
// lib/utils/viral-score.test.ts
import { describe, it, expect } from "vitest";
import { getViralScoreColour, getViralScoreTier } from "./viral-score";

describe("getViralScoreColour", () => {
  it("returns red for low scores (0–30)", () => {
    expect(getViralScoreColour(15)).toBe("text-error");
    expect(getViralScoreColour(0)).toBe("text-error");
    expect(getViralScoreColour(30)).toBe("text-error");
  });

  it("returns green for exceptional scores (85–100)", () => {
    expect(getViralScoreColour(90)).toBe("text-success");
    expect(getViralScoreColour(100)).toBe("text-success");
  });
});
```

### Component Tests (Vitest + Testing Library)

**Target:** All shared components in `components/common/` and `components/ui/` have tests covering each variant and state.

```typescript
// components/common/ViralScoreBadge.test.tsx
import { render, screen } from "@testing-library/react";
import { ViralScoreBadge } from "./ViralScoreBadge";

describe("ViralScoreBadge", () => {
  it("renders the score value", () => {
    render(<ViralScoreBadge score={87.4} />);
    expect(screen.getByText("87.4")).toBeInTheDocument();
  });

  it("applies the correct colour class for high scores", () => {
    const { container } = render(<ViralScoreBadge score={87.4} />);
    expect(container.firstChild).toHaveClass("text-success");
  });

  it("renders accessible label", () => {
    render(<ViralScoreBadge score={87.4} />);
    expect(screen.getByRole("status")).toHaveAccessibleName(/viral score: 87/i);
  });
});
```

### Integration Tests (Vitest + MSW)

**Target:** All TanStack Query hooks tested with Mock Service Worker intercepting API calls.

```typescript
// hooks/use-videos.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { useVideos } from "./use-videos";
import { createWrapper } from "@/test/utils";

describe("useVideos", () => {
  it("fetches and returns video list", async () => {
    server.use(
      http.get("/api/v1/videos", () =>
        HttpResponse.json({ success: true, data: { videos: mockVideos, pagination: {...} } })
      )
    );

    const { result } = renderHook(() => useVideos({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.videos).toHaveLength(mockVideos.length);
  });
});
```

### End-to-End Tests (Playwright)

**Target:** All critical user journeys covered.

Critical journeys:
1. Registration → email verification → onboarding → first watchlist
2. Log in → view trending videos → click video detail → view analysis
3. Create alert rule → trigger condition → verify delivery (mocked)
4. Upgrade from Free → Starter (Stripe test mode)
5. Export video list → download CSV

```typescript
// e2e/onboarding.spec.ts
test("new user completes onboarding", async ({ page }) => {
  await page.goto("/register");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "SecurePass123!");
  await page.click('[data-testid="register-button"]');

  // Verify email step
  await expect(page).toHaveURL("/verify-email");

  // Simulate email verification (test environment skips email)
  await page.goto("/onboarding/create-org");
  await page.fill('[name="orgName"]', "Test Agency");
  await page.click('[data-testid="create-org-button"]');

  // ... continue through onboarding
  await expect(page).toHaveURL("/home");
  await expect(page.locator("h1")).toContainText("Welcome");
});
```

### Visual Regression Tests (Playwright + Screenshots)

Snapshot tests for critical UI components in both dark and light themes. Run in CI on every PR. Any visual change requires explicit approval before merging.

**Components with visual snapshots:**
- `ViralScoreBadge` (all score ranges)
- `TrendStatusBadge` (Emerging, Evergreen, Declining)
- `EmptyState` (all variants)
- `DataTable` (loading, empty, populated states)
- `ViralScoreGauge` (multiple score values)

---

*This document is updated when the frontend architecture changes. All significant architecture decisions require a PR with an ADR (Architecture Decision Record) linked in the PR description.*

---

**Related Documents:**
- [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) — Full monorepo structure including the web app
- [UI_Design_System.md](./UI_Design_System.md) — Component library and design token usage
- [URL_and_API_Structure.md](./URL_and_API_Structure.md) — API endpoints consumed by the frontend
- [Security_Architecture.md](./Security_Architecture.md) — Authentication, CSRF, XSS, and CSP full detail
- [Deployment_Guide.md](./Deployment_Guide.md) — How the frontend is built and deployed
