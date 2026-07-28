'use client';

import * as React from 'react';

import * as authApi from '../lib/api/auth';
import { getAccessToken, refreshAccessToken, setAccessToken } from '../lib/api/client';
import { decodeAccessToken } from '../lib/utils/jwt';
import type { PublicUser } from '../types/api';

const CACHED_USER_KEY = 'vs:cachedUser';

// The user object returned by /login and /register is cached here purely
// for display (name/email survive a page reload even though the access
// token itself doesn't -- see lib/api/client.ts's comment). It is never
// treated as an authorisation source; every request is still gated by the
// real access token, refreshed via the httpOnly cookie.
function readCachedUser(): PublicUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHED_USER_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: PublicUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) window.localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(CACHED_USER_KEY);
}

interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: PublicUser | null;
  orgId: string | null;
  orgRole: string | null;
  planTier: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function applyToken(token: string | null, user: PublicUser | null): AuthState {
  if (!token)
    return { status: 'unauthenticated', user: null, orgId: null, orgRole: null, planTier: null };
  const decoded = decodeAccessToken(token);
  return {
    status: 'authenticated',
    user,
    orgId: decoded?.orgId ?? null,
    orgRole: decoded?.orgRole ?? null,
    planTier: decoded?.planTier ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [state, setState] = React.useState<AuthState>({
    status: 'loading',
    user: null,
    orgId: null,
    orgRole: null,
    planTier: null,
  });

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const refreshed = await refreshAccessToken();
      if (cancelled) return;
      setState(
        applyToken(refreshed ? getAccessToken() : null, refreshed ? readCachedUser() : null),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setAccessToken(result.accessToken);
    writeCachedUser(result.user);
    setState(applyToken(result.accessToken, result.user));
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      writeCachedUser(null);
      setState({
        status: 'unauthenticated',
        user: null,
        orgId: null,
        orgRole: null,
        planTier: null,
      });
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
