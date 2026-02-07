# @freeflow/auth-contract

Shared authentication contract for the FreeFlow application. Provides TypeScript types and utilities for consistent JWT token handling across frontend and backend.

## Installation

```bash
pnpm add @freeflow/auth-contract
```

## Usage

### Extract Roles

```typescript
import { extractRoles, getFreeFlowRoles, hasRole } from '@freeflow/auth-contract';

// Get all roles from token
const allRoles = extractRoles(token);
// Returns: ['Admin', 'Operator', 'uma_authorization', 'offline_access']

// Get only FreeFlow application roles
const appRoles = getFreeFlowRoles(token);
// Returns: ['Admin', 'Operator']

// Check specific role
if (hasRole(token, 'Admin')) {
  console.log('User is an Admin');
}
```

### Validate Tokens

```typescript
import {
  isTokenExpired,
  shouldRefreshToken,
  validateTokenStructure,
  validateIssuer,
  validateAudience,
} from '@freeflow/auth-contract';

// Check if token is expired
if (isTokenExpired(token)) {
  // Refresh token or redirect to login
}

// Check if token should be refreshed proactively (5 min before expiry)
if (shouldRefreshToken(token)) {
  // Refresh token now
}

// Validate token structure
const validation = validateTokenStructure(token);
if (!validation.valid) {
  console.error('Invalid token:', validation.errors);
}

// Validate issuer (backend only)
if (!validateIssuer(token, process.env.KEYCLOAK_ISSUER!)) {
  throw new Error('Invalid token issuer');
}

// Validate audience (backend only)
if (!validateAudience(token, 'freeflow-api')) {
  throw new Error('Invalid token audience');
}
```

### Extract User Information

```typescript
import {
  getUserDisplayName,
  getUserId,
  getUserEmail,
  isEmailVerified,
} from '@freeflow/auth-contract';

const displayName = getUserDisplayName(token);
// Returns: "John Doe" or "john.doe" or "john.doe@example.com"

const userId = getUserId(token);
// Returns: "f:550e8400-e29b-41d4-a716-446655440000:john.doe"

const email = getUserEmail(token);
// Returns: "john.doe@example.com"

if (isEmailVerified(token)) {
  // Email is verified
}
```

### Type Guards

```typescript
import { isKeycloakToken, isFreeFlowRole } from '@freeflow/auth-contract';

if (isKeycloakToken(decodedToken)) {
  // TypeScript knows this is a KeycloakToken
  console.log(decodedToken.email);
}

if (isFreeFlowRole(roleName)) {
  // TypeScript knows this is 'Admin' | 'Operator' | 'Viewer'
}
```

### Testing

```typescript
import { createMockToken, createExpiredMockToken } from '@freeflow/auth-contract';

// Create mock token for tests
const mockToken = createMockToken({
  sub: 'test-user-123',
  email: 'test@example.com',
  realm_access: { roles: ['Admin'] },
});

// Create expired token for testing expiration handling
const expiredToken = createExpiredMockToken();
```

## TypeScript Types

```typescript
import type {
  KeycloakToken,
  TokenPayload,
  UserClaims,
  RealmAccess,
  ResourceAccess,
  FreeFlowRole,
} from '@freeflow/auth-contract';
```

## Constants

```typescript
import {
  FREEFLOW_ROLES,
  KEYCLOAK_INTERNAL_ROLES,
  DEFAULT_CLOCK_SKEW,
  TOKEN_REFRESH_THRESHOLD,
} from '@freeflow/auth-contract';

// FREEFLOW_ROLES = ['Admin', 'Operator', 'Viewer']
// KEYCLOAK_INTERNAL_ROLES = ['uma_authorization', 'uma_protection', 'offline_access', 'default-roles-freeflow']
// DEFAULT_CLOCK_SKEW = 30 (seconds)
// TOKEN_REFRESH_THRESHOLD = 300 (seconds / 5 minutes)
```

## Documentation

See [Token Contract Documentation](../../docs/auth/token-contract.md) for complete details on:
- Token structure and claims
- Validation requirements
- Frontend and backend implementation
- Security best practices

## License

MIT
