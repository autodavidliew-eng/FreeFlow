# FreeFlow UI Codex Tasklist

Source prompt: `/home/vapt/Desktop/Vibe-code - FreeFlow Business Workflow UI Prompt.txt`
Screenshots: `/home/vapt/Desktop/screenshots.zip`

## Status

- Current phase: P2.2 (JWT RBAC)
- Status: P2.1 completed
- Last updated: 2026-02-15

## Phases

- P0.1 — Import UI reference pack into repo: DONE
- P1.1 — UI theme + primitives (dark portal style): DONE
- P1.2 — AppShell (TopBar + SideNav + content layout): DONE
- P2.1 — Keycloak OIDC integration (Auth Code + PKCE): DONE
- P2.2 — JWT RBAC source-of-truth spec
- P3.1 — Master tenant database (registry)
- P3.2 — Provision tenant (create realm + DBs + seed + folders)
- P3.3 — Deprovision tenant (soft/hard delete)
- P4.1 — OpenFGA docker compose + bootstrap model
- P4.2 — OpenFGA client + Nest guard/decorator
- P5.1 — Widget catalog + layouts (DB config, JWT RBAC gate)
- P5.2 — Dashboard page (render role-based widgets)
- P6.1 — Alarms page UI (filter + table)
- P6.2 — OpenFGA alarm access (site-based)
- P7.1 — App catalog (DB config) + JWT RBAC filtering
- P7.2 — Add-on launch handoff (JWT RBAC + OpenFGA + short-lived JWT)
- P7.3 — Applications page UI (grid + secure launch)
- P8.1 — Profile page UI
- P9.1 — Form.io backend proxy (JWT passthrough + FGA checks)
- P9.2 — Forms mini-app page
- P10.1 — Playwright E2E suite
- P10.2 — CI pipeline
- P10.3 — K8s readiness/liveness/startup probes

## Notes

- Widgets must be role-based (JWT) and assigned via DB catalog/layout tables.
- Add-ons must accept JWT handoff; RBAC enforced by JWT; fine-grained control via OpenFGA.
- Forms use Form.io; access is role-based and FGA-checked.
