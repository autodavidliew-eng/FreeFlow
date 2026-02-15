# Playwright E2E Tests

## Overview

Playwright covers the FreeFlow portal shell and key workflows:

- Shell navigation + side nav toggle
- Admin vs Viewer widget visibility on the dashboard
- Applications list filtering + handoff launch
- Forms mini-app schema load + submit
- Profile page load

## Running Locally

```bash
pnpm --filter @freeflow/web test:e2e
```

### Environment Requirements

- `SESSION_SECRET` must be present to sign the session cookie used by tests.
  - Provide it via shell env or `apps/web/.env.local`.
- Optional: `PLAYWRIGHT_BASE_URL` (defaults to `http://localhost:3000`).

## Notes

- Tests mock API responses using Playwright route interception.
- Some environments require Playwright browser installs; if downloads are blocked, re-run installs later.
