# Postgres Data Layer (Prisma)

## Overview

This package provides the Prisma schema and client for FreeFlow's Postgres data layer.
It seeds a minimal dataset for dashboard layouts and widget configs for three roles.

## Package

- `packages/db-postgres`

## Prerequisites

- Postgres running locally
- `DATABASE_URL` set (see `apps/api/.env.example`)

Example:

```bash
export DATABASE_URL=postgresql://freeflow:freeflow_dev_password@localhost:5432/freeflow
```

## Migrate + Seed

From the repo root:

```bash
pnpm --filter @freeflow/db-postgres db:migrate -- --name init
pnpm --filter @freeflow/db-postgres db:generate
pnpm --filter @freeflow/db-postgres db:seed
```

## What Gets Seeded

- Users:
  - `admin@freeflow.dev` (Admin)
  - `operator@freeflow.dev` (Operator)
  - `viewer@freeflow.dev` (Viewer)
- Dashboard layout for each user
- Widget configs for the KPI, Chart, and Alarm widgets

## Notes

- The permissions model still lives in `docs/auth/permissions.json`.
- Replace seed data once real user/profile sync exists.
