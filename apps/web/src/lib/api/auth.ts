import { apiRequest } from './client';
import type { LoginResult, PublicUser, Session } from '../../types/api';

export async function login(email: string, password: string): Promise<LoginResult> {
  const { data } = await apiRequest<LoginResult>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return data;
}

export async function register(
  email: string,
  name: string,
  password: string,
): Promise<{ user: PublicUser; message: string }> {
  const { data } = await apiRequest<{ user: PublicUser; message: string }>(
    '/api/v1/auth/register',
    {
      method: 'POST',
      body: { email, name, password },
    },
  );
  return data;
}

export async function logout(): Promise<void> {
  await apiRequest('/api/v1/auth/logout', { method: 'POST', csrf: true });
}

export async function verifyEmail(token: string): Promise<void> {
  await apiRequest('/api/v1/auth/verify-email', { method: 'POST', body: { token } });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRequest('/api/v1/auth/forgot-password', { method: 'POST', body: { email } });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiRequest('/api/v1/auth/reset-password', { method: 'POST', body: { token, password } });
}

export async function listSessions(): Promise<Session[]> {
  const { data } = await apiRequest<{ sessions: Session[] }>('/api/v1/auth/sessions');
  return data.sessions;
}

export async function revokeSession(id: string): Promise<void> {
  await apiRequest(`/api/v1/auth/sessions/${id}`, { method: 'DELETE', csrf: true });
}

export async function revokeOtherSessions(): Promise<{ revokedCount: number }> {
  const { data } = await apiRequest<{ revokedCount: number }>('/api/v1/auth/sessions', {
    method: 'DELETE',
    csrf: true,
  });
  return data;
}
