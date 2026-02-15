# FreeFlow Tenant Removal (MT-3)

This document describes tenant removal modes and the associated API/CLI.

## Modes

### Soft Delete

- Sets tenant status to `suspended`.
- Disables the Keycloak realm.
- Keeps all databases and collections intact.

### Hard Delete

- Requires `force=true`.
- Sets tenant status to `deleting`.
- Deletes Keycloak realm.
- Drops Postgres database.
- Drops Mongo database.
- Deletes Qdrant collection.
- Removes tenant storage folder.
- Deletes tenant record from master DB.

All actions are logged to `TenantProvisionLog` during execution.

## API Endpoint

```
DELETE /tenants/:id?mode=soft|hard&force=true
```

- Default mode is `soft`.
- `force=true` is required for `hard`.

## CLI

Remove a single tenant by id:

```bash
export MASTER_DATABASE_URL=postgresql://freeflow:freeflow_dev_password@localhost:5432/freeflow_master
export POSTGRES_ADMIN_URL=postgresql://freeflow:freeflow_dev_password@localhost:5432/postgres
export MONGODB_ADMIN_URI=mongodb://freeflow:freeflow_dev_password@localhost:27017/admin?authSource=admin
export QDRANT_URL=http://localhost:6333
export KEYCLOAK_BASE_URL=http://localhost:8080
export KEYCLOAK_ADMIN_USERNAME=admin
export KEYCLOAK_ADMIN_PASSWORD=admin

pnpm ts-node scripts/remove-tenant.ts <tenant-id> hard --force
```

Cleanup tenants by prefix (non-active by default):

```bash
pnpm ts-node scripts/cleanup-tenants.ts --prefix mt2demo
```

To include active tenants, add `--include-active`.

## Safety

Protected tenant names: `freeflow`, `system`.
These cannot be removed.
