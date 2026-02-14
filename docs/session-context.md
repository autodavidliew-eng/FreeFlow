# Session Context (Handoff)

## Current State

- All roadmap phases through Phase 11 completed.
- Latest commit: run `git log -1 --oneline` on `master`.
- Branch status: `master` is synced with `origin/master`.
- Next.js production build now completes after updating `/auth/callback` to read
  query params from `window.location.search` instead of `useSearchParams` during
  prerender.
- `.gitignore` now includes `*.tsbuildinfo` and `/keycloak/`.
- Local dev servers running (started outside sandbox):
  - Web dev: `http://localhost:3000`
  - API dev: `http://127.0.0.1:4000` (CORS origin set to `http://localhost:3000`)
- Docker containers are **down** (infra stopped).
- Keycloak compose realm updated to use `Admin`/`Operator`/`Viewer` roles and
  matching test users (aligns with `docs/auth/permissions.json`).

## Key Recent Files

- `PROGRESS.md` (final status)
- `docs/roadmap-summary.md`
- `docs/roadmap-complete.md`
- `docs/Index.md`
- Docs under: `docs/observability`, `docs/security`, `docs/ops`, `docs/launch`,
  `docs/post-launch`
- Helm values under: `infra/helm/*`

## Next Actions

1. Reimport the updated Keycloak realm (start infra, then recreate keycloak
   container if needed) and re-test protected endpoints.
2. If needed, restart infra: `cd infra/compose && docker compose up -d`.
