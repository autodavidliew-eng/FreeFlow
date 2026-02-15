# Master Tenant Database (freeflow_master)

The master database stores tenant metadata and provisioning history.
It is the **source of truth** for mapping tenant keys to realm/DB names.

## Database

- **Database name**: `freeflow_master`
- **Connection**: `MASTER_DATABASE_URL`
- **Prisma schema**: `packages/db-master/prisma/schema.prisma`

## Schema

### Tenant

| Field            | Type      | Notes                                              |
| ---------------- | --------- | -------------------------------------------------- |
| id               | uuid      | Primary key                                        |
| name             | text      | Unique tenant key (`[a-z0-9]{3,30}`)               |
| realmName        | text      | `freeflow-{tenant}`                                |
| postgresDb       | text      | `freeflow_{tenant}`                                |
| mongoDb          | text      | `freeflow_{tenant}`                                |
| qdrantCollection | text      | `freeflow_{tenant}_vectors`                        |
| status           | enum      | provisioning, active, suspended, deleting, deleted |
| createdAt        | timestamp | Auto                                               |
| updatedAt        | timestamp | Auto                                               |

### TenantProvisionLog

| Field     | Type      | Notes                  |
| --------- | --------- | ---------------------- |
| id        | uuid      | Primary key            |
| tenantId  | uuid      | FK → Tenant            |
| step      | text      | Provisioning step name |
| status    | text      | success / error        |
| message   | text      | Optional details       |
| createdAt | timestamp | Auto                   |

### TenantConnection

| Field     | Type      | Notes                     |
| --------- | --------- | ------------------------- |
| id        | uuid      | Primary key               |
| tenantId  | uuid      | FK → Tenant               |
| service   | enum      | postgres, mongodb, qdrant |
| dbName    | text      | Resource name (prefixed)  |
| host      | text      | Optional                  |
| port      | int       | Optional                  |
| username  | text      | Optional                  |
| secretRef | text      | Optional vault ref        |
| options   | json      | Optional overrides        |
| createdAt | timestamp | Auto                      |
| updatedAt | timestamp | Auto                      |

## Prisma Commands

Run inside the repo root:

```bash
pnpm --filter @freeflow/db-master db:migrate
pnpm --filter @freeflow/db-master db:seed
```

Seed uses these optional env vars:

- `SEED_TENANT_NAME` (default `demo`)
- `SEED_POSTGRES_HOST` (default `localhost`)
- `SEED_POSTGRES_PORT` (default `5432`)
- `SEED_POSTGRES_USER` (default `freeflow`)
- `SEED_MONGO_HOST` (default `localhost`)
- `SEED_MONGO_PORT` (default `27017`)
- `SEED_QDRANT_HOST` (default `localhost`)
- `SEED_QDRANT_PORT` (default `6333`)

## API Endpoints (Admin)

- `POST /tenants` – create tenant (provisioning pipeline)
- `GET /tenants` – list tenants
- `DELETE /tenants/:id?mode=soft|hard&force=true` – remove tenant

All tenant admin endpoints require `system:*` permission.

## Data Flow

```
┌──────────────┐
│   API/Nest   │
└──────┬───────┘
       │
       ▼
┌────────────────────────┐
│   freeflow_master DB   │
│  Tenants + Connections │
│   Provisioning Logs    │
└────────────────────────┘
```
