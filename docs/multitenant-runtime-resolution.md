# FreeFlow Runtime Tenant Resolution (MT-4)

This document describes how incoming requests are mapped to a tenant at runtime
and how tenant-specific data connections are created safely.

## Resolution Order

1. `X-Tenant-ID` header (configurable via `TENANT_HEADER_NAME`)
2. Subdomain `{tenant}.{TENANT_BASE_DOMAIN}`
3. Keycloak realm derived from JWT issuer (`iss`)

If multiple identifiers are provided, they must resolve to the same tenant or the
request is rejected.

## Tenant Context Flow

```
┌──────────────┐   ┌────────────────────┐   ┌────────────────────────────┐
│  Request     │──▶│ TenantResolver     │──▶│ AsyncLocalStorage Context  │
└──────────────┘   └────────────────────┘   └────────────────────────────┘
         │                    │                         │
         │                    ▼                         ▼
         │        Master DB lookup             Per-request factories
         │        (Tenant record)              (Postgres/Mongo/Qdrant)
```

## Tenant Context Shape

```
{
  id,
  name,
  realmName,
  postgresDb,
  mongoDb,
  qdrantCollection,
  status
}
```

## Data Connection Strategy

- Postgres: `DATABASE_URL` is used as a base, with the database name replaced
  by the tenant-specific database from the master registry.
- MongoDB: `MONGODB_URI` is used as a base with `dbName` set per tenant.
- Qdrant: a shared client is used with per-tenant collection selection.

Connections are cached per tenant to avoid cross-tenant leakage and reduce
connection churn.

## Error Behavior

- Missing tenant identifier → `400 Bad Request`
- Tenant not found → `404 Not Found`
- Tenant not active → `403 Forbidden`
- Conflicting identifiers → `400 Bad Request`

## Environment Variables

- `TENANT_BASE_DOMAIN`: Base domain for subdomain resolution.
- `TENANT_HEADER_NAME`: Header used for tenant resolution.
- `TENANT_HEADER_ENABLED`: Enable/disable header resolution.
- `DATABASE_URL`: Base Postgres connection string.
- `MONGODB_URI`: Base MongoDB connection string.
- `QDRANT_URL`: Qdrant service URL.
- `QDRANT_API_KEY`: Optional Qdrant API key.
