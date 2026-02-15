# Alarms UI

## Overview

The Alarms page mirrors the reference layout with a search bar, severity filters, and a dense table view. It is currently driven by a mock API client that will be swapped for real backend data.

## Data Flow

- `getAlarms()` in `apps/web/src/lib/alarms/client.ts` returns mock alarm records.
- `AlarmsPage` loads the records on the server and passes them to the client view.
- `AlarmsView` handles search, severity filters, and pagination on the client.

## Components

- `AlarmsView`: orchestrates filter + pagination state.
- `AlarmsToolbar`: search input and severity controls.
- `SeverityFilter`: multi-select severity chips with reset.
- `AlarmsTable`: table layout with severity/status styling.
- `Pagination`: next/previous controls with a summary.

## Mock Fields

Each alarm includes site, device, category, severity, description, timestamp, and status (Open, Acknowledged, Resolved).
