import { NextResponse } from 'next/server';

// Liveness only — confirms the Next.js server process is up and serving
// requests. There is no readiness dependency to check yet (the frontend
// calls the API at request time; it has no server-side dependencies of
// its own at this phase).
export function GET(): NextResponse {
  return NextResponse.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    version: process.env.APP_VERSION ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}
