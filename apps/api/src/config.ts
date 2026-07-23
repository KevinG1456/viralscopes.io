// Environment configuration for the API's infrastructure-level concerns
// (server port, DB/Redis/storage connectivity). Zod-validated request/response
// schemas and business config land in Phase 5 -- this stays deliberately plain.
export interface AppConfig {
  port: number;
  host: string;
  databaseUrl: string;
  redisUrl: string;
  s3: {
    bucket: string;
    region: string;
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle: boolean;
  };
}

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    host: process.env.HOST ?? '0.0.0.0',
    databaseUrl:
      process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:15432/postgres',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    s3: {
      bucket: process.env.S3_BUCKET ?? 'viralscopes-dev',
      region: process.env.S3_REGION ?? 'auto',
      endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
      accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    },
  };
}
