import { z } from 'zod';

// Every environment variable the API actually reads is declared here, once.
// Adding a new one that the app depends on means adding it to this schema —
// there is no other path for env vars to reach the app. DATABASE_URL (the
// migration/owner connection) is deliberately NOT here — apps/api must
// never connect with the role that bypasses RLS (see packages/db's DEC-014
// in PROJECT_STATUS.md). It connects via DATABASE_APP_URL instead.
const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3001),
  APP_VERSION: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),

  API_URL: z.string().url().default('http://localhost:3001'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_APP_URL: z
    .string()
    .min(1, 'DATABASE_APP_URL is required (see packages/db/src/setup-roles.ts)'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required for rate limiting and account lockout'),

  // Security_Architecture.md §5: "Minimum 64 characters (512 bits of entropy)".
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters'),
  JWT_REFRESH_SECRET: z.string().min(64, 'JWT_REFRESH_SECRET must be at least 64 characters'),
  JWT_ACCESS_EXPIRY: z
    .string()
    .regex(/^\d+[smhdw]$/, 'JWT_ACCESS_EXPIRY must look like "15m", "1h", "30d"')
    .default('15m'),
  // Not actually a JWT (refresh tokens are opaque random values per
  // Security_Architecture.md §4) -- named to match the var already
  // documented in .env.example/README.md §7.
  JWT_REFRESH_EXPIRY: z
    .string()
    .regex(/^\d+[smhdw]$/, 'JWT_REFRESH_EXPIRY must look like "30d"')
    .default('30d'),

  // OAuth is optional: unset in local dev by default. The API boots fine
  // without it — the OAuth routes just aren't registered (see server.ts) —
  // rather than crashing on missing credentials nothing has provisioned yet.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>['APP_ENV'];
export type LogLevel = z.infer<typeof envSchema>['LOG_LEVEL'];

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
}

export interface AppConfig {
  env: AppEnv;
  port: number;
  version: string;
  logLevel: LogLevel;
  apiUrl: string;
  appUrl: string;
  databaseAppUrl: string;
  redisUrl: string;
  jwt: {
    secret: string;
    refreshSecret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
  oauth: {
    google: OAuthProviderConfig | null;
    github: OAuthProviderConfig | null;
  };
}

export function loadConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Fail fast with the exact field and reason — not a generic crash,
    // and never a fallback that silently masks a real misconfiguration.
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  const data = parsed.data;

  const google =
    data.GOOGLE_CLIENT_ID && data.GOOGLE_CLIENT_SECRET
      ? { clientId: data.GOOGLE_CLIENT_ID, clientSecret: data.GOOGLE_CLIENT_SECRET }
      : null;
  const github =
    data.GITHUB_CLIENT_ID && data.GITHUB_CLIENT_SECRET
      ? { clientId: data.GITHUB_CLIENT_ID, clientSecret: data.GITHUB_CLIENT_SECRET }
      : null;

  return {
    env: data.APP_ENV,
    port: data.PORT,
    version: data.APP_VERSION ?? 'unknown',
    logLevel: data.LOG_LEVEL,
    apiUrl: data.API_URL,
    appUrl: data.APP_URL,
    databaseAppUrl: data.DATABASE_APP_URL,
    redisUrl: data.REDIS_URL,
    jwt: {
      secret: data.JWT_SECRET,
      refreshSecret: data.JWT_REFRESH_SECRET,
      accessExpiry: data.JWT_ACCESS_EXPIRY,
      refreshExpiry: data.JWT_REFRESH_EXPIRY,
    },
    oauth: { google, github },
  };
}
