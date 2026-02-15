# UI Reference Analysis

Reference assets: `ui-reference/`

## Layout Regions

- TopBar
  - Left: hamburger, logo/brand mark
  - Center: page title (Dashboard / Applications / Alarms)
  - Right: quick icons (apps grid, notifications), user chip/dropdown
- SideNav
  - Sliding menu with primary nav + nested groups
  - Collapsible/expanded states with icon + label
- Content
  - Full-bleed dark canvas
  - Panels with elevated borders and subtle inner shadows
- Dashboard Panes
  - KPI strip
  - Alarm / Alert list panel
  - Chart panels in a 2x1 grid

## Pages (Primary)

- Sign In
- Dashboard (Home)
- Alarms / Alerts
- Applications
- Profile

## Additional Referenced Screens

- Manage User
- Rule Engine
- System Configuration
- Report

## Key Components

- TopBar icons + user menu
- Sliding SideNav with nested groups
- KPI tiles (icon + label + primary metric + timestamp)
- Alert list rows with severity chips and timestamps
- Chart panels with area/line graphs
- App tiles grid (icon + label)
- Search bars with hint text
- Tabbed profile sections
- Settings rows with toggles and action buttons

## Visual Traits

- Dark navy background with subtle gradient
- Panel surfaces slightly lighter than canvas
- Thin separators, low-contrast borders
- Accent color: teal/cyan for actions, orange for highlights
- Iconography consistent and thin-line

## States to Capture

- SideNav collapsed vs expanded
- Active menu item highlight
- Hover state on menu and tiles
- Empty states (no alarms, no results)
- Disabled/inactive toggles in settings

## UI Goals (FreeFlow)

- Match the portal shell and panel density from reference.
- Keep layouts information-dense while preserving readability.
- Use role-based widgets and menus to reduce clutter per user.
- Maintain consistent spacing, typography, and icon style across pages.
