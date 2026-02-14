import {
  DEFAULT_CLOCK_SKEW,
  extractRoles,
  getFreeFlowRoles,
  type FreeFlowRole,
  type KeycloakToken,
} from '@freeflow/auth-contract';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

export type AuthConfig = {
  issuer: string;
  audience: string[];
  jwksUri: string;
  clientId?: string;
  clockTolerance?: number;
};

export type TokenVerificationResult = {
  payload: KeycloakToken;
  roles: string[];
  freeflowRoles: FreeFlowRole[];
};

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function normalizeIssuer(issuer: string) {
  return issuer.endsWith('/') ? issuer.slice(0, -1) : issuer;
}

function parseAudience(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function loadAuthConfigFromEnv(): AuthConfig {
  const issuer = process.env.KEYCLOAK_ISSUER;
  if (!issuer) {
    throw new Error('Missing KEYCLOAK_ISSUER');
  }

  const audience = parseAudience(
    process.env.KEYCLOAK_AUDIENCE ??
      process.env.KEYCLOAK_ID ??
      process.env.KEYCLOAK_CLIENT_ID,
  );

  if (audience.length === 0) {
    throw new Error('Missing KEYCLOAK_AUDIENCE or KEYCLOAK_ID');
  }

  const normalizedIssuer = normalizeIssuer(issuer);
  const jwksUri =
    process.env.KEYCLOAK_JWKS_URI ??
    `${normalizedIssuer}/protocol/openid-connect/certs`;

  return {
    issuer: normalizedIssuer,
    audience,
    jwksUri,
    clientId: process.env.KEYCLOAK_ID ?? process.env.KEYCLOAK_CLIENT_ID,
    clockTolerance: Number(process.env.KEYCLOAK_CLOCK_TOLERANCE ?? '') ||
      DEFAULT_CLOCK_SKEW,
  };
}

export function getRemoteJwks(jwksUri: string) {
  const cached = jwksCache.get(jwksUri);
  if (cached) {
    return cached;
  }

  const jwks = createRemoteJWKSet(new URL(jwksUri), {
    timeoutDuration: 5000,
    cooldownDuration: 30_000,
    cacheMaxAge: 10 * 60 * 1000,
  });

  jwksCache.set(jwksUri, jwks);
  return jwks;
}

export async function verifyAccessToken(
  token: string,
  config: AuthConfig = loadAuthConfigFromEnv(),
): Promise<TokenVerificationResult> {
  const jwks = getRemoteJwks(config.jwksUri);

  const { payload } = await jwtVerify(token, jwks, {
    issuer: config.issuer,
    audience: config.audience,
    clockTolerance: config.clockTolerance,
  });

  const typedPayload = payload as JWTPayload as KeycloakToken;
  const roles = extractRoles(typedPayload, config.clientId ?? config.audience[0]);
  const freeflowRoles = getFreeFlowRoles(typedPayload);

  return {
    payload: typedPayload,
    roles,
    freeflowRoles,
  };
}
