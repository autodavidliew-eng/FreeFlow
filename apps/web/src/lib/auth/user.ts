import { decodeJwtPayload, extractRoles, type JwtPayload } from './jwt';
import { readSession } from './session';

export type CurrentUser = {
  subject?: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
  roles: string[];
  expiresAt?: number;
};

const emptyRoles: string[] = [];

function getClaim(payload: JwtPayload | null, key: string): string | undefined {
  const value = payload?.[key];
  return typeof value === 'string' ? value : undefined;
}

function buildProfile(payload: JwtPayload | null) {
  return {
    subject: getClaim(payload, 'sub'),
    email: getClaim(payload, 'email'),
    name: getClaim(payload, 'name') ?? getClaim(payload, 'given_name'),
    preferredUsername: getClaim(payload, 'preferred_username'),
  };
}

function mergeRoles(...roleBuckets: Array<string[] | undefined>) {
  const roles = new Set<string>();
  for (const bucket of roleBuckets) {
    if (!bucket) {
      continue;
    }
    for (const role of bucket) {
      roles.add(role);
    }
  }
  return Array.from(roles);
}

export async function getUserRoles(): Promise<string[]> {
  const session = await readSession();
  if (!session) {
    return emptyRoles;
  }

  if (session.roles && session.roles.length > 0) {
    return session.roles;
  }

  const payload = decodeJwtPayload(session.accessToken);
  return extractRoles(payload);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await readSession();
  if (!session) {
    return null;
  }

  const accessPayload = decodeJwtPayload(session.accessToken);
  const idPayload = session.idToken ? decodeJwtPayload(session.idToken) : null;

  const roles = mergeRoles(session.roles, extractRoles(accessPayload));

  return {
    ...buildProfile(idPayload ?? accessPayload),
    roles,
    expiresAt: session.expiresAt,
  };
}
