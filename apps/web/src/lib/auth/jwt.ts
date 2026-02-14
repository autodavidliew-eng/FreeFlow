import { base64UrlDecode } from './encoding';

export type JwtPayload = {
  [key: string]: unknown;
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = base64UrlDecode(parts[1]).toString('utf-8');
    return JSON.parse(payload) as JwtPayload;
  } catch {
    return null;
  }
}

export function extractRoles(payload: JwtPayload | null): string[] {
  if (!payload) {
    return [];
  }

  const realmAccess = payload['realm_access'];
  if (
    realmAccess &&
    typeof realmAccess === 'object' &&
    Array.isArray((realmAccess as { roles?: unknown }).roles)
  ) {
    return (realmAccess as { roles: string[] }).roles;
  }

  return [];
}
