import { NextResponse, type NextRequest } from 'next/server';

// Phase 10 Milestone 2, finding F-08: no CSP existed anywhere. Nonce is
// generated per-request here (Security_Architecture.md §11's own documented
// design) and threaded through via the `x-nonce` request header so a
// Server Component can read it with `headers()` if it ever needs to render
// an inline <script>/<style> tag -- none do today (Milestone 1 confirmed
// zero dangerouslySetInnerHTML/eval anywhere in this app), so this is
// purely a defense-in-depth layer against a future regression, not a fix
// for an existing gap.
function buildCsp(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ''}`.trim(),
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

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
// No page in this app uses the camera, microphone, geolocation, payment
// widgets, or USB -- deny every gated browser feature outright.
const PERMISSIONS_POLICY = 'camera=(), microphone=(), geolocation=(), payment=(), usb=()';

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const nonce = crypto.randomUUID();
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const hasSessionCookie = request.cookies.has(CSRF_COOKIE_NAME);
    if (!hasSessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set('Content-Security-Policy', csp);
      redirectResponse.headers.set('Permissions-Policy', PERMISSIONS_POLICY);
      return redirectResponse;
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
