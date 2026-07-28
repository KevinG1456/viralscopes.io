// Decodes (does NOT verify -- that's the backend's job on every request)
// the access token's payload for display/routing purposes only: orgId,
// orgRole, planTier. Safe to read client-side since a JWT payload is
// base64, not encrypted -- the signature is what makes it trustworthy,
// and that's checked server-side, never here.
export interface DecodedAccessToken {
  userId: string;
  orgId: string | null;
  orgRole: string | null;
  planTier: string | null;
}

export function decodeAccessToken(token: string): DecodedAccessToken | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(json) as Partial<DecodedAccessToken>;
    return {
      userId: parsed.userId ?? '',
      orgId: parsed.orgId ?? null,
      orgRole: parsed.orgRole ?? null,
      planTier: parsed.planTier ?? null,
    };
  } catch {
    return null;
  }
}
