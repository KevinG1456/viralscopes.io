// Query key factory (Frontend_Architecture.md section 5) -- consistent
// keys so invalidation is precise instead of guessed.
export const queryKeys = {
  watchlists: {
    all: ['watchlists'] as const,
    list: (page: number, limit: number) => ['watchlists', 'list', page, limit] as const,
  },
  alerts: {
    rules: (page: number, limit: number) => ['alerts', 'rules', page, limit] as const,
    rulesAll: ['alerts', 'rules'] as const,
    events: (page: number, limit: number) => ['alerts', 'events', page, limit] as const,
  },
  apiKeys: {
    all: ['api-keys'] as const,
    list: (page: number, limit: number) => ['api-keys', 'list', page, limit] as const,
  },
  analytics: {
    overview: ['analytics', 'overview'] as const,
  },
  recommendations: {
    list: (page: number, limit: number) => ['recommendations', 'list', page, limit] as const,
  },
  sessions: {
    all: ['sessions'] as const,
  },
  prompts: {
    all: ['prompts'] as const,
    versions: (name: string) => ['prompts', name, 'versions'] as const,
    version: (name: string, version: number) => ['prompts', name, version] as const,
    diff: (name: string, from: number, to: number) => ['prompts', name, 'diff', from, to] as const,
    fixtures: ['prompts', 'test-fixtures'] as const,
    testResult: (name: string, jobId: string) => ['prompts', name, 'test', jobId] as const,
  },
} as const;
