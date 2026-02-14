# GitHub Actions CI/CD

This repo uses two workflows:

- `ci.yml` for pull requests (lint + tests + build)
- `release.yml` for main branch (build + containerize + push)

## CI (Pull Requests)

The PR workflow runs:

- `pnpm lint`
- `pnpm --filter "!@freeflow/db-postgres" --filter "!@freeflow/db-mongo" test`
- `pnpm build`

The DB integration tests are excluded because they require Docker and Testcontainers.

## Release (Main)

The release workflow builds and pushes Docker images to GHCR using
`ghcr.io/<owner>/<repo>-<service>` naming.

Images are built only if the Dockerfile exists (context is repo root):

- `apps/web/Dockerfile`
- `apps/api/Dockerfile`
- `services/*/Dockerfile`

### Tags

- `:latest`
- `:<git-sha>`

## Permissions

The release workflow uses `GITHUB_TOKEN` with `packages: write` to push to GHCR.

## Customization

- Update the matrix in `.github/workflows/release.yml` to add/remove services.
- Adjust the CI test filters if you add more integration tests.
