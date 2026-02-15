# Dashboard UI

## Overview

The dashboard renders a role-gated widget grid that matches the reference portal: KPI tiles across the top, an alarms panel, and chart panels. Widgets are driven by a layout config from the API and filtered again on the web tier by JWT roles.

## Data Flow

1. Web server reads the user session (`ff_session`) and extracts JWT roles + access token.
2. The server calls `GET /ui/widgets` and `GET /ui/dashboard/layout` on the API gateway with the bearer token.
3. The widget catalog keys are intersected with the role-based widget set (from `@freeflow/rbac-config`).
4. `WidgetRenderer` renders the layout and filters out widgets that are not allowed.

If the API is unavailable, the dashboard falls back to a local layout + widget catalog and still enforces role gating.

## Components

- `DashboardGrid`: layouts sections and grid columns.
- `WidgetFrame`: shared widget chrome (header/body/footer).
- `WidgetRenderer`: filters widgets by RBAC and renders via the registry.

## Widgets

- `KpiWidget` (`kpi-widget`): KPI tiles similar to the reference top tiles.
- `LineChartWidget` (`chart-widget`): line chart panel with usage trend.
- `AlarmListWidget` (`alarm-widget`): active alarm list with severity chips.

## Styling

CSS lives in `apps/web/src/app/globals.css` with the `ff-dashboard*` and `ff-widget*` classes to match the dark portal UI.

## RBAC

The dashboard uses JWT roles as the primary RBAC source.

- Allowed widget keys come from `@freeflow/rbac-config`.
- The API additionally filters catalog + layout by role before returning data.
