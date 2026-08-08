import fastifyOauth2 from '@fastify/oauth2';
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';

import type { AppConfig } from '../config.js';
import { setAuthCookies } from '../lib/cookies.js';
import { AppError } from '../lib/errors.js';
import { fetchGitHubProfile, fetchGoogleProfile } from '../lib/oauth-profile.js';
import type { AuthService, RequestMeta } from '../services/auth.service.js';
import { findOrCreateUserFromOAuth } from '../services/oauth.service.js';

// findOrCreateUserFromOAuth throws AppError('OAUTH_ACCOUNT_REQUIRES_VERIFICATION', ...)
// when it refuses to auto-link (see oauth.service.ts's account-linking policy,
// DEC-016). Mid-OAuth-redirect is not the place for a bare JSON error response
// -- the browser is expecting a redirect back to the app -- so this is
// translated into a redirect carrying an error code the frontend can render.
function isOAuthLinkingRefusal(err: unknown): err is AppError {
  return err instanceof AppError && err.code === 'OAUTH_ACCOUNT_REQUIRES_VERIFICATION';
}

interface OAuthRoutesOptions extends FastifyPluginOptions {
  config: AppConfig;
  authService: AuthService;
}

// @fastify/oauth2 ships GOOGLE_CONFIGURATION/GITHUB_CONFIGURATION presets at
// runtime, but its .d.ts doesn't expose them on the default import's type
// under NodeNext module resolution. These are the same well-known,
// effectively-static endpoints the library's own presets use, declared
// locally to keep this file type-safe.
const GOOGLE_PROVIDER = {
  authorizeHost: 'https://accounts.google.com',
  authorizePath: '/o/oauth2/v2/auth',
  tokenHost: 'https://www.googleapis.com',
  tokenPath: '/oauth2/v4/token',
};

const GITHUB_PROVIDER = {
  tokenHost: 'https://github.com',
  tokenPath: '/login/oauth/access_token',
  authorizePath: '/login/oauth/authorize',
};

function requestMeta(request: FastifyRequest): RequestMeta {
  return { ipAddress: request.ip, userAgent: request.headers['user-agent'] ?? null };
}

// Security_Architecture.md §5 "Google OAuth Flow": redirect to provider ->
// provider redirects back to our callback with an authorization code ->
// exchange the code server-side -> fetch the provider's profile -> resolve
// to a local user -> issue a session exactly like password login. Each
// provider is only registered when its credentials are configured (see
// config.ts's oauth.google/oauth.github) so the API boots cleanly in
// environments -- like local dev -- with no OAuth app provisioned yet.
export async function registerOAuthRoutes(
  fastify: FastifyInstance,
  opts: OAuthRoutesOptions,
): Promise<void> {
  const { config, authService } = opts;

  if (config.oauth.google) {
    const google = config.oauth.google;
    await fastify.register(fastifyOauth2, {
      name: 'google',
      scope: ['openid', 'profile', 'email'],
      credentials: {
        client: { id: google.clientId, secret: google.clientSecret },
        auth: GOOGLE_PROVIDER,
      },
      startRedirectPath: '/oauth/google',
      callbackUri: `${config.apiUrl}/api/v1/auth/oauth/google/callback`,
      pkce: 'S256',
    });

    fastify.get(
      '/oauth/google/callback',
      { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
      async (request, reply) => {
        const { token } = await fastify.oauth2Google!.getAccessTokenFromAuthorizationCodeFlow(
          request,
          reply,
        );
        const profile = await fetchGoogleProfile(token.access_token);
        let resolved;
        try {
          resolved = await findOrCreateUserFromOAuth(
            fastify.db,
            'google',
            profile,
            config.encryptionKey,
          );
        } catch (err) {
          if (isOAuthLinkingRefusal(err)) {
            return reply.redirect(`${config.appUrl}/login?error=account_requires_verification`);
          }
          throw err;
        }
        const { refreshToken } = await authService.issueSession(
          resolved.user,
          requestMeta(request),
        );
        setAuthCookies(reply, config, refreshToken);
        return reply.redirect(`${config.appUrl}/${resolved.isNewUser ? 'onboarding' : 'home'}`);
      },
    );
  }

  if (config.oauth.github) {
    const github = config.oauth.github;
    await fastify.register(fastifyOauth2, {
      name: 'github',
      scope: ['read:user', 'user:email'],
      credentials: {
        client: { id: github.clientId, secret: github.clientSecret },
        auth: GITHUB_PROVIDER,
      },
      startRedirectPath: '/oauth/github',
      callbackUri: `${config.apiUrl}/api/v1/auth/oauth/github/callback`,
    });

    fastify.get(
      '/oauth/github/callback',
      { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
      async (request, reply) => {
        const { token } = await fastify.oauth2Github!.getAccessTokenFromAuthorizationCodeFlow(
          request,
          reply,
        );
        const profile = await fetchGitHubProfile(token.access_token);
        let resolved;
        try {
          resolved = await findOrCreateUserFromOAuth(
            fastify.db,
            'github',
            profile,
            config.encryptionKey,
          );
        } catch (err) {
          if (isOAuthLinkingRefusal(err)) {
            return reply.redirect(`${config.appUrl}/login?error=account_requires_verification`);
          }
          throw err;
        }
        const { refreshToken } = await authService.issueSession(
          resolved.user,
          requestMeta(request),
        );
        setAuthCookies(reply, config, refreshToken);
        return reply.redirect(`${config.appUrl}/${resolved.isNewUser ? 'onboarding' : 'home'}`);
      },
    );
  }
}
