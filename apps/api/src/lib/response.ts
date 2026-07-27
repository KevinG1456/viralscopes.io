export function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}
