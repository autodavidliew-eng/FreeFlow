# Web Authentication (Keycloak OIDC + PKCE)

This document describes the Next.js (apps/web) OIDC login flow using Keycloak with Authorization Code + PKCE and a signed server session cookie.

## Flow Overview

1. User visits `/auth/login` and clicks **Continue to Keycloak**.
2. `/auth/login/start` generates PKCE verifier/challenge and redirects to Keycloak.
3. Keycloak authenticates the user and redirects to `/auth/callback`.
4. `/auth/callback/complete` exchanges the code for tokens, stores a signed session cookie, then redirects to `/dashboard`.
5. `/auth/logout` clears the session cookie and redirects to Keycloak end-session (when supported).

## Routes

- `GET /auth/login` – Login UI
- `GET /auth/login/start` – PKCE bootstrap + redirect to Keycloak
- `GET /auth/callback` – Client-side handoff into server callback
- `GET /auth/callback/complete` – Code exchange + session cookie
- `GET /auth/logout` – Clear session + Keycloak end-session
- `GET /api/auth/me` – Returns current user payload for the UI

## Environment Variables

Set these in `apps/web/.env.local` for local development:

- `NEXT_PUBLIC_APP_URL` (default `http://localhost:3000`)
- `KEYCLOAK_ISSUER` (example: `http://localhost:8080/realms/freeflow`)
- `KEYCLOAK_ID` (Keycloak client ID)
- `KEYCLOAK_REDIRECT_URI` (default: `${NEXT_PUBLIC_APP_URL}/auth/callback`)
- `KEYCLOAK_POST_LOGOUT_REDIRECT_URI` (default: `${NEXT_PUBLIC_APP_URL}/`)
- `SESSION_SECRET` (random 32+ chars)

## Session Handling

- The server stores tokens and role claims inside a signed cookie (`ff_session`).
- The cookie is HTTP-only and Lax; for production it is `secure`.
- `/api/auth/me` reads the cookie and exposes a minimal user profile + roles.

## Roles

Roles are extracted from the access token (`realm_access.roles`).
The server also stores the roles in the session payload for quick access.

## Frontend Utilities

- `useCurrentUser()` – client hook that fetches `/api/auth/me`.
- `getUserRoles()` – server helper that reads roles from the session cookie.

## Related Docs

- `docs/auth/keycloak-client.md`
- `docs/auth/token-contract.md`
