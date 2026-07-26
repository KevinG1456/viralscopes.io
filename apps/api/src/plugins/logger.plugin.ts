import pino from 'pino';

import type { AppConfig } from '../config.js';

// Fastify's logger (Pino) is configured at construction time, not
// registered as a plugin like health.plugin.ts — there is no earlier
// point to attach one. This module is the single place that defines what
// "structured logging" means for this API, so every future service/route
// inherits the same base fields and redaction rules rather than each
// hand-rolling its own logger config.
export function buildLoggerOptions(config: AppConfig): pino.LoggerOptions {
  return {
    level: config.logLevel,
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    base: {
      service: 'api',
      version: config.version,
      environment: config.env,
    },
    // Never log these fields even if a future route accidentally passes
    // them into a log call — matches Security_Architecture.md §9 /
    // Monitoring_and_Operations.md §3's "what must never be logged" list.
    redact: {
      paths: [
        '*.password',
        '*.password_hash',
        '*.token',
        '*.apiKey',
        '*.api_key',
        '*.secret',
        '*.authorization',
        '*.email',
        '*.name',
        '*.ip_address',
        'req.headers.authorization',
        'req.headers.cookie',
      ],
      censor: '[REDACTED]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };
}
