import helmet from '@fastify/helmet';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

// Phase 10 Milestone 2, finding F-08: no security headers were set anywhere
// on the API. `apps/api` only ever returns JSON (Security_Architecture.md
// §11: "API never returns HTML; Content-Type: application/json enforced"),
// so the CSP here is deliberately the strict `default-src 'none'` an API
// should have -- there is no HTML page to author a script/style/img policy
// for. The frontend's own nonce-based CSP (apps/web/src/proxy.ts) is the
// policy that actually matters for XSS defense-in-depth; this plugin's job
// is the other Helmet headers (X-Content-Type-Options, X-Frame-Options,
// Strict-Transport-Security, Referrer-Policy) that apply regardless of
// content type.
async function securityHeadersPluginImpl(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    // The frontend is a separate origin and embeds nothing from this API in
    // a frame; nothing here is ever meant to be framed.
    frameguard: { action: 'deny' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    // Matches Security_Architecture.md §14's Helmet.js example exactly.
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: false,
  });

  // @fastify/helmet has no built-in Permissions-Policy support (the
  // successor to the old Feature-Policy header never got a first-class
  // option here); this API doesn't use any browser feature the policy
  // gates, so every directive is denied outright.
  fastify.addHook('onSend', (_request, reply, _payload, done) => {
    reply.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    );
    done();
  });
}

export const securityHeadersPlugin = fp(securityHeadersPluginImpl, {
  name: 'security-headers-plugin',
});
