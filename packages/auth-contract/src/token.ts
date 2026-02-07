/**
 * Token Contract - TypeScript types and utilities for JWT token handling
 *
 * This module provides type-safe parsing and validation of Keycloak OIDC tokens.
 * Use these types and helpers consistently across frontend and backend.
 */

// ============================================================================
// Core Token Types
// ============================================================================

/**
 * Standard OIDC token payload claims
 */
export interface TokenPayload {
  /** Issuer - Keycloak realm URL */
  iss: string;

  /** Audience - client ID or array of client IDs */
  aud: string | string[];

  /** Subject - unique user identifier */
  sub: string;

  /** Expiration time (Unix timestamp in seconds) */
  exp: number;

  /** Issued at time (Unix timestamp in seconds) */
  iat: number;

  /** Not before time (Unix timestamp in seconds) */
  nbf?: number;

  /** JWT ID - unique token identifier */
  jti?: string;

  /** Token type (typically "Bearer") */
  typ?: string;

  /** Authorized party - client ID that requested the token */
  azp?: string;

  /** Session state identifier */
  session_state?: string;

  /** Scope - space-separated list of granted scopes */
  scope?: string;
}

/**
 * User profile claims from OIDC standard and Keycloak
 */
export interface UserClaims {
  /** User's email address */
  email: string;

  /** Whether email has been verified */
  email_verified?: boolean;

  /** User's full name */
  name?: string;

  /** User's preferred username/login */
  preferred_username?: string;

  /** User's first name */
  given_name?: string;

  /** User's last name */
  family_name?: string;

  /** URL to user's profile picture */
  picture?: string;

  /** User's preferred locale */
  locale?: string;

  /** Phone number */
  phone_number?: string;

  /** Whether phone number has been verified */
  phone_number_verified?: boolean;
}

/**
 * Realm-level role access
 */
export interface RealmAccess {
  /** Array of realm role names */
  roles: string[];
}

/**
 * Client-specific role access
 * Keys are client IDs, values are role arrays
 */
export interface ResourceAccess {
  [clientId: string]: {
    roles: string[];
  };
}

/**
 * Complete Keycloak token structure
 * Combines standard OIDC claims with Keycloak-specific extensions
 */
export interface KeycloakToken extends TokenPayload, UserClaims {
  /** Realm-level roles */
  realm_access?: RealmAccess;

  /** Client-specific roles */
  resource_access?: ResourceAccess;

  /** Optional: direct roles claim (if mapped) */
  roles?: string[];

  /** Additional custom claims */
  [key: string]: unknown;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================================================
// FreeFlow Application Constants
// ============================================================================

/**
 * FreeFlow application roles
 * These are the only roles used for authorization decisions
 */
export const FREEFLOW_ROLES = ['Admin', 'Operator', 'Viewer'] as const;

/**
 * Type for FreeFlow application roles
 */
export type FreeFlowRole = typeof FREEFLOW_ROLES[number];

/**
 * Keycloak internal roles that should be filtered out
 */
export const KEYCLOAK_INTERNAL_ROLES = [
  'uma_authorization',
  'uma_protection',
  'offline_access',
  'default-roles-freeflow',
] as const;

/**
 * Default clock skew tolerance in seconds
 */
export const DEFAULT_CLOCK_SKEW = 30;

/**
 * Recommended token refresh threshold (seconds before expiry)
 */
export const TOKEN_REFRESH_THRESHOLD = 300; // 5 minutes

// ============================================================================
// Role Extraction
// ============================================================================

/**
 * Extract all roles from a Keycloak token
 * Checks multiple locations: realm_access, resource_access, and direct roles claim
 *
 * @param token - Decoded Keycloak token
 * @param clientId - Optional client ID to extract client-specific roles
 * @returns Array of role names
 *
 * @example
 * const roles = extractRoles(token);
 * // Returns: ['Admin', 'Operator', 'uma_authorization', 'offline_access']
 */
export function extractRoles(token: KeycloakToken, clientId?: string): string[] {
  const roles = new Set<string>();

  // Check direct roles claim (if mapped)
  if (Array.isArray(token.roles)) {
    token.roles.forEach(role => roles.add(role));
  }

  // Check realm_access (primary location)
  if (token.realm_access?.roles) {
    token.realm_access.roles.forEach(role => roles.add(role));
  }

  // Check resource_access for specific client
  if (clientId && token.resource_access?.[clientId]?.roles) {
    token.resource_access[clientId].roles.forEach(role => roles.add(role));
  }

  // Check all resource_access clients if no specific client requested
  if (!clientId && token.resource_access) {
    Object.values(token.resource_access).forEach(access => {
      if (Array.isArray(access.roles)) {
        access.roles.forEach(role => roles.add(role));
      }
    });
  }

  return Array.from(roles);
}

/**
 * Extract only FreeFlow application roles, filtering out Keycloak internal roles
 *
 * @param token - Decoded Keycloak token
 * @returns Array of FreeFlow role names (Admin, Operator, Viewer)
 *
 * @example
 * const appRoles = getFreeFlowRoles(token);
 * // Returns: ['Admin', 'Operator']
 */
export function getFreeFlowRoles(token: KeycloakToken): FreeFlowRole[] {
  const allRoles = extractRoles(token);

  return allRoles.filter((role): role is FreeFlowRole =>
    FREEFLOW_ROLES.includes(role as FreeFlowRole)
  );
}

/**
 * Check if token has any of the required roles
 *
 * @param token - Decoded Keycloak token
 * @param requiredRoles - Array of roles to check (at least one must match)
 * @returns True if user has at least one required role
 *
 * @example
 * if (hasRequiredRole(token, ['Admin', 'Operator'])) {
 *   // User is Admin or Operator
 * }
 */
export function hasRequiredRole(token: KeycloakToken, requiredRoles: string[]): boolean {
  const userRoles = extractRoles(token);
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Check if token has all specified roles
 *
 * @param token - Decoded Keycloak token
 * @param requiredRoles - Array of roles (all must match)
 * @returns True if user has all required roles
 *
 * @example
 * if (hasAllRoles(token, ['Admin', 'Operator'])) {
 *   // User is both Admin AND Operator
 * }
 */
export function hasAllRoles(token: KeycloakToken, requiredRoles: string[]): boolean {
  const userRoles = extractRoles(token);
  return requiredRoles.every(role => userRoles.includes(role));
}

/**
 * Check if token has a specific FreeFlow role
 *
 * @param token - Decoded Keycloak token
 * @param role - FreeFlow role to check
 * @returns True if user has the role
 *
 * @example
 * if (hasRole(token, 'Admin')) {
 *   // User is Admin
 * }
 */
export function hasRole(token: KeycloakToken, role: FreeFlowRole): boolean {
  return hasRequiredRole(token, [role]);
}

// ============================================================================
// Token Validation
// ============================================================================

/**
 * Check if token is expired
 *
 * @param token - Decoded token
 * @param clockSkew - Clock skew tolerance in seconds (default: 30)
 * @returns True if token is expired
 *
 * @example
 * if (isTokenExpired(token)) {
 *   // Token expired, need to refresh
 * }
 */
export function isTokenExpired(token: TokenPayload, clockSkew = DEFAULT_CLOCK_SKEW): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= (token.exp + clockSkew);
}

/**
 * Check if token should be refreshed soon
 *
 * @param token - Decoded token
 * @param threshold - Seconds before expiry to trigger refresh (default: 300)
 * @returns True if token should be refreshed proactively
 *
 * @example
 * if (shouldRefreshToken(token)) {
 *   // Token expires in less than 5 minutes, refresh it
 * }
 */
export function shouldRefreshToken(
  token: TokenPayload,
  threshold = TOKEN_REFRESH_THRESHOLD
): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= (token.exp - threshold);
}

/**
 * Check if token is not yet valid (nbf check)
 *
 * @param token - Decoded token
 * @param clockSkew - Clock skew tolerance in seconds (default: 30)
 * @returns True if token is not yet valid
 */
export function isTokenNotYetValid(token: TokenPayload, clockSkew = DEFAULT_CLOCK_SKEW): boolean {
  if (!token.nbf) return false;

  const now = Math.floor(Date.now() / 1000);
  return now < (token.nbf - clockSkew);
}

/**
 * Validate token structure and required claims
 *
 * @param token - Decoded token
 * @returns Validation result with errors
 *
 * @example
 * const result = validateTokenStructure(token);
 * if (!result.valid) {
 *   console.error('Token validation failed:', result.errors);
 * }
 */
export function validateTokenStructure(token: unknown): TokenValidationResult {
  const errors: string[] = [];

  if (!token || typeof token !== 'object') {
    return { valid: false, errors: ['Token is not an object'] };
  }

  const t = token as Partial<KeycloakToken>;

  // Check required claims
  if (!t.iss || typeof t.iss !== 'string') {
    errors.push('Missing or invalid "iss" (issuer) claim');
  }

  if (!t.aud || (typeof t.aud !== 'string' && !Array.isArray(t.aud))) {
    errors.push('Missing or invalid "aud" (audience) claim');
  }

  if (!t.sub || typeof t.sub !== 'string') {
    errors.push('Missing or invalid "sub" (subject) claim');
  }

  if (!t.email || typeof t.email !== 'string') {
    errors.push('Missing or invalid "email" claim');
  }

  if (!t.exp || typeof t.exp !== 'number') {
    errors.push('Missing or invalid "exp" (expiration) claim');
  }

  if (!t.iat || typeof t.iat !== 'number') {
    errors.push('Missing or invalid "iat" (issued at) claim');
  }

  // Check expiration
  if (t.exp && typeof t.exp === 'number' && isTokenExpired(t as TokenPayload)) {
    errors.push('Token is expired');
  }

  // Check not before
  if (t.nbf && typeof t.nbf === 'number' && isTokenNotYetValid(t as TokenPayload)) {
    errors.push('Token is not yet valid (nbf check failed)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate issuer matches expected value
 *
 * @param token - Decoded token
 * @param expectedIssuer - Expected issuer URL
 * @returns True if issuer matches
 *
 * @example
 * if (!validateIssuer(token, 'https://auth.freeflow.com/realms/freeflow')) {
 *   throw new Error('Invalid token issuer');
 * }
 */
export function validateIssuer(token: TokenPayload, expectedIssuer: string): boolean {
  return token.iss === expectedIssuer;
}

/**
 * Validate audience contains expected value
 *
 * @param token - Decoded token
 * @param expectedAudience - Expected audience (client ID) or array of accepted values
 * @returns True if audience is valid
 *
 * @example
 * if (!validateAudience(token, 'freeflow-web')) {
 *   throw new Error('Invalid token audience');
 * }
 */
export function validateAudience(
  token: TokenPayload,
  expectedAudience: string | string[]
): boolean {
  const audiences = Array.isArray(token.aud) ? token.aud : [token.aud];
  const expected = Array.isArray(expectedAudience) ? expectedAudience : [expectedAudience];

  return expected.some(aud => audiences.includes(aud));
}

// ============================================================================
// User Information Extraction
// ============================================================================

/**
 * Get user display name from token
 * Falls back through name, preferred_username, email
 *
 * @param token - Decoded Keycloak token
 * @returns User's display name
 *
 * @example
 * const displayName = getUserDisplayName(token);
 * // Returns: "John Doe" or "john.doe" or "john.doe@example.com"
 */
export function getUserDisplayName(token: KeycloakToken): string {
  return token.name
    || token.preferred_username
    || token.email
    || 'Unknown User';
}

/**
 * Get user identifier from token
 * Uses sub claim as the stable user identifier
 *
 * @param token - Decoded Keycloak token
 * @returns User ID (sub claim)
 *
 * @example
 * const userId = getUserId(token);
 * // Returns: "f:550e8400-e29b-41d4-a716-446655440000:john.doe"
 */
export function getUserId(token: KeycloakToken): string {
  return token.sub;
}

/**
 * Extract Keycloak user UUID from sub claim
 * Keycloak sub format: "f:<uuid>:<username>"
 *
 * @param token - Decoded Keycloak token
 * @returns Keycloak user UUID or null if format is unexpected
 *
 * @example
 * const uuid = getKeycloakUserId(token);
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 */
export function getKeycloakUserId(token: KeycloakToken): string | null {
  const parts = token.sub.split(':');
  if (parts.length >= 2 && parts[0] === 'f') {
    return parts[1];
  }
  return null;
}

/**
 * Get user email from token
 *
 * @param token - Decoded Keycloak token
 * @returns User email
 */
export function getUserEmail(token: KeycloakToken): string {
  return token.email;
}

/**
 * Check if user's email is verified
 *
 * @param token - Decoded Keycloak token
 * @returns True if email is verified
 */
export function isEmailVerified(token: KeycloakToken): boolean {
  return token.email_verified === true;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if value is a valid TokenPayload
 *
 * @param value - Value to check
 * @returns True if value is TokenPayload
 */
export function isTokenPayload(value: unknown): value is TokenPayload {
  if (!value || typeof value !== 'object') return false;

  const t = value as Partial<TokenPayload>;
  return (
    typeof t.iss === 'string' &&
    (typeof t.aud === 'string' || Array.isArray(t.aud)) &&
    typeof t.sub === 'string' &&
    typeof t.exp === 'number' &&
    typeof t.iat === 'number'
  );
}

/**
 * Type guard to check if value is a valid KeycloakToken
 *
 * @param value - Value to check
 * @returns True if value is KeycloakToken
 */
export function isKeycloakToken(value: unknown): value is KeycloakToken {
  if (!isTokenPayload(value)) return false;

  const t = value as Partial<KeycloakToken>;
  return typeof t.email === 'string';
}

/**
 * Type guard to check if role is a FreeFlow application role
 *
 * @param role - Role name to check
 * @returns True if role is a FreeFlow role
 */
export function isFreeFlowRole(role: string): role is FreeFlowRole {
  return FREEFLOW_ROLES.includes(role as FreeFlowRole);
}

// ============================================================================
// Testing Utilities
// ============================================================================

/**
 * Create a mock token for testing
 *
 * @param overrides - Partial token data to override defaults
 * @returns Mock Keycloak token
 *
 * @example
 * const mockToken = createMockToken({
 *   sub: 'test-user-123',
 *   email: 'test@example.com',
 *   realm_access: { roles: ['Admin'] }
 * });
 */
export function createMockToken(overrides: Partial<KeycloakToken> = {}): KeycloakToken {
  const now = Math.floor(Date.now() / 1000);

  return {
    iss: 'https://auth.freeflow.com/realms/freeflow',
    aud: 'freeflow-web',
    sub: 'f:550e8400-e29b-41d4-a716-446655440000:testuser',
    exp: now + 300, // 5 minutes from now
    iat: now,
    email: 'test@example.com',
    email_verified: true,
    preferred_username: 'testuser',
    name: 'Test User',
    given_name: 'Test',
    family_name: 'User',
    realm_access: {
      roles: ['Viewer'],
    },
    ...overrides,
  };
}

/**
 * Create an expired mock token for testing
 *
 * @param overrides - Partial token data to override defaults
 * @returns Expired mock Keycloak token
 */
export function createExpiredMockToken(overrides: Partial<KeycloakToken> = {}): KeycloakToken {
  const now = Math.floor(Date.now() / 1000);

  return createMockToken({
    exp: now - 3600, // 1 hour ago
    iat: now - 7200, // 2 hours ago
    ...overrides,
  });
}
