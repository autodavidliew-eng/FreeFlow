# Form.io Integration

## Overview

FreeFlow proxies Form.io requests through the API gateway so browser clients never see Form.io credentials.
All Form.io access is protected by JWT authentication and OpenFGA checks.

## Configuration

Set these environment variables on the API service:

- `FORMIO_BASE_URL`: Form.io project base URL (example: `https://example.form.io` or `https://example.form.io/project`)
- `FORMIO_SERVICE_TOKEN` (optional): Service-to-service JWT or API token. If unset, the proxy forwards the user's JWT.

## Endpoints

### `GET /forms/:formId/schema`

Fetch a form schema from Form.io.

- OpenFGA requirement: `view` on `form:<formId>`
- Upstream call: `GET {FORMIO_BASE_URL}/{formId}`
- Auth header: `Authorization: Bearer <FORMIO_SERVICE_TOKEN|user JWT>`

### `POST /forms/:formId/submissions`

Submit a form payload to Form.io.

- OpenFGA requirement: `submit` on `form:<formId>`
- Upstream call: `POST {FORMIO_BASE_URL}/{formId}/submission`
- Auth header: `Authorization: Bearer <FORMIO_SERVICE_TOKEN|user JWT>`

## Security Notes

- The browser never receives Form.io secrets.
- OpenFGA enforces fine-grained access for both schema reads and submissions.
- If Form.io returns a non-JSON response, the proxy returns `{ "raw": "..." }`.
