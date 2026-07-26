// Minimal Phase 1 config surface. Grows as later phases add services that
// need their own env vars (DB, Redis, JWT, etc. — see .env.example).
export interface AppConfig {
  env: string;
  port: number;
}

export function loadConfig(): AppConfig {
  return {
    env: process.env.APP_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
  };
}
