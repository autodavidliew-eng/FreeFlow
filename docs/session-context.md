# Session Context (Handoff)

## Current State

- All roadmap phases through Phase 11 completed.
- Latest commit: `6605976` (`chore: checkpoint`) on `master`.
- Branch status: `master` is synced with `origin/master`.
- Local dev fixes are currently uncommitted.
- Next.js production build now completes after updating `/auth/callback` to read
  query params from `window.location.search` instead of `useSearchParams` during
  prerender.

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
