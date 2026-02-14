import { cookies } from 'next/headers';
import { getAuthConfig } from './config';
import { signValue, verifyValue } from './signing';

export type SessionData = {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  roles?: string[];
};

export function setSessionCookie(data: SessionData, maxAgeSeconds: number) {
  const authConfig = getAuthConfig();
  const value = signValue(JSON.stringify(data), authConfig.sessionSecret);
  cookies().set(authConfig.sessionCookieName, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie() {
  const authConfig = getAuthConfig();
  cookies().delete(authConfig.sessionCookieName);
}

export function readSession(): SessionData | null {
  const authConfig = getAuthConfig();
  const value = cookies().get(authConfig.sessionCookieName)?.value;
  if (!value) {
    return null;
  }

  const decoded = verifyValue(value, authConfig.sessionSecret);
  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as SessionData;
  } catch {
    return null;
  }
}
