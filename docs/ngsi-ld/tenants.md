# NGSI-LD Tenant Bootstrap

Scorpio requires the `NGSILD-Tenant` header for tenant isolation. In local dev, a tenant can be “bootstrapped” by creating a minimal entity under that tenant.

## Bootstrap script

```bash
node scripts/ngsi/scorpio-bootstrap-tenant.js
```

Environment overrides:
- `SCORPIO_URL` (default: `http://localhost:9090`)
- `TENANT` (default: `alpha`)
- `ENTITY_ID` (optional)

## Why this exists
If a tenant header is used before any data is written, some deployments may return `Tenant not found`. The bootstrap script ensures the tenant is created by inserting a lightweight seed entity.
