# Emeter Weekly Widget + Role Access Control

## Overview

This feature adds a **7‑day Emeter weekly trend widget** to the dashboard and a **role‑based access control (RBAC) assignment app** that lets admins decide which roles can see which widgets/apps **per tenant**.

Key outcomes:

- **Operator** sees the Emeter weekly chart by default.
- **Admin** does **not** see the Emeter chart by default, but **can** manage access.
- **Viewer** sees neither by default.
- Admin can grant the widget to Viewer via the Access Control app.

## Architecture

### Data flow (NGSI‑LD → Dashboard)

```
IoT/Simulated Data
        |
        v
NGSI-LD Ingestor (services/ngsi-ingestor)
        |
        v
Scorpio NGSI-LD Broker
        |
        v
Subscription -> NGSI Consumer (services/ngsi-consumer)
        |
        v
Postgres (SmartMeterMeasurement)
        |
        v
API /emeter/weekly (apps/api)
        |
        v
Next.js Widget (apps/web)
```

### RBAC flow (per-tenant)

```
Admin User
   |
   v
Access Control App (apps/web)
   |
   v
API /access-control/roles (apps/api)
   |
   v
Postgres (RoleWidgetAccess / RoleAppAccess)
   |
   v
UI + Addons services filter apps/widgets by role
```

## Data model (tenant Postgres)

- `SmartMeterMeasurement`
  - Stores smart meter readings (timestamped)
  - Fields: `tenant`, `meterId`, `ts`, `powerW`, `energyKWh`, `rawJson`

- `RoleWidgetAccess`
  - `role`, `widgetKey`, `actions[]`

- `RoleAppAccess`
  - `role`, `appKey`, `actions[]`

- `WidgetCatalog` / `AppCatalog`
  - Master lists of widgets and apps available to the tenant

## API surface

### `GET /emeter/weekly`

- Auth: JWT required
- Enforces access via `RoleWidgetAccess` for `emeter-weekly-widget`
- Query params:
  - `meterId` (default: `emeter-001`)
  - `days` (default: 7, max: 31)
- Response: daily series for the last N days (filled with zeros when missing)

### `GET /access-control/roles`

- Auth: JWT + permission `settings:*`
- Returns:
  - roles list
  - widget catalog
  - app catalog
  - current assignments

### `PUT /access-control/roles/:role`

- Auth: JWT + permission `settings:*`
- Payload: `{ widgets: string[], apps: string[] }`
- Replaces role assignments atomically

## UI components

- **EmeterWeeklyWidget** (`apps/web/src/components/widgets/EmeterWeeklyWidget.tsx`)
  - Chart.js line chart
  - Auto-refresh every 60s
  - Reads from `/api/emeter/weekly`

- **Access Control App** (`/apps/access-control`)
  - Lists roles
  - Toggles widget/app visibility
  - Writes to `/api/access-control/roles`

## Default role behavior

| Role     | Emeter Weekly Widget | Access Control App |
| -------- | -------------------- | ------------------ |
| Admin    | No                   | Yes                |
| Operator | Yes                  | No                 |
| Viewer   | No                   | No                 |

This is configurable per tenant via the Access Control app.

## Usage

### 1) Apply tenant DB migration + seed

```
cd /home/vapt/FreeFlow/packages/db-postgres
DATABASE_URL=postgresql://freeflow:freeflow_dev_password@localhost:5432/freeflow?schema=public \
  ./node_modules/.bin/prisma migrate deploy
DATABASE_URL=postgresql://freeflow:freeflow_dev_password@localhost:5432/freeflow?schema=public \
  ./node_modules/.bin/ts-node --transpile-only prisma/seed.ts
```

### 2) Create Alpha users (Admin/Operator/Viewer)

```
cd /home/vapt/FreeFlow
SUDO_PASSWORD=<your-sudo-password> ./scripts/keycloak/seed-alpha-users.sh
```

### 3) Start services

- Infra: `sudo docker compose -f infra/compose/docker-compose.yml up -d`
- API: `pnpm --filter @freeflow/api dev`
- Web: `pnpm --filter @freeflow/web dev`
- NGSI ingest/consumer (if testing live feed):
  - `pnpm --filter @freeflow/ngsi-ingestor dev`
  - `pnpm --filter @freeflow/ngsi-consumer dev`

### 3.1) (Optional) Replay 7‑day sample data

```
curl -X POST "http://localhost:8091/replay/smartmeter/week?tenant=alpha&meterId=emeter-001"
```

This sends a 7‑day, 5‑minute interval dataset to Scorpio → NGSI consumer → Postgres.

### 4) Test expected behavior

- Login as **Admin**:
  - Dashboard should not show Emeter weekly chart.
  - Applications list should include **Access Control**.

- Login as **Operator**:
  - Dashboard should show Emeter weekly chart.
  - Applications list should **not** include Access Control.

- Login as **Viewer**:
  - Dashboard should not show Emeter weekly chart.
  - Applications list should **not** include Access Control.

### 5) Grant Viewer access to the widget

- Login as **Admin**
- Go to **Applications → Access Control**
- Select **Viewer** role
- Enable **Emeter Weekly** widget
- Save

Now login as **Viewer** → the widget appears on the dashboard.

## Notes

- The widget uses tenant resolution from API context and filters by `tenant` in data queries.
- The widget shows a full 7‑day series even when no data exists for some days (filled with zeros).
- Access control is **tenant‑scoped**; changes affect only the active tenant.
