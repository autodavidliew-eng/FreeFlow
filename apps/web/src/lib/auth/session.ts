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

export async function setSessionCookie(
  data: SessionData,
  maxAgeSeconds: number
) {
  const authConfig = getAuthConfig();
  const value = signValue(JSON.stringify(data), authConfig.sessionSecret);
  const cookieStore = await cookies();
  cookieStore.set(authConfig.sessionCookieName, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie() {
  const authConfig = getAuthConfig();
  const cookieStore = await cookies();
  cookieStore.delete(authConfig.sessionCookieName);
}

export async function readSession(): Promise<SessionData | null> {
  const authConfig = getAuthConfig();
  const cookieStore = await cookies();
  const value = cookieStore.get(authConfig.sessionCookieName)?.value;
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
