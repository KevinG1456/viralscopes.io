import { NextResponse, type NextRequest } from 'next/server';

// Lightweight route guard, NOT the security boundary (the API enforces
// that on every request -- see Frontend_Architecture.md section 8). The
// access token itself is never a cookie (see lib/api/client.ts), so
// middleware can't verify it at the edge the way Frontend_Architecture.md's
// own documented example assumes.
//
// The obvious candidate, `refresh_token`, doesn't work as a presence
// check either: the backend scopes it to path=/api/v1/auth (cookies.ts),
// so the browser never attaches it to a request for e.g. /home in the
// first place -- middleware would never see it regardless of login state.
// `csrf_token` is set/cleared in the exact same setAuthCookies()/
// clearAuthCookies() calls but scoped to path=/, so it doubles as a
// working "has an active session" heuristic. AuthProvider does the real
// client-side gating (redirecting to /login if refresh() fails) once JS
// runs -- this only avoids briefly flashing a protected page's shell to a
// browser with no session at all.
const PROTECTED_PREFIXES = ['/home', '/watchlists', '/alerts', '/settings', '/admin'];
const CSRF_COOKIE_NAME = 'csrf_token';

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const hasSessionCookie = request.cookies.has(CSRF_COOKIE_NAME);
  if (!hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
