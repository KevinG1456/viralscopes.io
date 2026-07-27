const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

// Parses the same "15m" / "30d" format validated by config.ts's Zod regex
// (`^\d+[smhdw]$`) into milliseconds, so callers can compute a concrete
// expiry Date without a third-party duration-parsing dependency.
export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhdw])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid duration string: "${value}"`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}

export function addDuration(from: Date, value: string): Date {
  return new Date(from.getTime() + parseDurationMs(value));
}
