# CI Pipeline

## Triggers

- Pull requests run lint, typecheck, unit tests, and build.
- Nightly schedule runs Playwright E2E.
- Manual dispatch can enable E2E with the `run_e2e` input.

## Jobs

### lint-test-build

- Install dependencies with pnpm cache.
- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run unit tests with DB/testcontainer-heavy packages filtered out.
- Build the repo with `pnpm build`.

### e2e

- Installs Playwright browsers.
- Builds and starts the web app.
- Runs `pnpm --filter @freeflow/web test:e2e` with `SESSION_SECRET` set.

## Notes

- If Playwright browser downloads are blocked, rerun the job or install browsers in the runner image.
- Set additional environment variables in the workflow if E2E tests begin to rely on external services.
