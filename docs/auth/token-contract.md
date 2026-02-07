# Token Contract

This document defines the structure and validation requirements for JWT tokens used throughout the FreeFlow application. Both frontend and backend must adhere to this contract for consistent authentication and authorization.

## Overview

FreeFlow uses OpenID Connect (OIDC) tokens issued by Keycloak. Tokens contain user identity, roles, and metadata required for authentication and authorization decisions.

## Token Types

### Access Token
- Used for API authorization
- Short-lived (5 minutes default)
- Contains user identity and roles
- Must be validated on every API request

### ID Token
- Used for user identity
- Contains user profile information
- Validated once during authentication
- May contain custom claims

### Refresh Token
- Used to obtain new access tokens
- Long-lived (30 days default)
- Opaque or JWT format
- Must be stored securely (httpOnly cookie)

## Required Standard Claims

All tokens issued by Keycloak must contain the following standard OIDC claims:

### `iss` (Issuer)
- **Type**: `string`
- **Description**: The issuer of the token (Keycloak URL)
- **Example**: `"https://auth.freeflow.com/realms/freeflow"`
- **Validation**: Must match expected Keycloak issuer URL exactly
- **Security**: Prevents token substitution attacks

### `aud` (Audience)
- **Type**: `string | string[]`
- **Description**: Intended audience for the token (client ID)
- **Example**: `"freeflow-web"` or `["freeflow-web", "freeflow-api"]`
- **Validation**: Must contain the expected client ID
- **Security**: Prevents token replay to unintended services

### `sub` (Subject)
- **Type**: `string`
- **Description**: Unique identifier for the user
- **Example**: `"f:a1b2c3d4-e5f6-4321-9876-fedcba987654:john.doe"`
- **Format**: `f:<keycloak-user-id>:<username>` (Keycloak format)
- **Note**: Stable across sessions, use as primary user identifier

### `email`
- **Type**: `string`
- **Description**: User's email address
- **Example**: `"john.doe@freeflow.com"`
- **Validation**: Should be present and valid email format
- **Note**: May change if user updates their email

### `email_verified`
- **Type**: `boolean`
- **Description**: Whether the email has been verified
- **Example**: `true`
- **Security**: Check this before allowing sensitive operations

### `exp` (Expiration)
- **Type**: `number`
- **Description**: Unix timestamp when token expires
- **Example**: `1704168000`
- **Validation**: Must be in the future (with clock skew tolerance)
- **Security**: Prevents use of expired tokens

### `iat` (Issued At)
- **Type**: `number`
- **Description**: Unix timestamp when token was issued
- **Example**: `1704167700`
- **Validation**: Should be in the past

### `nbf` (Not Before)
- **Type**: `number`
- **Description**: Token not valid before this timestamp
- **Example**: `1704167700`
- **Validation**: Current time must be after nbf

## Keycloak-Specific Claims

### `preferred_username`
- **Type**: `string`
- **Description**: User's display username
- **Example**: `"john.doe"`
- **Usage**: Display in UI, not for authorization

### `name`
- **Type**: `string`
- **Description**: User's full name
- **Example**: `"John Doe"`

### `given_name`
- **Type**: `string`
- **Description**: User's first name
- **Example**: `"John"`

### `family_name`
- **Type**: `string`
- **Description**: User's last name
- **Example**: `"Doe"`

### `picture`
- **Type**: `string` (optional)
- **Description**: URL to user's profile picture
- **Example**: `"https://lh3.googleusercontent.com/a/..."`

### `azp` (Authorized Party)
- **Type**: `string`
- **Description**: Client ID that requested the token
- **Example**: `"freeflow-web"`

### `session_state`
- **Type**: `string`
- **Description**: Keycloak session identifier
- **Example**: `"a1b2c3d4-e5f6-4321-9876-fedcba987654"`

### `scope`
- **Type**: `string`
- **Description**: Space-separated list of granted scopes
- **Example**: `"openid profile email"`

## Roles in Keycloak Tokens

Keycloak can place roles in multiple locations within the token. The FreeFlow application uses **realm roles** as the primary authorization mechanism.

### Realm Roles Location

```json
{
  "realm_access": {
    "roles": ["Admin", "Operator", "Viewer", "uma_authorization"]
  }
}
```

- **Path**: `realm_access.roles`
- **Type**: `string[]`
- **Description**: Array of realm-level role names
- **FreeFlow Roles**: `Admin`, `Operator`, `Viewer`
- **Keycloak Default Roles**: `uma_authorization`, `offline_access` (ignore these)

### Client Roles Location (Not Used in FreeFlow)

```json
{
  "resource_access": {
    "freeflow-web": {
      "roles": ["user"]
    },
    "freeflow-api": {
      "roles": ["api-user"]
    }
  }
}
```

- **Path**: `resource_access.<client-id>.roles`
- **Note**: FreeFlow does not use client-specific roles
- **Note**: Helper functions will check this location as fallback

### Roles Claim Mapping (Optional)

Keycloak can be configured to map roles to a top-level `roles` claim:

```json
{
  "roles": ["Admin", "Operator"]
}
```

- **Configuration**: Requires custom client scope mapper
- **Benefit**: Simpler token structure
- **Status**: Not currently configured in FreeFlow

## Token Structure Example

### Complete Access Token (Decoded)

```json
{
  "exp": 1704168000,
  "iat": 1704167700,
  "jti": "a1b2c3d4-e5f6-4321-9876-fedcba987654",
  "iss": "https://auth.freeflow.com/realms/freeflow",
  "aud": "freeflow-web",
  "sub": "f:550e8400-e29b-41d4-a716-446655440000:john.doe",
  "typ": "Bearer",
  "azp": "freeflow-web",
  "session_state": "b2c3d4e5-f6a7-5432-8765-edcba9876543",
  "scope": "openid profile email",
  "email_verified": true,
  "name": "John Doe",
  "preferred_username": "john.doe",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john.doe@freeflow.com",
  "picture": "https://lh3.googleusercontent.com/a/...",
  "realm_access": {
    "roles": ["Admin", "uma_authorization", "offline_access"]
  },
  "resource_access": {
    "freeflow-web": {
      "roles": ["uma_protection"]
    },
    "account": {
      "roles": ["manage-account", "view-profile"]
    }
  }
}
```

## Frontend Token Extraction

### Safe Role Extraction

The frontend must extract roles safely, handling missing or malformed claims:

```typescript
import { extractRoles, getFreeFlowRoles } from '@freeflow/auth-contract';

// Get all roles (includes Keycloak internal roles)
const allRoles = extractRoles(token);

// Get only FreeFlow application roles (Admin, Operator, Viewer)
const appRoles = getFreeFlowRoles(token);
```

### Token Validation

Frontend should perform basic validation before using token data:

```typescript
import { isTokenExpired, validateTokenStructure } from '@freeflow/auth-contract';

// Check if token is expired (with 30s clock skew tolerance)
if (isTokenExpired(token)) {
  // Refresh token or redirect to login
}

// Validate required claims are present
const validation = validateTokenStructure(token);
if (!validation.valid) {
  console.error('Invalid token:', validation.errors);
}
```

### Security Considerations for Frontend

1. **Never validate signature** - Frontend cannot securely validate JWT signatures
2. **Always refresh on expiry** - Use refresh token to get new access token
3. **Use httpOnly cookies** - Store refresh tokens in httpOnly cookies, not localStorage
4. **Validate structure only** - Check claims exist and have expected types
5. **Don't trust blindly** - Backend must re-validate all claims

## Backend Token Validation

The backend must perform full cryptographic validation before trusting any token claims.

### Validation Steps

1. **Extract token** from Authorization header
2. **Decode without verification** to get header
3. **Fetch JWKS** from Keycloak
4. **Verify signature** using public key from JWKS
5. **Validate issuer** matches expected Keycloak URL
6. **Validate audience** contains expected client ID or API identifier
7. **Validate expiration** (exp) and not-before (nbf)
8. **Extract and validate roles**

### Issuer Validation

```typescript
const EXPECTED_ISSUER = process.env.KEYCLOAK_ISSUER;
// e.g., "https://auth.freeflow.com/realms/freeflow"

if (token.iss !== EXPECTED_ISSUER) {
  throw new UnauthorizedException('Invalid token issuer');
}
```

### Audience Validation

```typescript
const EXPECTED_AUDIENCE = ['freeflow-api', 'freeflow-web'];

const audiences = Array.isArray(token.aud) ? token.aud : [token.aud];
const hasValidAudience = EXPECTED_AUDIENCE.some(aud => audiences.includes(aud));

if (!hasValidAudience) {
  throw new UnauthorizedException('Invalid token audience');
}
```

### JWKS Validation

```typescript
import * as jose from 'jose';

const JWKS_URI = `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`;
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));

// Verify and decode token
const { payload } = await jose.jwtVerify(accessToken, JWKS, {
  issuer: EXPECTED_ISSUER,
  audience: EXPECTED_AUDIENCE,
});
```

### Role Extraction in Backend

```typescript
import { extractRoles, hasRequiredRole } from '@freeflow/auth-contract';

// Extract roles after validation
const userRoles = extractRoles(validatedToken);

// Check authorization
if (!hasRequiredRole(userRoles, ['Admin', 'Operator'])) {
  throw new ForbiddenException('Insufficient permissions');
}
```

## Token Refresh Flow

### When to Refresh

- **Access token expired**: Check `exp` claim
- **5 minutes before expiry**: Proactive refresh recommended
- **401 Unauthorized**: Server rejected token, attempt refresh once

### Refresh Process

1. Client sends refresh token to Keycloak token endpoint
2. Keycloak validates refresh token
3. Keycloak issues new access token and ID token
4. Keycloak rotates refresh token (optional, based on config)
5. Client stores new tokens

### Refresh Token Endpoint

```
POST /realms/freeflow/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=freeflow-web
&refresh_token=<REFRESH_TOKEN>
```

## Clock Skew Tolerance

Token validation should allow for clock skew between systems:

- **Default tolerance**: 30 seconds
- **Expiration check**: `currentTime < (exp + 30s)`
- **Not-before check**: `currentTime > (nbf - 30s)`

## Error Handling

### Token Validation Errors

| Error | HTTP Status | Description | Action |
|-------|-------------|-------------|--------|
| Token expired | 401 | `exp` in the past | Refresh token |
| Invalid signature | 401 | Signature verification failed | Re-authenticate |
| Invalid issuer | 401 | `iss` doesn't match | Re-authenticate |
| Invalid audience | 401 | `aud` doesn't match | Re-authenticate |
| Missing claims | 401 | Required claim missing | Re-authenticate |
| Insufficient permissions | 403 | User lacks required role | Show access denied |

## Type Safety

All token parsing and validation should use the shared TypeScript types from `@freeflow/auth-contract`:

```typescript
import type {
  KeycloakToken,
  TokenPayload,
  RealmAccess,
  ResourceAccess,
} from '@freeflow/auth-contract';
```

This ensures consistent type checking across frontend and backend.

## Best Practices

### Frontend
1. Store access token in memory only (not localStorage)
2. Store refresh token in httpOnly cookie
3. Refresh tokens proactively before expiry
4. Clear tokens on logout
5. Use TypeScript types for type safety
6. Handle token expiration gracefully

### Backend
1. Always validate signature using JWKS
2. Always validate issuer and audience
3. Check expiration with clock skew tolerance
4. Extract roles using shared helper functions
5. Log validation failures for security monitoring
6. Cache JWKS responses (with TTL)
7. Use TypeScript types for type safety

### Security
1. Never log tokens or refresh tokens
2. Use HTTPS for all token transmission
3. Implement rate limiting on token endpoints
4. Monitor for unusual token usage patterns
5. Rotate signing keys regularly in Keycloak
6. Set appropriate token expiration times

## Testing

### Token Mocking

For testing, use the provided token builder:

```typescript
import { createMockToken } from '@freeflow/auth-contract/testing';

const mockToken = createMockToken({
  sub: 'test-user-123',
  email: 'test@example.com',
  roles: ['Admin'],
});
```

### Validation Testing

```typescript
import { validateToken } from '@freeflow/auth-contract';

describe('Token Validation', () => {
  it('should reject expired tokens', () => {
    const expiredToken = createMockToken({ exp: Date.now() / 1000 - 3600 });
    expect(isTokenExpired(expiredToken)).toBe(true);
  });
});
```

## Migration Notes

### From NextAuth Session to JWT

When migrating from NextAuth session to direct JWT usage:

1. Update session callback to include roles
2. Extract token from NextAuth session object
3. Use shared types for consistency
4. Validate token structure in API routes
5. Update middleware to extract roles correctly

## References

- [JWT Specification (RFC 7519)](https://tools.ietf.org/html/rfc7519)
- [OpenID Connect Core Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [Keycloak Token Claims](https://www.keycloak.org/docs/latest/server_admin/#_token-exchange)
- [jose Library (JWT validation)](https://github.com/panva/jose)

## Change Log

- **2024-01-02**: Initial token contract definition
- **2024-01-02**: Added realm_access.roles as primary role location
- **2024-01-02**: Defined required standard claims (iss, aud, sub, email, exp)
