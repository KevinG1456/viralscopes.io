import { z } from 'zod';

import type { PaginationMeta } from './response.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Shared offset-pagination query schema for every list endpoint (URL_and_API_Structure.md
// list-endpoint convention: page/limit, 1-indexed). `.extend()` this per-route
// for endpoint-specific filters rather than redefining page/limit each time.
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// `z.coerce.boolean()` is a footgun for query-string params: it coerces via
// JS's `Boolean()` constructor, so the literal string "false" -- what every
// browser/fetch client actually sends for `?flag=false` -- becomes `true`
// (any non-empty string is truthy). This parses the two real string values
// a query param can hold.
export const booleanQueryParam = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')
  .optional();

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export function paginationOffset(query: PaginationQuery): number {
  return (query.page - 1) * query.limit;
}
