export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ok<T>(data: T): { success: true; data: T };
export function ok<T>(
  data: T,
  meta: PaginationMeta,
): { success: true; data: T; meta: PaginationMeta };
export function ok<T>(
  data: T,
  meta?: PaginationMeta,
): { success: true; data: T; meta?: PaginationMeta } {
  return meta === undefined ? { success: true, data } : { success: true, data, meta };
}
