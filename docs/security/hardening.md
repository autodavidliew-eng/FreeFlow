# Security Hardening Checklist

This checklist covers baseline security hardening for staging and production.

## Auth and JWT Validation

- Validate issuer (`iss`) and audience (`aud`) on every request.
- Enforce JWT signature verification via JWKS.
- Apply role-based access control (RBAC) at the API gateway and services.
- Short token lifetimes and refresh token rotation where supported.

## HTTP Security Headers

- `Content-Security-Policy` (CSP) with least privilege.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy` with explicit allowlist

## TLS and HSTS

- Enforce TLS for all public endpoints.
- Enable HSTS with preload (after validation).
- Use modern TLS config (disable TLS 1.0/1.1).

## Secrets Management

- Store secrets outside Git (Kubernetes Secrets, External Secrets, or Vault).
- Rotate secrets quarterly or after any incident.
- Avoid secrets in container images or environment files.
