# Session Context (Handoff)

## Current State

- All roadmap phases through Phase 11 completed.
- Latest commit: `a87c280` (`chore: ignore build artifacts and refine outbox types`) on `master`.
- Branch status: `master` is synced with `origin/master`.
- Next.js production build now completes after updating `/auth/callback` to read
  query params from `window.location.search` instead of `useSearchParams` during
  prerender.
- `.gitignore` now includes `*.tsbuildinfo` and `/keycloak/`.
- Local dev servers running (started outside sandbox):
  - Web dev: `http://localhost:3000`
  - API dev: `http://127.0.0.1:4000` (CORS origin set to `http://localhost:3000`)
- Docker containers are **down** (infra stopped).

## Key Recent Files

- `PROGRESS.md` (final status)
- `docs/roadmap-summary.md`
- `docs/roadmap-complete.md`
- `docs/Index.md`
- Docs under: `docs/observability`, `docs/security`, `docs/ops`, `docs/launch`,
  `docs/post-launch`
- Helm values under: `infra/helm/*`

## Next Actions

1. Align Keycloak role names with `docs/auth/permissions.json` to resolve 403s
   for protected endpoints (Keycloak roles are lowercase, permissions file uses
   `Admin`/`Operator`/`Viewer`).
2. If needed, restart infra: `cd infra/compose && docker compose up -d`.
