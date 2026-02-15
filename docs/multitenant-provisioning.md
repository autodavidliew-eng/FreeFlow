# FreeFlow Tenant Provisioning

This document describes the MT-2 tenant provisioning engine.

## Overview

Tenant provisioning creates a fully isolated environment per tenant:

- Keycloak realm
- Postgres database
- Mongo database
- Qdrant collection
- Storage folder
- Master DB metadata + provisioning logs

Provisioning is idempotent: running it again for the same tenant reuses existing resources and updates metadata.

## Service Location

- Service: `services/tenant-provisioning`
- CLI: `scripts/provision-tenant.ts`

## Provisioning Steps

1. Validate tenant name (lowercase, 3-30 chars, digits allowed).
2. Create/update tenant record in master DB (status = `provisioning`).
3. Create Keycloak realm using template JSON.
4. Create Postgres database `freeflow_{tenant}`.
5. Create Mongo database `freeflow_{tenant}`.
6. Create Qdrant collection `freeflow_{tenant}_vectors`.
7. Run Prisma migrations + seed against tenant Postgres DB.
8. Create storage folder `storage/tenants/{tenant}`.
9. Update tenant status to `active`.

If any step fails:

- A `TenantProvisionLog` entry is created with `failed` status.
- Tenant status is set to `suspended`.
- Optional rollback can be enabled via `ROLLBACK_ON_FAILURE=true`.

## Environment Variables

Required:

- `MASTER_DATABASE_URL`
- `POSTGRES_ADMIN_URL`
- `MONGODB_ADMIN_URI`
- `QDRANT_URL`
- `KEYCLOAK_BASE_URL`
- `KEYCLOAK_ADMIN_USERNAME`
- `KEYCLOAK_ADMIN_PASSWORD`

Optional:

- `KEYCLOAK_ADMIN_CLIENT_ID` (default: `admin-cli`)
- `KEYCLOAK_ADMIN_CLIENT_SECRET`
- `KEYCLOAK_REALM_TEMPLATE_PATH` (default: `infra/compose/keycloak/realms/freeflow-realm.json`)
- `TENANT_STORAGE_ROOT` (default: `storage/tenants`)
- `QDRANT_VECTOR_SIZE` (default: `1536`)
- `QDRANT_DISTANCE` (default: `Cosine`)
- `ROLLBACK_ON_FAILURE` (default: `false`)
- `PROVISION_RETRY_ATTEMPTS` (default: `3`)
- `PROVISION_RETRY_DELAY_MS` (default: `1500`)

## Example Usage

```bash
export MASTER_DATABASE_URL=postgresql://freeflow:freeflow_dev_password@localhost:5432/freeflow_master
export POSTGRES_ADMIN_URL=postgresql://freeflow:freeflow_dev_password@localhost:5432/postgres
export MONGODB_ADMIN_URI=mongodb://freeflow:freeflow_dev_password@localhost:27017/admin?authSource=admin
export QDRANT_URL=http://localhost:6333
export KEYCLOAK_BASE_URL=http://localhost:8080
export KEYCLOAK_ADMIN_USERNAME=admin
export KEYCLOAK_ADMIN_PASSWORD=admin

pnpm ts-node scripts/provision-tenant.ts acme
```

## Notes

- Provisioning logs live in `TenantProvisionLog`.
- Connection metadata is stored in `TenantConnection` with non-secret values.
- Secrets should be kept in a secret manager and referenced by `secretRef` in the master DB.
