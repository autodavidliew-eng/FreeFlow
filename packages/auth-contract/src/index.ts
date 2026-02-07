/**
 * @freeflow/auth-contract
 *
 * Shared authentication contract for FreeFlow application
 * Provides TypeScript types and utilities for JWT token handling
 */

// Export all types
export type {
  TokenPayload,
  UserClaims,
  RealmAccess,
  ResourceAccess,
  KeycloakToken,
  TokenValidationResult,
  FreeFlowRole,
} from './token';

// Export constants
export {
  FREEFLOW_ROLES,
  KEYCLOAK_INTERNAL_ROLES,
  DEFAULT_CLOCK_SKEW,
  TOKEN_REFRESH_THRESHOLD,
} from './token';

// Export role extraction functions
export {
  extractRoles,
  getFreeFlowRoles,
  hasRequiredRole,
  hasAllRoles,
  hasRole,
} from './token';

// Export validation functions
export {
  isTokenExpired,
  shouldRefreshToken,
  isTokenNotYetValid,
  validateTokenStructure,
  validateIssuer,
  validateAudience,
} from './token';

// Export user information functions
export {
  getUserDisplayName,
  getUserId,
  getKeycloakUserId,
  getUserEmail,
  isEmailVerified,
} from './token';

// Export type guards
export {
  isTokenPayload,
  isKeycloakToken,
  isFreeFlowRole,
} from './token';

// Export testing utilities
export {
  createMockToken,
  createExpiredMockToken,
} from './token';
