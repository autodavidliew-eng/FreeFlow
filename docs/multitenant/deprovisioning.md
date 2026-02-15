# Tenant Deprovisioning (P3.3)

Tenant removal supports **soft** and **hard** modes.

## Modes

### Soft Delete

- Disable Keycloak realm
- Mark tenant status as `suspended`
- Keep tenant DBs and storage

### Hard Delete

- Disable + delete Keycloak realm
- Drop tenant Postgres DB
- Drop tenant Mongo DB
- Drop Qdrant collection
- Remove storage folder
- Delete tenant record from master DB

Hard delete requires `force=true`.

## Service Location

- Service: `services/tenant-provisioning/src/tenant-removal.service.ts`
- CLI: `scripts/tenant-remove.ts`

## API Endpoint

```
DELETE /tenants/:id?mode=soft|hard&force=true
```

Requires `system:*` permission.

## Rollback Notes

Hard delete steps are executed in order and each step is logged in `TenantProvisionLog`.
If any step fails, tenant status is set to `suspended` and the error is logged as `remove:failed`.

## Example Usage

```bash
pnpm ts-node scripts/tenant-remove.ts <tenant-id> soft
pnpm ts-node scripts/tenant-remove.ts <tenant-id> hard --force
```
