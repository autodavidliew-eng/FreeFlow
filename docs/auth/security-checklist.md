# FreeFlow Authentication Security Checklist

A concise, actionable security checklist for implementing and auditing authentication in the FreeFlow application.

## ✅ PKCE & Public Client Configuration

### Keycloak Client Configuration
- [ ] Client is marked as **Public Client** (no client secret required)
- [ ] **PKCE is REQUIRED** with S256 code challenge method
- [ ] Client does NOT have a client secret configured
- [ ] Access Type is set to `public` (not `confidential`)

### Frontend Implementation
- [ ] **CRITICAL: No client secret in browser code, environment variables, or build artifacts**
- [ ] PKCE code verifier is generated with cryptographically secure random (min 43 chars)
- [ ] Code verifier uses allowed characters: `[A-Z][a-z][0-9]-._~`
- [ ] Code challenge is computed as `base64url(sha256(code_verifier))`
- [ ] Authorization request includes `code_challenge` and `code_challenge_method=S256`
- [ ] Token exchange includes original `code_verifier`

### Validation
```bash
# Verify no client secret in codebase
grep -r "clientSecret" apps/web/ --exclude-dir=node_modules
# Should return NO results (except comments/docs)

# Verify PKCE in Keycloak realm export
grep -A3 "pkce.code.challenge.method" infra/keycloak/freeflow-realm.json
# Should show: "pkce.code.challenge.method": "S256"
```

---

## ✅ Token Storage

### Access Tokens (Short-lived, 5 minutes)
- [ ] **NEVER store in localStorage or sessionStorage**
- [ ] Store in memory only (React state, module variable)
- [ ] Clear from memory on logout or window close
- [ ] Pass to API via `Authorization: Bearer <token>` header only

### Refresh Tokens (Long-lived, 30 days)
- [ ] **MUST store in httpOnly cookie** (server-side set)
- [ ] Cookie attributes: `httpOnly`, `Secure`, `SameSite=Strict` or `Lax`
- [ ] Never accessible via JavaScript (`document.cookie` won't show it)
- [ ] Rotate on each refresh (if Keycloak rotation enabled)
- [ ] Clear on explicit logout

### ID Tokens
- [ ] Can be stored in memory or sessionStorage (for display purposes only)
- [ ] Never used for API authorization (use access token)
- [ ] Contains user profile info, safe to expose to JavaScript

### What NOT to Do
```typescript
// ❌ NEVER DO THIS
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);

// ✅ CORRECT
// Access token in memory
const [accessToken, setAccessToken] = useState<string | null>(null);

// Refresh token in httpOnly cookie (set by backend)
// Not accessible to JavaScript - this is correct!
```

---

## ✅ CORS Configuration

### Backend API (NestJS)
- [ ] Configure CORS to allow only specific origins (no wildcards in production)
- [ ] Development: `http://localhost:3000`
- [ ] Staging: `https://staging.freeflow.com`
- [ ] Production: `https://freeflow.com`
- [ ] Enable credentials: `credentials: true` (required for httpOnly cookies)
- [ ] Limit allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- [ ] Limit allowed headers: `Content-Type, Authorization, X-Request-ID`
- [ ] Set `Access-Control-Max-Age` for preflight caching

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 3600, // 1 hour preflight cache
});
```

### Keycloak
- [ ] Valid Redirect URIs configured for each environment (exact match, no wildcards)
- [ ] Web Origins configured for CORS (can use wildcards for dev: `http://localhost:*`)
- [ ] Post Logout Redirect URIs configured

---

## ✅ Content Security Policy (CSP)

### Next.js Frontend Configuration
- [ ] CSP header configured via `next.config.js` or middleware
- [ ] `default-src 'self'` - Only load resources from same origin by default
- [ ] `script-src 'self'` - Only execute scripts from same origin (adjust for Next.js if needed)
- [ ] `style-src 'self' 'unsafe-inline'` - Allow inline styles (required for many frameworks)
- [ ] `img-src 'self' https: data:` - Allow images from HTTPS and data URIs
- [ ] `connect-src 'self' <KEYCLOAK_URL> <API_URL>` - Only connect to trusted APIs
- [ ] `frame-ancestors 'none'` - Prevent clickjacking (or specific domains if embedding needed)
- [ ] `base-uri 'self'` - Prevent base tag hijacking
- [ ] `form-action 'self'` - Only submit forms to same origin

```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  font-src 'self';
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL} ${process.env.NEXT_PUBLIC_KEYCLOAK_URL};
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader.replace(/\s{2,}/g, ' ').trim() },
        ],
      },
    ];
  },
};
```

### Additional Security Headers
- [ ] `X-Frame-Options: DENY` - Prevent clickjacking
- [ ] `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer information
- [ ] `Permissions-Policy: geolocation=(), microphone=(), camera=()` - Disable unused features
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains` - Enforce HTTPS (production only)

---

## ✅ Logout & Session Management

### Logout Flow
- [ ] Clear access token from memory
- [ ] Clear refresh token from httpOnly cookie (server-side)
- [ ] Revoke tokens in Keycloak (call end_session_endpoint)
- [ ] Redirect to Keycloak logout page with post_logout_redirect_uri
- [ ] Clear all user-specific data from application state
- [ ] Invalidate any server-side sessions

```typescript
// Frontend logout
const logout = async () => {
  // Call backend to clear httpOnly cookie
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  // Clear memory
  setAccessToken(null);

  // Redirect to Keycloak logout
  const logoutUrl = new URL(`${KEYCLOAK_URL}/realms/freeflow/protocol/openid-connect/logout`);
  logoutUrl.searchParams.set('post_logout_redirect_uri', window.location.origin);
  logoutUrl.searchParams.set('id_token_hint', idToken); // if available

  window.location.href = logoutUrl.toString();
};
```

### Session Expiration
- [ ] Access token expires in **5 minutes** (Keycloak default)
- [ ] Refresh token expires in **30 days** (configurable)
- [ ] Proactively refresh access token **5 minutes before expiry**
- [ ] Show session timeout warning **1 minute before refresh token expiry**
- [ ] Force re-authentication if refresh token expired
- [ ] Handle token expiration gracefully (no error loops)

### Idle Timeout (Optional)
- [ ] Implement idle detection if required (user inactivity)
- [ ] Warn user before auto-logout
- [ ] Clear tokens and redirect to login after idle timeout

### Session Fixation Prevention
- [ ] Keycloak rotates tokens on refresh (verify `REUSE` vs `ROTATE` setting)
- [ ] Generate new session on login (Keycloak handles this)
- [ ] Never accept session tokens from URL parameters

---

## ✅ Local Development Cautions

### Environment Configuration
- [ ] **NEVER commit `.env` files with real credentials**
- [ ] Use `.env.example` as template (with placeholder values)
- [ ] Document which secrets are required in README
- [ ] Use different Keycloak clients for dev/staging/prod
- [ ] Use different Google OAuth credentials per environment

### Local Keycloak
- [ ] Default admin credentials are `admin:admin` - **ONLY for local dev**
- [ ] Local Keycloak data is ephemeral (unless volume persisted)
- [ ] Realm export should NOT contain secrets (use `**********` placeholders)
- [ ] Import realm on startup via `-Dkeycloak.import=/opt/keycloak/data/import/freeflow-realm.json`

### HTTPS in Development
- [ ] HTTP is acceptable for `localhost` (Keycloak allows it)
- [ ] For non-localhost dev domains, use mkcert or similar for HTTPS
- [ ] Browsers require secure context for some APIs (crypto, etc.)
- [ ] Test CORS and CSP in dev environment (catch issues early)

### Avoiding Pitfalls
```bash
# ❌ DON'T: Commit secrets
git add .env

# ✅ DO: Use example file
cp .env.example .env.local
# Add to .gitignore: .env.local

# ❌ DON'T: Use production credentials in dev
KEYCLOAK_CLIENT_ID=freeflow-web-prod

# ✅ DO: Use separate dev client
KEYCLOAK_CLIENT_ID=freeflow-web-dev

# ❌ DON'T: Disable security features in dev
SKIP_AUTH_CHECK=true

# ✅ DO: Keep security features enabled, use test accounts
```

### Development Credentials
```bash
# .env.example (safe to commit)
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=freeflow
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=freeflow-web

# Backend API
KEYCLOAK_ISSUER=http://localhost:8080/realms/freeflow
KEYCLOAK_JWKS_URI=http://localhost:8080/realms/freeflow/protocol/openid-connect/certs

# Google OAuth (DO NOT COMMIT REAL VALUES)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

---

## ✅ Testing Checklist

### Manual Security Tests
- [ ] Open DevTools → Application → Storage
  - [ ] No access tokens in localStorage
  - [ ] No refresh tokens in sessionStorage
  - [ ] Refresh token in Cookies with httpOnly flag
- [ ] Attempt to access API without token → 401 Unauthorized
- [ ] Attempt to access API with expired token → 401 Unauthorized
- [ ] Attempt to access API with invalid signature → 401 Unauthorized
- [ ] Logout and verify tokens are cleared
- [ ] Check Network tab for CORS headers on API requests
- [ ] Verify `Authorization: Bearer <token>` header on API calls
- [ ] Verify `Set-Cookie` with httpOnly on refresh

### Automated Security Tests
```typescript
// Example test
describe('Token Storage Security', () => {
  it('should NOT store access token in localStorage', () => {
    // After login
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('should send authorization header', async () => {
    const response = await fetch('/api/protected', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(response.status).toBe(200);
  });
});
```

---

## ✅ Deployment Checklist

### Pre-Production
- [ ] Review all environment variables (no dev values)
- [ ] Verify redirect URIs match production domain
- [ ] Enable HTTPS enforcement (`Strict-Transport-Security` header)
- [ ] Set secure cookie flags (`Secure`, `SameSite=Strict`)
- [ ] Review CORS allowed origins (no `*` wildcard)
- [ ] Enable Keycloak brute force detection
- [ ] Set appropriate token lifetimes (5 min access, 30 day refresh)
- [ ] Review CSP header (no `unsafe-eval` if possible)
- [ ] Enable rate limiting on authentication endpoints

### Production Monitoring
- [ ] Monitor failed authentication attempts
- [ ] Alert on unusual token refresh patterns
- [ ] Log token validation failures (issuer, audience, signature)
- [ ] Monitor session duration anomalies
- [ ] Track logout events
- [ ] Monitor CORS errors (might indicate misconfiguration)

---

## 🚨 Critical Security Rules

### The Golden Rules
1. **NO CLIENT SECRET IN BROWSER** - Public clients use PKCE, never secrets
2. **Access tokens in memory ONLY** - Never localStorage
3. **Refresh tokens in httpOnly cookies ONLY** - Never accessible to JavaScript
4. **Always validate tokens server-side** - Verify signature, issuer, audience, expiration
5. **CORS must be explicit** - No wildcards in production
6. **HTTPS in production** - No exceptions
7. **Rotate secrets regularly** - Every 90 days minimum
8. **Never commit credentials** - Use .env.example, not .env

### Quick Security Audit
```bash
# Run these checks before deploying:

# 1. No secrets in code
grep -r "clientSecret\|client_secret" apps/ packages/ --exclude-dir=node_modules | grep -v ".example"

# 2. No tokens in localStorage
grep -r "localStorage.*token" apps/web/ --exclude-dir=node_modules

# 3. HTTPS enforced (production only)
grep "secure: true" apps/api/src/

# 4. CORS not wildcard
grep "origin:.*\*" apps/api/src/

# 5. CSP header configured
grep -r "Content-Security-Policy" apps/web/
```

---

## 📚 Reference Documentation

- [Token Contract](./token-contract.md) - Token structure and validation
- [RBAC Model](./rbac.md) - Role-based access control
- [Keycloak Client Setup](./keycloak-client.md) - Next.js integration with PKCE
- [Google IdP Setup](./google-idp-setup.md) - Google authentication configuration
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web application security risks
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Keycloak Security Guide](https://www.keycloak.org/docs/latest/server_admin/#threat-model-mitigation)

---

## 🔄 Regular Security Review

**Schedule**: Quarterly or when:
- New authentication feature added
- Keycloak version updated
- Security vulnerability disclosed
- Team member onboarded

**Review Process**:
1. Run through this entire checklist
2. Perform security audit commands
3. Review recent authentication logs for anomalies
4. Update documentation if changes made
5. Train team on any new security practices

---

**Last Updated**: 2024-01-02
**Next Review**: 2024-04-02
