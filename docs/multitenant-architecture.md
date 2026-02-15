# FreeFlow Multi-Tenant Architecture

## Overview

Goal: strict tenant isolation with per-tenant Keycloak realm, Postgres DB, Mongo DB, and Qdrant collection, plus a master Postgres DB storing tenant metadata. All tenant DB/collection names are prefixed with the tenant name.

## Tenant Lifecycle States

1. provisioning
2. active
3. suspended
4. deleting
5. deleted

State semantics:

- provisioning: resources being created and initialized. Requests should be blocked or routed to a maintenance response.
- active: full access.
- suspended: access denied except for billing/admin actions; data preserved.
- deleting: teardown in progress; access denied.
- deleted: resources removed; metadata retained only for audit/retention rules.

## Master DB Schema

Master DB is a dedicated Postgres database (e.g., `freeflow_master`). It stores tenant metadata, provisioning logs, and connection metadata. It must be the only shared persistence layer.

### Table: tenants

Fields:

- id (uuid, pk)
- tenant_key (text, unique, immutable)
- display_name (text)
- status (text, enum: provisioning|active|suspended|deleting|deleted)
- region (text, optional)
- created_at (timestamptz)
- updated_at (timestamptz)
- deleted_at (timestamptz, nullable)
- keycloak_realm (text, unique)
- subdomain (text, unique)
- billing_plan (text)
- retention_policy (jsonb)

Indexes:

- unique (tenant_key)
- unique (subdomain)
- unique (keycloak_realm)
- index (status)

### Table: provisioning_logs

Fields:

- id (uuid, pk)
- tenant_id (uuid, fk -> tenants.id)
- stage (text)
- status (text, enum: started|succeeded|failed)
- message (text)
- error_details (jsonb, nullable)
- created_at (timestamptz)

Indexes:

- index (tenant_id)
- index (created_at)

### Table: tenant_connections

Stores per-tenant connection metadata. Secrets live in a secret store; this table contains references and non-sensitive data.

Fields:

- id (uuid, pk)
- tenant_id (uuid, fk -> tenants.id)
- service (text, enum: postgres|mongodb|qdrant)
- db_name (text)
- host (text)
- port (int)
- username (text)
- secret_ref (text)
- options (jsonb)
- created_at (timestamptz)
- updated_at (timestamptz)

Indexes:

- unique (tenant_id, service)
- index (db_name)

## Naming Convention Helpers

All names are prefixed with the tenant key. Use a canonical, lowercase, hyphen-free key.

Rules:

- tenant_key: `[a-z0-9]{3,30}`
- prefix = `freeflow_${tenant_key}`

Helpers:

- Postgres DB name: `freeflow_${tenant_key}`
- Mongo DB name: `freeflow_${tenant_key}`
- Qdrant collection: `freeflow_${tenant_key}_vectors`
- Keycloak realm: `freeflow-${tenant_key}`
- Schema prefix (optional): `freeflow_${tenant_key}`

Examples:

- tenant_key = `acme`
- postgres DB = `freeflow_acme`
- mongo DB = `freeflow_acme`
- qdrant collection = `freeflow_acme_vectors`
- realm = `freeflow-acme`

## Runtime Tenant Resolution Strategy

Primary: subdomain

- `https://{tenant}.freeflow.com` maps to tenant_key.
- API gateway extracts subdomain and resolves tenant from master DB.

Secondary: header

- Support `X-FF-Tenant` for internal tools and tests.
- Only allowed from trusted internal networks or with a signed service token.

Fallback: realm

- Keycloak issuer includes realm: `https://auth.freeflow.com/realms/freeflow-{tenant}`.
- JWT verification yields realm name; can be used as an integrity check.

Resolution order:

1. subdomain
2. header
3. realm in token

If multiple sources conflict, reject with 401.

## Data Plane Flow

ASCII diagram:

Client
|
v
Edge / API Gateway
| (resolve tenant: subdomain/header/realm)
v
Tenant Router
|-> Master DB (tenant metadata)
|
|-> Keycloak Realm: freeflow-{tenant}
|-> Postgres DB: freeflow*{tenant}
|-> Mongo DB: freeflow*{tenant}
|-> Qdrant Collection: freeflow\_{tenant}\_vectors

## Provisioning Flow

ASCII diagram:

Provisioning Service
|
v
Master DB: create tenant (status=provisioning)
|
v
Create resources

- Keycloak realm
- Postgres DB + migrations
- Mongo DB + collections
- Qdrant collection + vector schema
  |
  v
  Update tenant status = active

Failure handling:

- Log to provisioning_logs
- Set status = suspended or provisioning based on retry policy
- Keep partial resources tagged with tenant_key for cleanup

## Security Notes

- No shared tenant data tables. All tenant data lives in tenant-specific stores.
- All connection secrets stored in a secret store; only references in master DB.
- Enforce tenant context in all services; reject missing or conflicting tenant identity.
- Use per-tenant Keycloak realm to avoid cross-tenant token acceptance.

## Operational Notes

- Deleting tenant: set status=deleting, revoke auth, drain queues, delete stores, set status=deleted.
- Suspended tenant: disable realm or apply deny policy; keep data intact.
- Use strict naming helpers everywhere to prevent collisions.
