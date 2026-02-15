# Add-on Handoff Contract

## Endpoint

`POST /addons/handoff`

### Request

```json
{
  "appKey": "system-configuration",
  "context": {
    "returnTo": "https://portal.freeflow.dev/applications"
  }
}
```

### Response

```json
{
  "appKey": "system-configuration",
  "status": "allowed",
  "launchUrl": "https://addons.freeflow.dev/system",
  "integrationMode": "external",
  "token": "<short-lived-jwt>",
  "expiresAt": "2026-02-15T13:45:32.000Z",
  "expiresIn": 120
}
```

## JWT Claims

The handoff token is a short-lived JWT signed by the FreeFlow API.

Required claims:

- `iss`: FreeFlow API issuer (default `freeflow-api`)
- `aud`: `appKey` (the add-on must validate audience)
- `sub`: user id
- `exp`: expires in **<= 120 seconds**
- `iat`: issued at
- `tenant`: object with `id`, `name`, `realm`
- `roles`: array of role strings
- `freeflowRoles`: array of FreeFlow roles
- `appKey`: app identifier

## Validation Expectations (Add-on Side)

- Validate signature with shared secret or JWKS (as agreed per integration).
- Enforce `aud` matching the add-on’s `appKey`.
- Reject tokens with expired `exp`.
- Use `tenant` and `roles` to apply tenant and RBAC context.
