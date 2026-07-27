import { AppError } from './errors.js';

export interface OAuthProfile {
  providerUid: string;
  email: string;
  name: string | null;
}

export async function fetchGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new AppError('OAUTH_PROFILE_FETCH_FAILED', 'Could not fetch Google profile.', 502);
  }
  const body = (await res.json()) as { sub: string; email: string; name?: string };
  return { providerUid: body.sub, email: body.email, name: body.name ?? null };
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export async function fetchGitHubProfile(accessToken: string): Promise<OAuthProfile> {
  const headers = { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'viralscopes.io' };

  const userRes = await fetch('https://api.github.com/user', { headers });
  if (!userRes.ok) {
    throw new AppError('OAUTH_PROFILE_FETCH_FAILED', 'Could not fetch GitHub profile.', 502);
  }
  const user = (await userRes.json()) as GitHubUser;

  // GitHub omits `email` from /user when the user's email is private —
  // the verified primary address has to be fetched separately.
  let email = user.email;
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', { headers });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as GitHubEmail[];
      email = emails.find((e) => e.primary && e.verified)?.email ?? null;
    }
  }

  if (!email) {
    throw new AppError(
      'OAUTH_EMAIL_UNAVAILABLE',
      'Your GitHub account has no verified public email. Please make one visible and try again.',
      422,
    );
  }

  return { providerUid: String(user.id), email, name: user.name ?? user.login };
}
