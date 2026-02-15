# Tenant Provisioning (P3.2)

Tenant provisioning creates a fully isolated environment per tenant and records metadata in the master DB.

## Overview

Provisioning creates:

- Keycloak realm
- Postgres tenant database
- Mongo tenant database
- Qdrant collection
- Storage folder
- Master DB metadata + provisioning logs

Provisioning is **idempotent**. Re-running for the same tenant reuses existing resources and updates metadata.

## Service Location

- Service: `services/tenant-provisioning`
- CLI: `scripts/tenant-provision.ts`

(Existing helper script `scripts/provision-tenant.ts` is still supported.)

## Provisioning Steps

1. Validate tenant name (lowercase, 3-30 chars, digits allowed).
2. Create/update tenant record in master DB (status = `provisioning`).
3. Create Keycloak realm using template JSON.
4. Create Postgres database `freeflow_{tenant}`.
5. Create Mongo database `freeflow_{tenant}`.
6. Create Qdrant collection `freeflow_{tenant}_vectors`.
7. Run Prisma migrations + seed against tenant Postgres DB.
8. Create storage folder `storage/tenants/{tenant}`.
9. Update tenant status to `active` and log each step.

If any step fails:

- A `TenantProvisionLog` entry is created with `failed` status.
- Tenant status is set to `suspended`.
- Optional rollback can be enabled via `ROLLBACK_ON_FAILURE=true`.

## Seed Notes

The provisioning step runs `db:seed` for the tenant Postgres DB. Today it seeds:

- User profiles (Admin/Operator/Viewer)
- Default dashboard layout + widget configs

Widget/app catalogs will be extended in P5.1.

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

pnpm ts-node scripts/tenant-provision.ts acme
```

## Rollback Notes

If `ROLLBACK_ON_FAILURE=true`:

- Keycloak realm, Postgres DB, Mongo DB, Qdrant collection, and storage folder are removed in reverse order.
- Rollback outcomes are logged under `step: <name>:rollback`.
