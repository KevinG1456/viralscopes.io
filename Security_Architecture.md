# Security_Architecture.md
# ViralScopes.io — Security Architecture

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Cross-references:** [PROJECT_RULES.md](./PROJECT_RULES.md) · [Database_Schema.md](./Database_Schema.md) · [URL_&_API_Structure.md](./URL_and_API_Structure.md) · [Deployment_Guide.md](./Deployment_Guide.md)

---

## Table of Contents

1. [Security Philosophy](#1-security-philosophy)
2. [Authentication](#2-authentication)
3. [Authorisation & RBAC](#3-authorisation--rbac)
4. [Session Management](#4-session-management)
5. [JWT & OAuth Strategy](#5-jwt--oauth-strategy)
6. [Multi-Factor Authentication](#6-multi-factor-authentication)
7. [Encryption at Rest](#7-encryption-at-rest)
8. [Encryption in Transit](#8-encryption-in-transit)
9. [Secret Management](#9-secret-management)
10. [Input Validation](#10-input-validation)
11. [XSS Protection](#11-xss-protection)
12. [CSRF Protection](#12-csrf-protection)
13. [SQL Injection Prevention](#13-sql-injection-prevention)
14. [API Security](#14-api-security)
15. [Rate Limiting & Brute Force Prevention](#15-rate-limiting--brute-force-prevention)
16. [DDoS Mitigation](#16-ddos-mitigation)
17. [Secure File Handling](#17-secure-file-handling)
18. [Audit Logging](#18-audit-logging)
19. [Compliance](#19-compliance)
20. [Vulnerability Management](#20-vulnerability-management)
21. [Incident Response Plan](#21-incident-response-plan)
22. [Security Testing Strategy](#22-security-testing-strategy)
23. [Security Checklist](#23-security-checklist)

---

## 1. Security Philosophy

### Core Principles

| # | Principle | Implementation |
|---|---|---|
| S1 | **Defence in depth** | Multiple independent security controls at every layer — perimeter, network, application, database, and data |
| S2 | **Least privilege** | Every component, user, and service role has only the minimum permissions required for its function |
| S3 | **Secure by default** | New features are secure unless explicitly relaxed; not the other way around |
| S4 | **Fail securely** | When a security control fails, the system denies access rather than granting it |
| S5 | **Zero trust** | No implicit trust between services, users, or network segments — all access is authenticated and authorised |
| S6 | **Transparency over obscurity** | Security controls are documented and auditable; we do not rely on secret implementation details |
| S7 | **Separation of duties** | No single actor (human or service) can perform a sensitive operation without a second control |
| S8 | **Audit everything** | All significant security events generate an immutable, tamper-evident audit log entry |

### Security Layers

```
┌─────────────────────────────────────────────┐
│          Layer 1: Perimeter                 │
│   Cloudflare WAF, DDoS, IP reputation       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Layer 2: Transport                 │
│   TLS 1.2+, HSTS, certificate pinning       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Layer 3: Application               │
│   JWT auth, RBAC, rate limiting,            │
│   input validation, CSRF, XSS prevention    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Layer 4: Data                      │
│   RLS policies, parameterised queries,      │
│   encryption at rest, API key hashing       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Layer 5: Operations                │
│   Audit logs, secret rotation,              │
│   dependency scanning, incident response    │
└─────────────────────────────────────────────┘
```

---

## 2. Authentication

### Supported Authentication Methods

| Method | Use case | Status |
|---|---|---|
| Email + password | Primary user auth | MVP |
| Google OAuth 2.0 | Social login | MVP |
| GitHub OAuth 2.0 | Developer-friendly social login | MVP |
| API Key (Bearer token) | Programmatic / machine access | MVP |
| SAML 2.0 / OIDC (SSO) | Enterprise identity providers | v3.0 |
| TOTP / FIDO2 (MFA) | Second factor for high-privilege accounts | v2.0 |

### Password Requirements

```
Minimum length:           10 characters
Maximum length:           128 characters (prevent DoS via bcrypt)
Required character types: No mandatory composition rules (NIST SP 800-63B guidance)
Prohibited passwords:     Top 10,000 common passwords blocked (HaveIBeenPwned list)
Hashing algorithm:        bcrypt with cost factor 12
Salt:                     bcrypt generates a unique salt per password automatically
```

**Implementation:**

```typescript
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  // Max 72 chars enforced before hashing (bcrypt truncates at 72 bytes)
  if (plaintext.length > 128) throw new AppError("PASSWORD_TOO_LONG", "...", 422);
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
```

### Email Verification

- Required before any dashboard access
- Verification link contains a `sha256`-hashed random token (32 bytes)
- Token expires after 24 hours
- Token is single-use — invalidated immediately on successful verification
- Resend limit: 3 requests per 15 minutes per email address

### Account Lockout

- Threshold: 5 consecutive failed login attempts
- Lockout duration: Progressive — 15 minutes after 5th failure, 1 hour after 10th, 24 hours after 15th
- Reset: Unlock via email link (sent automatically on lockout) or manual Super Admin unlock
- Failed attempts counter resets on successful login

### Generic Login Failure Response (DEC-015)

`POST /api/v1/auth/login` returns the **same** `401 INVALID_CREDENTIALS` response — same status code, same error code, same message — for all three of:

- No account exists for the submitted email
- The account exists but the password is wrong
- The account exists, the password is *correct*, but the email is not yet verified

The third case is intentionally not distinguished from the second: revealing it via a different status code (the original implementation used `403 EMAIL_NOT_VERIFIED`) lets an attacker confirm a guessed or credential-stuffed password is correct without ever completing login, and without necessarily tripping lockout. All three branches now also count identically toward the account-lockout counter above. The true reason for rejection remains fully visible server-side via a structured log line (`userId`, no password/token material), so operational diagnosis is unaffected — only the client-visible signal was collapsed.

```typescript
// Lockout check in auth.service.ts
async function checkAccountLockout(userId: string): Promise<void> {
  const failures = await redis.get(`auth:failures:${userId}`);
  if (parseInt(failures ?? "0") >= 5) {
    const lockedUntil = await redis.get(`auth:locked_until:${userId}`);
    if (lockedUntil && Date.now() < parseInt(lockedUntil)) {
      throw new AppError("ACCOUNT_LOCKED", "Account temporarily locked.", 403);
    }
  }
}
```

---

## 3. Authorisation & RBAC

### Role Hierarchy

```
Super Admin (platform-wide)
    │
    └── Admin (org-level)
          │
          ├── Owner (org owner)
          │     │
          │     └── Member (team member)
          │           │
          │           └── Viewer (read-only)
```

### Role Permissions Matrix

| Permission | Super Admin | Admin | Owner | Member | Viewer |
|---|---|---|---|---|---|
| **Platform** | | | | | |
| Access Super Admin Panel | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage all organisations | ✅ | ❌ | ❌ | ❌ | ❌ |
| Override any org plan | ✅ | ❌ | ❌ | ❌ | ❌ |
| Trigger n8n workflows | ✅ | ✅ | ❌ | ❌ | ❌ |
| View dead-letter queue | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Organisation** | | | | | |
| View org content (videos, trends) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create / delete watchlists | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create / delete alert rules | ✅ | ✅ | ✅ | ✅ | ❌ |
| Trigger video analysis | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create exports | ✅ | ✅ | ✅ | ✅ | ❌ |
| Invite members | ✅ | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Billing** | | | | | |
| View billing and invoices | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upgrade / downgrade plan | ✅ | ❌ | ✅ | ❌ | ❌ |
| Cancel subscription | ✅ | ❌ | ✅ | ❌ | ❌ |
| **API Keys** | | | | | |
| View API keys | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create API keys | ✅ | ✅ | ✅ | ❌ | ❌ |
| Revoke API keys | ✅ | ✅ | ✅ | ❌ | ❌ |

### Enforcement Layers

RBAC is enforced at **two independent layers** — neither alone is sufficient:

**Layer 1 — Fastify Middleware (Route Level)**

```typescript
// middleware/authorize.ts
export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRole = request.user.orgRole;
    if (!roles.includes(userRole)) {
      throw new AppError("INSUFFICIENT_PERMISSIONS",
        "Your role does not permit this action.", 403);
    }
  };
}

// Usage in routes:
fastify.delete("/api/v1/watchlists/:id",
  { preHandler: [authenticate, requireRole("owner", "admin", "super_admin")] },
  watchlistController.delete
);
```

**Layer 2 — Service Layer (Business Logic Level)**

```typescript
// services/watchlist.service.ts
async deleteWatchlist(watchlistId: string, requestingUser: AuthUser): Promise<void> {
  const watchlist = await watchlistRepository.findById(watchlistId);
  if (!watchlist) throw new AppError("WATCHLIST_NOT_FOUND", "...", 404);

  // Service-layer permission check — independent of route middleware
  if (!["owner", "admin", "super_admin"].includes(requestingUser.orgRole)) {
    throw new AppError("INSUFFICIENT_PERMISSIONS", "...", 403);
  }

  // Tenant isolation — must belong to the same org
  if (watchlist.orgId !== requestingUser.orgId) {
    throw new AppError("INSUFFICIENT_PERMISSIONS", "...", 403);
  }

  await watchlistRepository.softDelete(watchlistId);
}
```

**Layer 3 — Database (RLS)**

PostgreSQL Row Level Security policies enforce tenant isolation at the storage layer as a final safeguard. See [Database_Schema.md](./Database_Schema.md) for policy definitions.

---

## 4. Session Management

### Session Architecture

```
Client Browser
    │
    ├── accessToken (JWT, 15 min)
    │   └── Stored in memory (JavaScript variable)
    │   └── Sent in Authorization header
    │
    └── refreshToken (opaque random, 30 days)
        └── Stored in HTTP-only Secure SameSite=Strict cookie
        └── sha256(refreshToken) stored in sessions table
        └── Rotated on every use
```

### Session Lifecycle

```
1. Login → Issue accessToken (15 min) + refreshToken (30 days)
2. API request → Send accessToken in Authorization header
3. accessToken expires → Client calls POST /api/v1/auth/refresh
4. Refresh → Verify refreshToken cookie against sessions table
5. If valid → Issue new accessToken + new refreshToken (old one invalidated)
6. If invalid (tampered or revoked) → Return 401, client must re-login
7. Logout → Delete session from DB, clear cookie
```

### Refresh Token Security

- Refresh tokens are cryptographically random (32 bytes, `crypto.randomBytes(32).toString('hex')`)
- Only `sha256(refreshToken)` is stored in the database
- Refresh token rotation: every successful refresh invalidates the previous token
- Rotation gap detection: if a refresh token is used after it has been rotated (replay attack), all sessions for that user are immediately invalidated and the user is notified by email

### Session Invalidation Events

All active sessions are invalidated when:
- User changes their password
- User requests "sign out all devices"
- Super Admin suspends the account
- Suspicious activity is detected (rotation gap — see above)

---

## 5. JWT & OAuth Strategy

### JWT Structure

**Access Token (short-lived):**

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "01HXYZ...",
    "userId": "01HXYZ...",
    "orgId": "01HABC...",
    "orgRole": "owner",
    "planTier": "professional",
    "iat": 1753000000,
    "exp": 1753000900,
    "jti": "01HDEF..."
  }
}
```

**Key JWT fields:**

| Field | Description |
|---|---|
| `sub` | User UUID (standard subject claim) |
| `userId` | Explicit user ID (same as `sub`) |
| `orgId` | Currently active organisation UUID |
| `orgRole` | Role within the current org (`super_admin`, `admin`, `owner`, `member`, `viewer`) |
| `planTier` | Plan for quick feature flag checks without a DB lookup |
| `jti` | JWT ID — unique token identifier for revocation |
| `iat` | Issued at (Unix timestamp) |
| `exp` | Expires at (Unix timestamp, 15 minutes after `iat`) |

### JWT Signing

```typescript
const JWT_ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRY = "15m";

// Signing
const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
  algorithm: JWT_ALGORITHM,
  expiresIn: ACCESS_TOKEN_EXPIRY,
  jwtid: ulid(),        // unique JWT ID
});

// Verification
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: [JWT_ALGORITHM],
}) as JwtPayload;
```

### JWT Secret Requirements

- Minimum 64 characters (512 bits of entropy)
- Generated with `crypto.randomBytes(64).toString('hex')`
- Separate secrets for access tokens (`JWT_SECRET`) and refresh tokens (`JWT_REFRESH_SECRET`)
- Stored in Coolify environment variables — never in code or config files

### JWT Secret Rotation

Rotation procedure (non-disruptive):

1. Generate a new JWT secret
2. Configure the API to accept tokens signed by either the old or new secret (dual validation)
3. Deploy the configuration change
4. Wait for all existing access tokens to expire naturally (max 15 minutes)
5. Remove support for the old secret
6. Deploy the final configuration

Secret rotation is performed:
- **Annually** as a scheduled maintenance task
- **Immediately** on suspected compromise

### Google OAuth Flow

```
1. Client → GET /api/v1/auth/oauth/google
   ↓
2. API → Redirect to accounts.google.com/o/oauth2/v2/auth
         ?client_id=...
         &redirect_uri=https://api.viralscopes.io/api/v1/auth/oauth/google/callback
         &scope=openid email profile
         &state=<csrf_token>        ← prevents CSRF on OAuth flow
         &code_challenge=<pkce>     ← PKCE for additional security
   ↓
3. User authorises on Google
   ↓
4. Google → Redirect to /api/v1/auth/oauth/google/callback?code=...&state=...
   ↓
5. API verifies state matches, exchanges code for tokens
   ↓
6. API fetches user profile from Google
   ↓
7. API upserts user record, creates session, issues JWT
   ↓
8. API → Redirect to /home (existing user) or /onboarding (new user)
```

**Security measures in OAuth flow:**
- State parameter: CSRF protection (random nonce, verified on callback)
- PKCE: Proof Key for Code Exchange — prevents code interception attacks
- Redirect URI: hardcoded in the OAuth app configuration — not passed by the client

### Account Linking Policy (DEC-016)

Step 7 above ("API upserts user record") is not an unconditional upsert-by-email. Three cases, in order:

1. **An `oauth_accounts` row already links this `(provider, providerUid)` to a local user** — reuse that user. This is a returning OAuth user; no ambiguity.
2. **No existing link, but a local `users` row matches the profile's email, and that row is already `email_verified = true`** — link the new provider to it. Both the existing verification (password + email-verification link, or a prior OAuth provider) and this new OAuth login independently prove control of the same mailbox, so they're treated as the same person with no extra friction.
3. **No existing link, and a matching local `users` row exists but is `email_verified = false`** — **refuse the link** (`OAUTH_ACCOUNT_REQUIRES_VERIFICATION`, 409; redirects to `${APP_URL}/login?error=account_requires_verification`). An unverified row means nobody has ever proven ownership of it — it may be a password an unrelated party set on a pre-registered account they don't own (a pre-registration/"Classic-Federated Merge" hijack: attacker registers `victim@example.com` with a password only they know; victim later signs in with a real Google account on that address). Auto-linking here would silently hand the real owner's identity to whichever password the other party chose. The real owner reclaims the account explicitly via `POST /api/v1/auth/forgot-password` → `reset-password` (which emails a reset link to the mailbox they've just proven, via the OAuth provider, that they control) — an intentional, explicit action rather than an implicit merge. No duplicate account is created in this case; the pre-existing row is left untouched until reclaimed.

If none of the above match, a brand-new user is created with `email_verified = true` (the OAuth provider has already verified the address) and no password hash.

---

## 6. Multi-Factor Authentication

### MVP (v1.0) — Not Implemented

MFA is not included in the MVP. The risk is mitigated by:
- Strong password hashing (bcrypt, cost factor 12)
- Account lockout after 5 failed attempts
- Session anomaly detection (IP change + rotation gap)
- Email notification on new device login

### v2.0 — TOTP (Time-Based One-Time Passwords)

**Implementation plan:**
- TOTP via authenticator apps (Google Authenticator, Authy, 1Password)
- Library: `otplib`
- Backup codes: 10 single-use recovery codes generated at TOTP setup
- Enforcement: Optional for Starter/Professional, enforced for Admin/Owner roles on Business+

```typescript
import { authenticator } from "otplib";

// Setup: generate secret and QR code URI
const secret = authenticator.generateSecret();
const otpauth = authenticator.keyuri(user.email, "ViralScopes", secret);

// Verify: on each login after password
const isValid = authenticator.verify({ token: userInputCode, secret });
```

### v3.0 — FIDO2 / WebAuthn (Hardware Keys)

- Support for security keys (YubiKey, etc.) for Enterprise customers
- Required for Super Admin accounts
- Browser-native WebAuthn API

---

## 7. Encryption at Rest

### Database (PostgreSQL via Supabase)

| Layer | Encryption | Details |
|---|---|---|
| **Disk encryption** | AES-256 | Supabase infrastructure — encrypted at the storage layer |
| **Sensitive columns** | Application-level encryption | OAuth tokens, refresh tokens in `oauth_accounts` |
| **Passwords** | bcrypt (not encryption — one-way hash) | `password_hash` in `users` table |
| **API keys** | SHA-256 hash (not encryption) | `key_hash` in `api_keys` table |

### Application-Level Column Encryption

For particularly sensitive fields (OAuth `access_token`, `refresh_token`), we apply application-level AES-256-GCM encryption before storage:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENCRYPTION_KEY = Buffer.from(process.env.DB_ENCRYPTION_KEY, "hex"); // 32 bytes
const ALGORITHM = "aes-256-gcm";

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store as: iv:authTag:ciphertext (base64)
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decrypt(ciphertext: string): string {
  const [ivB64, authTagB64, dataB64] = ciphertext.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
```

### Object Storage (Cloudflare R2)

- Server-side encryption: AES-256 (enabled by default on R2)
- Client-side encryption: Not applied — S3-level encryption is sufficient for thumbnails and exports

### Secrets in Transit to Storage

- Secrets are injected as environment variables by Coolify at runtime
- Environment variables are encrypted at rest in Coolify's configuration store
- No secrets are written to container filesystems, logs, or temporary files

---

## 8. Encryption in Transit

### TLS Configuration

```
Minimum TLS version:    1.2
Preferred version:      1.3
Certificate authority:  Let's Encrypt (via Coolify / Traefik)
Certificate renewal:    Automatic (60-day certificates, renewed at 30 days)
HSTS:                   max-age=31536000; includeSubDomains; preload
HTTP redirect:          All HTTP → HTTPS at Traefik (307 Temporary Redirect)
```

### Cipher Suite Policy

TLS 1.3 ciphers (all forward-secret):
- `TLS_AES_256_GCM_SHA384`
- `TLS_CHACHA20_POLY1305_SHA256`
- `TLS_AES_128_GCM_SHA256`

TLS 1.2 ciphers (forward-secret only):
- `ECDHE-RSA-AES256-GCM-SHA384`
- `ECDHE-RSA-AES128-GCM-SHA256`

**Disabled:**
- TLS 1.0 and 1.1
- RC4, DES, 3DES, MD5
- Non-forward-secret RSA key exchange

### Service-to-Service Communication

All inter-service communication occurs within the Docker internal network. At Stage 3+, mTLS via Istio is planned. Until then:
- All API → Supabase connections use TLS
- All API → Redis connections use TLS (when using managed Redis)
- All API → external services (Stripe, OpenAI, Anthropic, SendGrid) use HTTPS
- The Docker internal network is isolated and not publicly accessible

### Certificate Management

```
Traefik configuration:
  [certificatesResolvers.letsencrypt.acme]
    email = "security@viralscopes.io"
    storage = "/letsencrypt/acme.json"
    [certificatesResolvers.letsencrypt.acme.httpChallenge]
      entryPoint = "web"
```

---

## 9. Secret Management

### Secret Categories

| Category | Examples | Storage | Access |
|---|---|---|---|
| **Application secrets** | JWT secrets, DB encryption key | Coolify env vars | API service only |
| **Service credentials** | Stripe keys, OpenAI key, SendGrid key | Coolify env vars | API / n8n as appropriate |
| **Database credentials** | DATABASE_URL | Coolify env vars | API service only |
| **Infrastructure secrets** | Coolify webhook token, GitHub Actions secrets | GitHub Secrets / Coolify | CI/CD pipeline |
| **OAuth app credentials** | Google Client ID/Secret, GitHub Client ID/Secret | Coolify env vars | API service only |

### Secret Injection Pattern

```
Developer workstation → .env.local (gitignored, local only)
Staging environment  → Coolify environment variables (encrypted at rest)
Production           → Coolify environment variables (encrypted at rest)
CI/CD pipeline       → GitHub Actions Secrets (encrypted at rest)
```

No secret ever appears in:
- Source code files
- Docker images
- CI/CD pipeline logs
- Application logs (Pino)
- Error responses returned to clients

### Secret Detection

The pre-commit hook runs `detect-secrets` (Yelp) or `git-secrets` (AWS) to scan staged changes for potential secrets before committing:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
npx detect-secrets scan --baseline .secrets.baseline
```

### Secret Rotation Schedule

| Secret | Rotation frequency | Method |
|---|---|---|
| `JWT_SECRET` | Annually + on compromise | Dual-validation rolling rotation |
| `JWT_REFRESH_SECRET` | Annually + on compromise | Dual-validation rolling rotation |
| `DB_ENCRYPTION_KEY` | Every 2 years | Re-encrypt all affected columns during maintenance window |
| `STRIPE_WEBHOOK_SECRET` | On team member departure | Regenerate in Stripe dashboard |
| `N8N_ENCRYPTION_KEY` | On team member departure | Regenerate, re-enter all credentials in n8n |
| API keys (user-facing) | User-initiated, or on revocation | Single-use, immediate revocation |
| OAuth app secrets | Annually | Regenerate in provider console |

### v3.0: HashiCorp Vault

At Stage 3, Coolify env var injection will be replaced by HashiCorp Vault:
- Dynamic secrets (auto-rotated database credentials)
- Audit log for every secret access
- Fine-grained per-service secret access policies
- Automatic rotation for supported integrations

---

## 10. Input Validation

### Validation Strategy

All API inputs are validated using **Zod** before reaching any business logic. Validation happens at the route layer:

```typescript
// schemas/video.schema.ts
import { z } from "zod";

export const analyzeVideoSchema = z.object({
  url: z.string()
    .url("Must be a valid URL")
    .refine(
      (url) => url.includes("youtube.com/watch") || url.includes("youtu.be"),
      "Must be a YouTube video URL"
    ),
});

// routes/v1/videos.routes.ts
fastify.post("/api/v1/videos/analyze", {
  schema: {
    body: zodToJsonSchema(analyzeVideoSchema),
  },
  preHandler: [authenticate, requirePlan("starter")],
  handler: videoController.analyze,
});
```

### Validation Rules

| Input type | Validation applied |
|---|---|
| Email addresses | RFC 5322 format check + lowercase normalisation |
| Passwords | Length (10–128), common password blocklist |
| URLs | Valid URL format + allowed domain allowlist for YouTube URLs |
| UUIDs | UUID v4 format |
| Dates | ISO 8601 format |
| Enums | Must be one of the defined values (no `string` catch-alls) |
| Numbers | Type check + range check (min/max) |
| Strings | `trim()` applied, max length enforced per field |
| Arrays | Max length enforced to prevent memory exhaustion |
| JSONB fields | Validated against a defined sub-schema |
| File uploads | Type, size, and content validation (see Section 17) |

### Validation Response

Failed validation always returns `422 Unprocessable Entity` with structured field-level errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "fields": [
        { "field": "url", "message": "Must be a YouTube video URL." },
        { "field": "email", "message": "Invalid email format." }
      ]
    }
  }
}
```

---

## 11. XSS Protection

### Prevention Strategy

| Layer | Control | Implementation |
|---|---|---|
| **Frontend output** | Automatic escaping | React escapes all dynamic content by default |
| **User-generated content** | HTML sanitisation | `DOMPurify` on any user content rendered as HTML |
| **Content Security Policy** | Restricts script sources | CSP header set by Helmet.js (see below) |
| **Cookie flags** | Prevents cookie theft via XSS | `HttpOnly`, `Secure`, `SameSite=Strict` on all cookies |
| **API responses** | JSON only | API never returns HTML; `Content-Type: application/json` enforced |

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{nonce}';
  style-src 'self' 'nonce-{nonce}' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://cdn.viralscopes.io https://i.ytimg.com;
  connect-src 'self' https://api.viralscopes.io https://vitals.vercel-insights.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
```

- `nonce` is generated per-request by Next.js middleware
- `unsafe-inline` is never used
- `unsafe-eval` is never used

### DOMPurify Usage

```typescript
import DOMPurify from "dompurify";

// Only used when rendering user-supplied content as HTML
// (e.g. video descriptions that may contain basic formatting)
const sanitized = DOMPurify.sanitize(userContent, {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
  ALLOWED_ATTR: ["href"],
  FORCE_HTTPS: true,
});
```

---

## 12. CSRF Protection

### Strategy

CSRF attacks target browser-based sessions (cookie auth). They are not a risk for API key authentication.

**Protection method: Double Submit Cookie (Synchronised Token Pattern)**

```
1. On login, API sets two tokens:
   - refreshToken:  HTTP-only Secure cookie   (not readable by JavaScript)
   - csrfToken:     Standard Secure cookie     (readable by JavaScript)

2. On state-changing requests (POST, PUT, DELETE, PATCH):
   - Next.js reads the csrfToken from the cookie
   - Includes it in the X-CSRF-Token request header
   - API verifies that X-CSRF-Token matches the csrfToken cookie
   - An attacker's site cannot read the csrfToken cookie (SameSite=Strict prevents cross-site requests from including cookies)
```

**Implementation:**

```typescript
// API middleware: validate CSRF token
export async function validateCsrf(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip for non-browser auth (API keys)
  if (request.isApiKeyAuth) return;

  const cookieToken = request.cookies["csrf_token"];
  const headerToken = request.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new AppError("CSRF_VALIDATION_FAILED", "Invalid CSRF token.", 403);
  }
}
```

**SameSite cookies** provide a first layer of CSRF protection. The Double Submit Cookie pattern provides a second, independent layer.

---

## 13. SQL Injection Prevention

### Strategy

SQL injection is prevented at **two independent layers**:

**Layer 1: ORM (Drizzle) — Primary**

All database queries use Drizzle ORM's query builder, which generates parameterised SQL automatically. Raw string interpolation in SQL is not permitted:

```typescript
// ✅ Safe — Drizzle generates parameterised query
const videos = await db
  .select()
  .from(videosTable)
  .where(
    and(
      eq(videosTable.orgId, orgId),
      gte(videosTable.viralScore, minScore)
    )
  )
  .limit(limit);

// ❌ Prohibited — raw string interpolation
const videos = await db.execute(
  `SELECT * FROM videos WHERE org_id = '${orgId}'`  // NEVER DO THIS
);
```

**Layer 2: Input Validation (Zod) — Defence in Depth**

All inputs are validated and typed before reaching the database layer. A string expected to be a UUID is validated as a UUID. An integer is validated as an integer. This prevents injection even if raw queries were accidentally used.

**Layer 3: Least-Privilege Database User**

The application database user has `SELECT`, `INSERT`, `UPDATE`, `DELETE` on application tables only — no `DROP`, `CREATE`, `ALTER`, or access to system tables.

```sql
-- Application role
CREATE ROLE viralscopes_app WITH LOGIN PASSWORD '...';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO viralscopes_app;
REVOKE ALL ON SCHEMA pg_catalog FROM viralscopes_app;
```

### ESLint Rule

```json
// .eslintrc.js
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='execute'] > TemplateLiteral",
        "message": "Raw SQL template literals are prohibited. Use the Drizzle query builder."
      }
    ]
  }
}
```

---

## 14. API Security

### Authentication on Every Endpoint

Every API endpoint (except `/health`, `/ready`, `/api/v1/auth/*`, `/api/v1/billing/plans`, `/api/v1/webhooks/*`) requires either a valid JWT access token or a valid API key:

```
Authorization: Bearer <jwt_or_api_key>
```

The authentication middleware validates the token before any route handler executes.

### API Key Design

| Property | Value |
|---|---|
| **Format** | `vs_live_<40-char-random-hex>` (production) / `vs_test_<40-char-random-hex>` (test) |
| **Storage** | `sha256(key)` only — plaintext never stored |
| **Scopes** | Fine-grained: `videos:read`, `trends:read`, `analytics:read`, `watchlists:write`, etc. |
| **Expiry** | Optional — set at creation; `null` means no expiry |
| **Revocation** | Immediate — deleting the record from `api_keys` invalidates the key on next request |
| **Rate limiting** | Per API key, per plan tier |

**API key lookup:**

```typescript
export async function authenticateApiKey(rawKey: string): Promise<ApiKeyAuth> {
  const keyHash = sha256(rawKey);
  const apiKey = await apiKeyRepository.findByHash(keyHash);

  if (!apiKey) throw new AppError("AUTHENTICATION_REQUIRED", "Invalid API key.", 401);
  if (apiKey.revokedAt) throw new AppError("AUTHENTICATION_REQUIRED", "API key revoked.", 401);
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw new AppError("TOKEN_EXPIRED", "API key has expired.", 401);
  }

  // Update last used timestamp (async, non-blocking)
  apiKeyRepository.updateLastUsed(apiKey.id).catch(console.error);

  return { orgId: apiKey.orgId, scopes: apiKey.scopes, isApiKeyAuth: true };
}
```

### Webhook Signature Verification

All incoming webhooks verify the provider's signature before processing:

**Stripe:**
```typescript
import Stripe from "stripe";

export async function verifyStripeWebhook(
  payload: string,
  signature: string
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new AppError("INVALID_WEBHOOK_SIGNATURE",
      "Webhook signature verification failed.", 400);
  }
}
```

**Custom outbound webhooks:**
```typescript
// Verify incoming acknowledgement-style webhooks
const expectedSig = crypto
  .createHmac("sha256", webhookSecret)
  .update(rawPayload)
  .digest("hex");

const actualSig = request.headers["x-viralscopes-signature"]?.replace("sha256=", "");

if (!crypto.timingSafeEqual(
  Buffer.from(expectedSig),
  Buffer.from(actualSig ?? "")
)) {
  throw new AppError("INVALID_WEBHOOK_SIGNATURE", "...", 400);
}
```

`crypto.timingSafeEqual` is used to prevent timing attacks on the signature comparison.

### CORS Policy

```typescript
// plugins/cors.plugin.ts
fastify.register(cors, {
  origin: [
    "https://app.viralscopes.io",
    "https://staging.viralscopes.io",
    ...(process.env.APP_ENV === "development" ? ["http://localhost:3000"] : []),
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Request-ID"],
  maxAge: 86400,
});
```

No wildcard (`*`) is ever used in production.

### Security Headers (Helmet.js)

```typescript
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://cdn.viralscopes.io"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: "deny" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  permittedCrossDomainPolicies: false,
  xContentTypeOptions: true,
  xDnsPrefetchControl: { allow: false },
});
```

---

## 15. Rate Limiting & Brute Force Prevention

### Redis-Backed Sliding Window Rate Limiter

```typescript
// plugins/rate-limit.plugin.ts
fastify.register(fastifyRateLimit, {
  global: true,
  redis: redisClient,
  keyGenerator: (request) => {
    // Rate limit by API key if present, otherwise by user ID, fallback to IP
    return request.apiKeyId ?? request.user?.id ?? request.ip;
  },
  max: async (request) => {
    const plan = request.user?.planTier ?? "free";
    return RATE_LIMITS[plan].perMinute;
  },
  timeWindow: "1 minute",
  errorResponseBuilder: () => ({
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Rate limit exceeded. Upgrade your plan or wait for the window to reset.",
    },
  }),
  addHeaders: {
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
    "retry-after": true,
  },
});
```

### Auth Endpoint Rate Limits (Per IP)

| Endpoint | Limit | Window | Lockout |
|---|---|---|---|
| `POST /auth/login` | 10 | 1 minute | Block for 5 minutes after 10th attempt |
| `POST /auth/register` | 5 | 1 minute | — |
| `POST /auth/forgot-password` | 5 | 15 minutes | — |
| `POST /auth/reset-password` | 3 | 15 minutes | — |
| `POST /auth/verify-email` | 5 | 15 minutes | — |
| `GET /auth/oauth/*` | 20 | 1 minute | — |

### Brute Force Account Lockout

Separate from rate limiting — tracks failed attempts per account:

```
After 5 failures:  Lock for 15 minutes + send unlock email
After 10 failures: Lock for 1 hour
After 15 failures: Lock for 24 hours + notify security team
```

Counters stored in Redis with TTL matching the lockout duration.

---

## 16. DDoS Mitigation

### Cloudflare Protection Layers

| Layer | Protection | Configuration |
|---|---|---|
| **L3/L4 DDoS** | Cloudflare Magic Transit (or included in Pro plan) | Auto-mitigation for volumetric attacks |
| **L7 HTTP DDoS** | Cloudflare HTTP DDoS managed ruleset | Enabled — blocks common attack patterns |
| **WAF Rules** | Cloudflare WAF managed rules | OWASP Core Rule Set enabled |
| **IP Reputation** | Cloudflare Threat Score | Block IPs with score > 50 |
| **Bot Management** | Cloudflare Bot Fight Mode | Enabled on auth endpoints |
| **Rate limiting** | Cloudflare rate limiting rules | 100 req/min per IP on `/api/*` |
| **Geo-blocking** | Cloudflare Firewall Rules | Block known high-risk countries (configurable) |

### Application-Level DDoS Mitigation

| Control | Implementation |
|---|---|
| Request size limit | Max 1MB body size on all endpoints; 10MB on file upload endpoints |
| Timeout | 30-second request timeout on all endpoints |
| Connection limit | Traefik limits concurrent connections per IP |
| Slow loris prevention | Traefik `readTimeout` and `writeTimeout` configured |
| JSON parsing limit | Fastify `bodyLimit: 1048576` (1MB) |

---

## 17. Secure File Handling

### File Upload Policy

At MVP, ViralScopes does not accept direct file uploads from users. The only file operations are:

1. **Thumbnail downloads** — the n8n workflow downloads thumbnails from YouTube CDN URLs for AI analysis (server-to-server, not user uploads)
2. **Export downloads** — users download exports generated by the platform (served via signed S3 URLs)

### Thumbnail Download Security

```typescript
// In n8n thumbnail analysis workflow
async function downloadThumbnail(thumbnailUrl: string): Promise<Buffer> {
  // Validate URL is from YouTube CDN before downloading
  const parsed = new URL(thumbnailUrl);
  const allowedHosts = ["i.ytimg.com", "i1.ytimg.com", "i2.ytimg.com",
                        "img.youtube.com", "yt3.ggpht.com"];

  if (!allowedHosts.includes(parsed.hostname)) {
    throw new Error(`Untrusted thumbnail host: ${parsed.hostname}`);
  }

  const response = await fetch(thumbnailUrl, {
    signal: AbortSignal.timeout(10000), // 10-second timeout
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  const buffer = await response.arrayBuffer();

  // Enforce max thumbnail size (5MB)
  if (buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error("Thumbnail exceeds maximum size");
  }

  return Buffer.from(buffer);
}
```

### Export File Security

- Exports are generated server-side and stored in Cloudflare R2 (private bucket)
- Users receive signed URLs with a 24-hour expiry — no direct bucket access
- Signed URLs are generated by the API using Cloudflare R2 pre-signed URL API
- Users can only download exports belonging to their own organisation (enforced by service layer)

### Future File Upload Handling (v2.0)

When user file uploads are introduced (e.g. custom thumbnail uploads, logo uploads):

- [ ] Validate MIME type from file magic bytes (not file extension or Content-Type header alone)
- [ ] Enforce maximum file size (configurable per file type)
- [ ] Store uploads in a quarantine bucket first
- [ ] Run ClamAV antivirus scan before making accessible
- [ ] Never serve user-uploaded files from the same origin as the application
- [ ] Rename files with a random UUID on upload (prevent path traversal)
- [ ] Set `Content-Disposition: attachment` on all served uploads

---

## 18. Audit Logging

### What Is Logged

Every significant security event generates an immutable entry in the `audit_logs` table. Audit logs are never modified or deleted (except per the 2-year retention policy).

| Event category | Events logged |
|---|---|
| **Authentication** | Login (success/failure), logout, password reset, email verification, OAuth connect |
| **Account** | Email change, password change, account deletion request, account suspension |
| **Organisation** | Created, plan changed, member invited, member removed, role changed, ownership transferred |
| **Billing** | Subscription started, plan upgraded, plan downgraded, payment failed, subscription cancelled |
| **API Keys** | Created, revoked |
| **Data access** | Export created, export downloaded |
| **Admin actions** | User suspended, plan overridden, dead-letter job retried, quota reset, workflow triggered |
| **Security** | Failed login attempts, account lockout, session revocation, anomaly detected |

### Audit Log Entry Structure

```json
{
  "id": "01HXYZ...",
  "org_id": "01HABC...",
  "user_id": "01HDEF...",
  "action": "member.role_changed",
  "resource_type": "organization_member",
  "resource_id": "01HGHI...",
  "ip_address": "82.12.34.56",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...",
  "metadata": {
    "previous_role": "member",
    "new_role": "admin",
    "changed_by": "01HJKL..."
  },
  "created_at": "2026-07-20T10:22:00Z"
}
```

### Audit Log Access

- Users can view their own organisation's audit log via `GET /api/v1/admin/audit-logs` (Admin+ role)
- Super Admins can view any organisation's audit log
- Audit logs are never exposed via the public API (API key auth cannot access audit logs)
- GDPR note: when a user account is hard-deleted, `user_id` in audit logs is replaced with `DELETED_USER` — the events are preserved for compliance but PII is removed

### Tamper Evidence

- `audit_logs` has no `UPDATE` permission for the application role
- A PostgreSQL trigger fires on any attempted update and raises an exception
- Audit logs are also periodically exported to immutable object storage (append-only R2 bucket) at Stage 2+

---

## 19. Compliance

### GDPR (General Data Protection Regulation)

| Requirement | Implementation | Status |
|---|---|---|
| **Lawful basis** | Legitimate interest (analytics) + contract (service delivery) | Documented in Privacy Policy |
| **Data minimisation** | Only data needed for the feature is collected | Enforced in schema design |
| **Purpose limitation** | Data collected for content analysis is not used for advertising | Policy commitment + no ad network integrations |
| **Right to access** | `GET /api/v1/account/export` — returns all user data as JSON | MVP |
| **Right to deletion** | `DELETE /api/v1/account` — hard deletes PII within 30 days | MVP |
| **Right to rectification** | Users can update all personal data via Settings | MVP |
| **Data portability** | Export in machine-readable JSON format | MVP |
| **Consent** | Cookie consent banner; no non-essential cookies before consent | MVP |
| **Privacy policy** | Legally reviewed, linked from all auth pages and footer | MVP |
| **DPA** | Data Processing Agreements available for Enterprise customers | MVP |
| **Breach notification** | 72-hour notification to ICO + affected users | Incident response plan |
| **Data transfers** | AI APIs (OpenAI, Anthropic) are US-based; covered by DPA and SCCs | Documented |

### CCPA (California Consumer Privacy Act)

| Requirement | Implementation |
|---|---|
| **Right to know** | Data export endpoint covers CCPA right to know |
| **Right to delete** | Account deletion endpoint covers CCPA right to delete |
| **Right to opt out of sale** | ViralScopes does not sell personal data |
| **Non-discrimination** | No discrimination for exercising CCPA rights |

### Data Processing Locations

| Data | Processed where | Legal basis |
|---|---|---|
| User PII (email, name) | EU (Supabase Frankfurt) | GDPR contract |
| Video content analysis | US (OpenAI, Anthropic APIs) | GDPR standard contractual clauses (SCCs) |
| Payment data | US (Stripe) | Stripe DPA + SCCs |
| Email delivery | US (SendGrid) | SendGrid DPA + SCCs |

### Cookies

| Cookie | Purpose | Duration | Consent required |
|---|---|---|---|
| `refresh_token` | Session authentication | 30 days | No (strictly necessary) |
| `csrf_token` | CSRF protection | Session | No (strictly necessary) |
| `cookie_consent` | Records consent choice | 1 year | No (functional) |
| Any analytics cookies | Not used in MVP | — | Yes (not set at MVP) |

---

## 20. Vulnerability Management

### Dependency Scanning

**In CI pipeline (every PR):**

```yaml
# .github/workflows/security.yml
- name: Audit dependencies
  run: npm audit --audit-level=high
  # Fails if high or critical CVEs are found
```

- High or Critical CVEs: **block the PR merge**
- Moderate CVEs: warning in CI, must be resolved within 7 days
- Low CVEs: logged, resolved in next scheduled dependency update

### Automated Dependency Updates

Dependabot is configured to open PRs for:
- All `npm` packages weekly
- Docker base images weekly
- GitHub Actions weekly

Update PRs are auto-merged for patch versions (if CI passes). Minor and major version updates require manual review.

### Penetration Testing

| Stage | Frequency | Type | Who |
|---|---|---|---|
| Stage 1 (MVP) | None | — | — |
| Stage 2 | Annually | External black-box + grey-box | Third-party security firm |
| Stage 3 | Annually + on major releases | External black-box + grey-box + source review | Specialist security firm |
| Stage 4 | Bi-annually | Full red team exercise | Enterprise security firm |

### Bug Bounty Programme

Planned for v2.0. Will cover:
- Authentication bypass
- IDOR (Insecure Direct Object Reference) / tenant data leakage
- SQL injection
- XSS with impact
- SSRF (Server-Side Request Forgery)
- Significant business logic flaws

**Out of scope:** DoS, social engineering, physical attacks, issues in third-party libraries with no practical impact.

### Common Vulnerability Checks

The following are checked in every code review and in CI:

- [ ] No hardcoded secrets or credentials
- [ ] No use of `eval()` or `Function()` constructor
- [ ] No raw SQL string interpolation
- [ ] No `dangerouslySetInnerHTML` in React without `DOMPurify`
- [ ] No logging of PII or secrets
- [ ] No open redirects (redirect targets validated against allowlist)
- [ ] No SSRF vectors (user-supplied URLs validated before server-side fetching)
- [ ] No insecure randomness (always use `crypto.randomBytes`, not `Math.random`)
- [ ] No XXE (XML External Entity) — no XML parsing in the application

---

## 21. Incident Response Plan

### Severity Levels

| Level | Definition | Response time | Example |
|---|---|---|---|
| **P1 — Critical** | Active breach, data exfiltration, service completely down | < 15 minutes | Database breach, all users locked out |
| **P2 — High** | Significant vulnerability, partial service disruption | < 1 hour | Auth bypass discovered, API partially down |
| **P3 — Medium** | Security vulnerability with no active exploitation | < 24 hours | XSS discovered in non-critical page |
| **P4 — Low** | Minor security issue, low impact | < 7 days | Verbose error message, minor info disclosure |

### Incident Response Procedure

#### Phase 1 — Detect & Triage (0–15 minutes)

- [ ] Alert fires in PagerDuty or engineer observes anomaly
- [ ] On-call engineer acknowledges the alert
- [ ] Assess severity level (P1–P4)
- [ ] Create an incident channel in Slack (`#incident-<date>-<short-description>`)
- [ ] Assign: Incident Commander, Technical Lead, Communications Lead

#### Phase 2 — Contain (15–60 minutes for P1)

**If active breach suspected:**
- [ ] Immediately revoke all active sessions for affected accounts
- [ ] Rotate JWT secrets (using dual-validation rotation procedure)
- [ ] Temporarily enable IP allowlisting on admin endpoints
- [ ] Disable affected service or endpoint if necessary
- [ ] Preserve evidence: snapshot affected logs before any remediation

**For all incidents:**
- [ ] Identify the attack vector
- [ ] Determine blast radius: which accounts, which data, which systems
- [ ] Notify the founding team immediately for P1/P2

#### Phase 3 — Eradicate (P1: within hours; P2: within 24h)

- [ ] Remove the vulnerability or attack vector
- [ ] Apply patches if dependency-related
- [ ] Reset all potentially compromised credentials
- [ ] Verify that the attack vector is closed

#### Phase 4 — Recover

- [ ] Restore service in a known-clean state
- [ ] Monitor closely for 24 hours post-recovery
- [ ] Verify no data integrity issues in the database
- [ ] Confirm all security controls are functioning normally

#### Phase 5 — Communicate

**Internal:**
- [ ] Update the incident Slack channel continuously
- [ ] Brief company leadership within 1 hour of P1 confirmation

**External (for P1/P2 involving user data):**
- [ ] Notify affected users within 72 hours (GDPR requirement)
- [ ] Notify the ICO (UK) within 72 hours if personal data was involved
- [ ] Post a status update on `status.viralscopes.io` (Post-MVP)
- [ ] Prepare a detailed post-mortem

#### Phase 6 — Post-Mortem (within 5 days)

A blameless post-mortem document is published internally covering:
- Timeline of events
- Root cause analysis
- Contributing factors
- What went well
- What did not go well
- Action items with owners and deadlines
- How similar incidents will be prevented

---

## 22. Security Testing Strategy

### Pre-Commit

- `detect-secrets` scan on all staged files
- ESLint security rules (no eval, no dangerous HTML injection patterns)

### Pull Request

- `npm audit --audit-level=high` — fails on high/critical CVEs
- Unit tests for all security-sensitive functions (token validation, permission checks, hash functions)
- Integration tests for auth flows and RBAC enforcement

### Staging Environment

- Manual security review checklist (below) on every major feature
- OWASP ZAP automated scan weekly
- Load test to verify rate limiting holds under concurrency

### Pre-Production

- Full manual penetration test of new features before first production deployment
- OWASP Top 10 checklist verified

### Production

- Continuous: Cloudflare WAF rules, Prometheus anomaly alerts
- Weekly: Automated dependency audit
- Monthly: Review Cloudflare WAF block logs for new attack patterns
- Annually: External penetration test (Stage 2+)

---

## 23. Security Checklist

Use this checklist for every feature review and before each release.

### Authentication & Sessions
- [ ] All protected endpoints require valid JWT or API key
- [ ] Access tokens expire in 15 minutes
- [ ] Refresh tokens are stored HTTP-only, Secure, SameSite=Strict
- [ ] Refresh token rotation invalidates the previous token
- [ ] Account lockout triggers after 5 failed attempts
- [ ] Password reset tokens are single-use and expire in 1 hour
- [ ] Email verification is required before dashboard access

### Authorisation
- [ ] RBAC checks at both route middleware and service layer
- [ ] Tenant isolation enforced (org_id filter on all tenant queries)
- [ ] RLS policies active on all tenant-scoped tables
- [ ] No privilege escalation vectors

### Input & Output
- [ ] All inputs validated with Zod before any processing
- [ ] All user-generated content sanitised before rendering
- [ ] No raw SQL string interpolation
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] Error responses never expose stack traces or internal details

### Transport & Headers
- [ ] HTTPS enforced; HTTP redirects to HTTPS
- [ ] HSTS enabled with preload
- [ ] CSP header set and tested
- [ ] All Helmet.js headers active
- [ ] CORS locked to allowed origins only
- [ ] CSRF protection on browser-session state-changing endpoints

### Secrets & Keys
- [ ] No secrets in source code or Docker images
- [ ] No secrets in application logs
- [ ] API keys stored as sha256 hash only
- [ ] Webhook signatures verified on all inbound webhooks
- [ ] OAuth state parameter validated on callback

### Audit & Monitoring
- [ ] All auth events logged to audit_logs
- [ ] All admin actions logged to audit_logs
- [ ] Prometheus alert configured for auth failure rate spike
- [ ] Prometheus alert configured for anomalous API usage

### Dependencies & Infrastructure
- [ ] npm audit passes with no high/critical CVEs
- [ ] All Docker base images pinned to specific digest
- [ ] Coolify environment variables used for all secrets
- [ ] No sensitive data in Grafana dashboards or Loki logs

---

*This document is reviewed and updated quarterly, after every penetration test, and immediately following any security incident. All changes require a pull request with at least two approving reviews.*

---

**Related Documents:**
- [PROJECT_RULES.md](./PROJECT_RULES.md) — Security requirements in engineering standards
- [Database_Schema.md](./Database_Schema.md) — RLS policy design and data security
- [URL_&_API_Structure.md](./URL_and_API_Structure.md) — API authentication and rate limiting
- [Deployment_Guide.md](./Deployment_Guide.md) — Secret injection and environment configuration
- [Monitoring_&_Operations.md](./Monitoring_and_Operations.md) — Security monitoring and alerting
