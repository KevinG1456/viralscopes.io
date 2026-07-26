import { z } from 'zod';

// Every environment variable the API actually reads is declared here, once.
// Adding a new one that the app depends on means adding it to this schema —
// there is no other path for env vars to reach the app. This is deliberately
// small right now: only APP_ENV, PORT, and APP_VERSION are consumed by any
// code today. DATABASE_URL, REDIS_URL, JWT_SECRET, and the rest documented
// in .env.example become real entries here as the phases that need them
// (3, 4, 5...) actually wire in a client that uses them — adding them
// earlier would mean validating variables nothing reads yet.
const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3001),
  APP_VERSION: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>['APP_ENV'];

export interface AppConfig {
  env: AppEnv;
  port: number;
  version: string;
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

  return {
    env: parsed.data.APP_ENV,
    port: parsed.data.PORT,
    version: parsed.data.APP_VERSION ?? 'unknown',
  };
}
