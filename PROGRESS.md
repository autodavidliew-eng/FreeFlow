## Progress status

Last updated: 2026-02-17  
Current task: Emeter weekly widget + RBAC assignment app (E1)  
Status: Completed  
Next task: Manual validation in browser (admin/operator/viewer flows)

Latest update: Emeter weekly widget + access-control app delivered (2026-02-17).

## E1 — Emeter Weekly Widget + Role-based Access Assignment

**Objective:** Add an operator-only emeter weekly chart, make widget/app access tenant-configurable via a role-based access-control app.

**Tasks:**

- [x] E1.1 Review existing widget registry, RBAC config, and dashboard layout sources.
- [x] E1.2 Add tenant DB tables for role→widget/app access + seed catalog entries.
- [x] E1.3 Build access-control API + UI to assign widgets/apps by role.
- [x] E1.4 Build emeter weekly chart widget + API endpoint.
- [x] E1.5 Wire dynamic role access into widget catalog + app catalog filtering.
- [x] E1.6 Seed Alpha tenant users (admin/operator/viewer) with roles.
- [x] E1.7 Run tenant DB migration + seed to apply access-control schema.
- [x] E1.8 Publish architecture + usage docs for the feature set.

## Session Context (Handoff)

See `docs/session-context.md` for the saved handoff notes.

## Best-practice findings (web-researched)

1. **For browser-based apps, use OIDC Authorization Code Flow + PKCE** (no client secret in the browser; treat it as a _public client_). ([Keycloak][1])
2. **Keycloak is designed to secure apps via standard OIDC endpoints**, and its “Securing Apps” guide is the reference for endpoints, tokens, and app integration patterns. ([Keycloak][1])
3. **Next.js OIDC examples typically use Auth.js / OIDC libraries** and explicitly demonstrate Code+PKCE patterns for web apps. ([Vercel][2])
4. **NestJS recommends Passport/JWT patterns** (guards/strategies) and you should validate JWTs using issuer/JWKS and enforce RBAC via guards/decorators. ([NestJS Documentation][3])
5. **Kubernetes probes (liveness/readiness/startup)** are core to production hygiene; prefer startup probe for slow boot, readiness for traffic gating, and careful liveness usage. ([Kubernetes][4])
6. **RabbitMQ dead-letter exchanges (DLX) are the standard mechanism** for handling poison messages and retry topologies. ([rabbitmq.com][5])
7. **Docker multi-stage builds + .dockerignore + cache-friendly layering** are the official container best practices. ([Docker Documentation][6])
8. **Camunda 8 self-managed is commonly deployed via Helm**, and Camunda provides production-focused Helm guidance. ([Camunda 8 Docs][7])
9. **Form.io provides Kubernetes deployment guidance** for running the API/PDF servers and recommends standard k8s resources. ([Form.io][8])
10. **Qdrant supports Kubernetes via Helm** (with caveats on ops features vs managed offerings), and some clouds provide tutorials using Helm. ([Qdrant][9])
11. **MongoDB in Kubernetes should be treated as stateful** (StatefulSets or operator approaches; consider availability/performance/security tradeoffs). ([CNCF][10])
12. **GitHub Actions CI/CD best practices emphasize clean workflow structure + secure defaults**, plus caching and staged jobs. ([GitHub][11])

---

## Phased plan (MVP → hardening)

### Phase 0 — Architecture decisions + repo baseline

**Objective:** Lock the key decisions and make the repo “buildable” with conventions.
**Outcomes:** Architecture doc, repo layout, env strategy, naming, ports, domains, and initial backlog.
**Exit criteria:** `pnpm -r build` works (or chosen package manager), and local bootstrap doc exists.
**Risks:** Over-design; unclear boundaries; auth decisions late cause rewrites.

**Tasks (5):**

1. Repo audit + monorepo layout (apps/packages/infra)
2. Env naming + config strategy (dev/stg/prod)
3. Service boundaries & API contracts draft
4. Auth model: roles, widgets entitlements mapping
5. Tooling standards: lint/format, commit hooks

---

### Phase 1 — Local dev environment + scaffolding

**Objective:** One-command dev environment with Docker Compose.
**Outcomes:** Compose stack (Keycloak, Postgres, Mongo, Qdrant, RabbitMQ, Redis, Camunda, Form.io), plus seed scripts.
**Exit criteria:** `docker compose up` yields working stack, health endpoints green.
**Risks:** Too many components at once; port collisions; secrets mishandling.

**Tasks (6):**

1. Docker Compose base + networks + volumes
2. Keycloak dev container + realm import hook
3. DB containers + init scripts (Postgres/Mongo/Qdrant)
4. RabbitMQ + DLX/retry topology baseline
5. Redis optional cache container
6. Dev docs (run, reset, seed)

---

### Phase 2 — Identity: Keycloak + Google IdP + RBAC

**Objective:** Working sign-in with Google through Keycloak and roles in tokens.
**Outcomes:** Keycloak realm export, Google IdP configured, client for Next.js, role/group mapping.
**Exit criteria:** Login works; token contains roles/claims needed; logout works.
**Risks:** Misconfigured redirect URIs; wrong token mapping; overly broad Google access.

**Tasks (6):**

1. Realm + client config (public client, PKCE, redirect URIs)
2. Google IdP setup in Keycloak + attribute/claim mapping
3. Roles/groups model for widgets + menus
4. Token claims contract (what frontend/backend rely on)
5. Local Keycloak “dev realm import” automation
6. Security checklist for auth (CORS, cookies vs storage)

---

### Phase 3 — Frontend: Next.js portal skeleton + dashboard widgets

**Objective:** Build the portal shell + role-based dashboard + navigation/quick access.
**Outcomes:** Next.js app router layout, dashboard grid, widget registry, role-based rendering, auth integration.
**Exit criteria:** After login → dashboard; role-based widgets show; menu & quick access working.
**Risks:** Auth library mismatch; widget sprawl; SSR vs client auth confusion.

**Tasks (7):**

1. Next.js app scaffold + UI kit + layout (top bar + right menu)
2. OIDC client integration (Code+PKCE) and session strategy
3. Role-based routing + widget authorization
4. Dashboard grid system (2–4 columns KPI, chart planes, alarms)
5. “Quick access” modules (Dashboard/Mini Apps/Inbox/Alarms/Profile)
6. Widget framework (registry, config schema, lazy loading)
7. Frontend tests (unit + component)

---

### Phase 4 — Backend: NestJS microservices + API gateway + auth guards

**Objective:** Secure microservices with JWT validation and expose APIs to frontend.
**Outcomes:** NestJS services scaffold, shared libs, JWT validation (issuer/JWKS), RBAC guards, OpenAPI.
**Exit criteria:** Protected endpoints require valid token; role checks pass; OpenAPI published.
**Risks:** Incorrect JWKS caching; inconsistent auth rules across services.

**Tasks (7):**

1. NestJS workspace scaffold (gateway + services + shared packages)
2. JWT validation against Keycloak (issuer/audience/JWKS)
3. RBAC decorators/guards + policy mapping (roles→permissions)
4. Service-to-service auth strategy (internal JWT or mTLS later)
5. API contracts (OpenAPI) for dashboard/widgets/alarms/inbox
6. Centralized logging/trace IDs baseline
7. Backend unit tests + integration tests harness

---

### Phase 5 — Data layer: Postgres + Mongo + Qdrant

**Objective:** Implement storage patterns, migrations, seeds, and repositories.
**Outcomes:** Postgres schema+migrations (Prisma recommended), Mongo models, Qdrant collections, seed workflows.
**Exit criteria:** `migrate + seed` works locally; repositories used by services; basic indexes in place.
**Risks:** Dual-write complexity; unclear source of truth; vector schema drift.

**Tasks (6):**

1. Postgres schema + Prisma migrations + seed
2. MongoDB models (audit/event store or document views)
3. Qdrant collections + embedding pipeline stub
4. Data access layer abstractions per service
5. Testcontainers-based integration tests for DBs
6. Backup/restore/dev reset scripts

---

### Phase 6 — Messaging: RabbitMQ orchestration + retries + DLQ

**Objective:** Event-driven orchestration between services with safe retries and DLQs.
**Outcomes:** Exchange/queue topology, message contracts, idempotency, outbox pattern (recommended).
**Exit criteria:** Events flow; retries work; poison messages land in DLQ; consumers idempotent.
**Risks:** Message loss, hot-loop retries, duplicate processing.

**Tasks (6):**

1. Define event naming + schema registry folder (JSON Schema)
2. RabbitMQ topology: main exchange + retry queues + DLX + DLQ ([rabbitmq.com][5])
3. NestJS RabbitMQ transport integration patterns ([NestJS Documentation][12])
4. Idempotency + de-dup strategy (message ID store)
5. Transactional outbox for Postgres (recommended)
6. Observability for async flows (correlation IDs, metrics)

---

### Phase 7 — CI/CD + Kubernetes readiness (MVP deploy)

**Objective:** Build, test, containerize, and deploy to k8s with production hygiene.
**Outcomes:** GitHub Actions pipeline, Dockerfiles, Helm charts, probes, ingress/TLS, secrets strategy.
**Exit criteria:** Dev deploy works; rollouts stable; probes configured; basic monitoring hooks.
**Risks:** Secret leakage; unstable probes; resource limits wrong; stateful services mismanaged.

**Tasks (8):**

1. GitHub Actions: lint/test/build matrix + cache ([GitHub][11])
2. Container builds: multi-stage + minimal images ([Docker Documentation][6])
3. Helm chart skeleton for gateway/services/web
4. K8s probes + requests/limits + HPA baseline ([Kubernetes][4])
5. Ingress + TLS (cert-manager assumed)
6. Secrets strategy (K8s Secrets now; External Secrets later)
7. Deploy stateful deps (or use managed): Postgres/Mongo/Qdrant/RabbitMQ
8. Optional: Camunda 8 + Form.io Helm/deploy plans ([Camunda 8 Docs][7])

> Assumptions (since you left blanks): **CI/CD = GitHub Actions**, **K8s packaging = Helm**, **Ingress = NGINX**, **TLS = cert-manager**, **MVP deploy = dev namespace first**.

---

### Phase 8 — Operations + Observability (Prod hardening)

**Objective:** Make the platform operable in production with strong telemetry, alerting, and recovery.
**Outcomes:** Traces/metrics/logs pipeline, dashboards/alerts, runbooks, backup/restore drills, perf baselines.
**Exit criteria:** SLOs defined; dashboards + alerts live; backup restore tested; perf baseline recorded.
**Risks:** Alert fatigue, missing telemetry, untested restores, capacity surprises.

**Tasks (6):**

1. Observability baseline (OpenTelemetry + OTLP exporter)
2. Centralized logging + trace correlation IDs
3. Metrics + dashboards + alert rules
4. SLOs/error budgets per service
5. Backup/restore drills for Postgres/Mongo/Qdrant/RabbitMQ
6. Load testing baseline + capacity notes

---

### Phase 9 — Security + Reliability Hardening

**Objective:** Raise the security baseline and operational resilience.
**Outcomes:** Secrets management, network policies, auth hardening, DR, chaos testing.
**Exit criteria:** Secrets externalized; network boundaries enforced; DR runbook exists.
**Risks:** Misconfigured policies causing outages; incomplete rotation.

**Tasks (6):**

1. Security hardening checklist (auth, headers, TLS, secrets)
2. Network policies + service-to-service isolation
3. Secrets management integration (External Secrets or Vault)
4. Data retention + privacy policy (PII classification)
5. DR/BCP runbook (RTO/RPO targets)
6. Chaos/resilience testing plan

---

### Phase 10 — Productization + Launch

**Objective:** Prepare FreeFlow for external users with product readiness, analytics, docs, and go-live checks.
**Outcomes:** Launch checklist, analytics/events plan, support docs, and post-launch monitoring.
**Exit criteria:** Launch checklist signed; telemetry and feedback loops active; docs complete.
**Risks:** Missing feedback loops; unclear support path; insufficient QA.

**Tasks (5):**

1. Product readiness checklist
2. Analytics + feedback instrumentation plan
3. Docs + onboarding flow
4. SLA + support model
5. Go-live and post-launch monitoring checklist

---

### Phase 11 — Post-Launch Optimization

**Objective:** Optimize performance, costs, and user experience after launch.
**Outcomes:** Performance tuning, cost controls, feedback-driven backlog.
**Exit criteria:** Perf improvements measured; cost reporting in place.
**Risks:** Regression from optimizations; cost focus over reliability.

**Tasks (4):**

1. Post-launch optimization checklist
2. Cost optimization plan
3. UX improvements backlog (feedback-driven)
4. Release retrospective + improvement plan

---

# Prompt Pack (copy/paste prompts per task)

> Every prompt below asks the assistant to output **FILE-BY-FILE**. Keep each as a separate run.

---

### PROMPT ID: P0.1

PHASE: Phase 0 — Architecture decisions + repo baseline
OBJECTIVE: Design the monorepo layout and baseline conventions for FreeFlow.
CONTEXT: Repo exists at [https://github.com/hpliew/FreeFlow.git](https://github.com/hpliew/FreeFlow.git) (assume no access); we will generate files/structure proposal only.
INPUTS I MUST FILL:

- Package manager: (pnpm/npm/yarn)
- Node version (e.g., 20)
  PROMPT TO RUN:
  <<<
  Act as Tech Lead. Propose a monorepo structure for FreeFlow (Next.js + NestJS microservices + infra).
  Output:

1. folder tree
2. file-by-file contents for: README.md, .editorconfig, .nvmrc, package.json (root), pnpm-workspace.yaml (if pnpm), turbo.json (optional), eslint/prettier configs.
   Include scripts: dev, build, test, lint, format, docker:up, docker:down.
   Use TypeScript across apps.
   FILE-BY-FILE format:
   FILE: path

   <content>

Keep it minimal but runnable.

> > >

DONE WHEN:

- Root scripts exist
- Lint/format config included
- Clear apps/ packages/ infra separation documented

---

### PROMPT ID: P0.2

PHASE: Phase 0 — Architecture decisions + repo baseline
OBJECTIVE: Define service boundaries and initial API surface for dashboard/widgets/alarms/inbox.
CONTEXT: You described dashboard widgets + quick access modules.
INPUTS I MUST FILL:

- Initial roles (e.g., Admin/Operator/Viewer)
- Widget types list (KPI/Chart/Alarm list/Inbox)
  PROMPT TO RUN:
  <<<
  Create an MVP architecture for FreeFlow:
- Next.js portal
- NestJS API gateway
- 3–5 microservices (suggest names and responsibilities)
  Produce:

1. architecture narrative (no diagrams needed)
2. OpenAPI YAML stubs for gateway endpoints:
   - /me
   - /dashboard/layout
   - /dashboard/widgets
   - /alarms
   - /inbox/tasks
   - /miniapps

3. A permissions matrix: role -> allowed widgets/menu items/endpoints.
   Output FILE-BY-FILE:

- docs/architecture.md
- docs/permissions-matrix.md
- docs/openapi/gateway.yaml

> > >

DONE WHEN:

- Services and responsibilities are clear
- OpenAPI stubs exist for the portal’s core pages
- Role-to-UI mapping is explicit

---

### PROMPT ID: P0.3

PHASE: Phase 0 — Architecture decisions + repo baseline
OBJECTIVE: Establish env/config strategy for dev/stg/prod (frontend + backend).
CONTEXT: Must be safe-by-default; secrets not committed.
INPUTS I MUST FILL:

- Public domain patterns (dev/stg/prod)
- Whether using cookies for session (yes/no)
  PROMPT TO RUN:
  <<<
  Design env/config strategy for FreeFlow for dev/stg/prod:
- Next.js environment variables (public vs server-only)
- NestJS config module pattern
- Secret handling guidance for local vs k8s
  Create FILES:
- docs/config.md
- apps/web/.env.example
- apps/api-gateway/.env.example
- packages/config/ (TypeScript config loader shared)
  Include validation (zod or joi).
  FILE-BY-FILE output.

> > >

DONE WHEN:

- .env.example files exist
- Config validation exists
- Docs show what is secret vs public

---

### PROMPT ID: P0.4

PHASE: Phase 0 — Architecture decisions + repo baseline
OBJECTIVE: Define logging/correlation ID standard across gateway/services/events.
CONTEXT: Needed for tracing UI actions → API calls → RabbitMQ events.
INPUTS I MUST FILL:

- Logging library preference (pino/winston)
  PROMPT TO RUN:
  <<<
  Create a minimal cross-service observability baseline:
- Correlation ID header (e.g., x-correlation-id)
- NestJS interceptor/middleware to set & propagate it
- RabbitMQ message headers propagation
  Output FILE-BY-FILE:
- packages/observability/src/correlation.ts
- packages/observability/src/logger.ts
- apps/api-gateway/src/main.ts changes
- docs/observability.md
  Keep it minimal and consistent.

> > >

DONE WHEN:

- Correlation ID is generated if missing
- Logged on every request
- Propagated into RabbitMQ publish/consume

---

### PROMPT ID: P0.5

PHASE: Phase 0 — Architecture decisions + repo baseline
OBJECTIVE: Add code quality tooling: lint, format, commit hooks.
CONTEXT: Should work for Next.js + NestJS + shared packages.
INPUTS I MUST FILL:

- Commit hook tool (husky/lefthook)
  PROMPT TO RUN:
  <<<
  Generate repo-wide code quality setup:
- ESLint + Prettier for TS/React/Nest
- lint-staged config
- commit hooks (run lint + typecheck on staged files)
  Output FILE-BY-FILE configs and update root package.json scripts.

> > >

DONE WHEN:

- `npm/pnpm run lint` and `format` scripts exist
- commit hooks configured
- consistent TS rules across apps/packages

---

## Phase 1 prompts

### PROMPT ID: P1.1

PHASE: Phase 1 — Local dev environment + scaffolding
OBJECTIVE: Create Docker Compose base stack for FreeFlow.
CONTEXT: Must include Keycloak, Postgres, Mongo, Qdrant, RabbitMQ, Redis, plus optional Camunda and Form.io behind profiles.
INPUTS I MUST FILL:

- Ports (or accept defaults)
- Keycloak version (default latest stable)
  PROMPT TO RUN:
  <<<
  Create docker-compose.yml for FreeFlow with services:
- keycloak (with realm import mount)
- postgres
- mongodb
- qdrant
- rabbitmq (management enabled)
- redis
  Optional via compose profiles:
- camunda8 (or camunda platform version you recommend)
- formio api (+ dependencies if needed)
  Include:
- named volumes
- healthchecks
- a `docker compose` override for dev if useful
  Output FILE-BY-FILE:
- infra/compose/docker-compose.yml
- infra/compose/README.md (run, reset, logs, ports)

> > >

DONE WHEN:

- `docker compose up` design is clear
- Profiles documented for optional components
- Healthchecks included

---

### PROMPT ID: P1.2

PHASE: Phase 1 — Local dev environment + scaffolding
OBJECTIVE: Automate Keycloak realm import for dev.
CONTEXT: Use Keycloak realm export JSON mounted into container.
INPUTS I MUST FILL:

- Realm name (default: freeflow)
- Client ID (default: freeflow-web)
  PROMPT TO RUN:
  <<<
  Generate a minimal Keycloak realm export for dev:
- realm: freeflow
- public client for Next.js using PKCE
- redirect URIs for [http://localhost:3000/](http://localhost:3000/)\*
- web origins localhost
- roles: Admin, Operator, Viewer
  Output FILE-BY-FILE:
- infra/keycloak/freeflow-realm.json
- infra/keycloak/README.md (how to import in compose)
  Keep it minimal but valid.

> > >

DONE WHEN:

- Realm JSON exists with client + roles
- Redirect URIs and web origins set for localhost

---

### PROMPT ID: P1.3

PHASE: Phase 1 — Local dev environment + scaffolding
OBJECTIVE: Add DB init scripts and local seed runner wiring.
CONTEXT: Postgres migrations/seed later; now ensure containers start cleanly.
INPUTS I MUST FILL:

- Postgres db/user/pass defaults
  PROMPT TO RUN:
  <<<
  Create local DB init wiring:
- Postgres: create database and user (if needed)
- Mongo: create initial admin user (dev only)
- Qdrant: document how to create collection later
  Output FILE-BY-FILE:
- infra/db/postgres/init.sql
- infra/db/mongo/init.js (or README with steps)
- infra/db/README.md

> > >

DONE WHEN:

- Compose can mount init scripts
- Clear dev-only credentials guidance included

---

### PROMPT ID: P1.4

PHASE: Phase 1 — Local dev environment + scaffolding
OBJECTIVE: RabbitMQ baseline topology (main exchange + DLX/DLQ).
CONTEXT: Use RabbitMQ DLX guidance; support retries later. ([rabbitmq.com][5])
INPUTS I MUST FILL:

- Exchange name (default: freeflow.events)
  PROMPT TO RUN:
  <<<
  Generate RabbitMQ topology bootstrap:
- main topic exchange: freeflow.events
- DLX exchange: freeflow.events.dlx
- DLQ queue: freeflow.events.dlq
  Provide:
- definitions.json for rabbitmq import OR a bootstrap script/README with rabbitmqadmin commands
  Output FILE-BY-FILE:
- infra/rabbitmq/definitions.json (preferred)
- infra/rabbitmq/README.md

> > >

DONE WHEN:

- Topology is reproducible in dev
- DLQ exists and is bound to DLX

---

### PROMPT ID: P1.5

PHASE: Phase 1 — Local dev environment + scaffolding
OBJECTIVE: Create developer bootstrap commands and reset scripts.
CONTEXT: Must be easy for new devs.
INPUTS I MUST FILL:

- OS target (mac/linux/windows)
  PROMPT TO RUN:
  <<<
  Create developer experience scripts:
- makefile or npm scripts for: up, down, reset, logs, seed (placeholder), health
  Output FILE-BY-FILE:
- Makefile (or scripts/)
- docs/dev-setup.md
  Update root package.json scripts accordingly.

> > >

DONE WHEN:

- One-command up/down/reset exists
- Docs are step-by-step and accurate

---

## Phase 2 prompts (Keycloak + Google IdP + RBAC)

### PROMPT ID: P2.1

PHASE: Phase 2 — Identity: Keycloak + Google IdP + RBAC
OBJECTIVE: Configure Keycloak client for Next.js (PKCE) with correct redirect URIs.
CONTEXT: Public client, Authorization Code + PKCE; no browser client secret. ([curity.io][13])
INPUTS I MUST FILL:

- Real domains for dev/stg/prod
- Client ID
  PROMPT TO RUN:
  <<<
  Produce an updated Keycloak realm export snippet and doc for a Next.js app (public client + PKCE):
- Redirect URIs for dev/stg/prod
- Web Origins set safely
- Post logout redirect URIs
  Output FILE-BY-FILE:
- infra/keycloak/freeflow-realm.json (updated)
- docs/auth/keycloak-client.md

> > >

DONE WHEN:

- Redirects cover dev/stg/prod
- PKCE requirement is set
- No secrets required by frontend

---

### PROMPT ID: P2.2

PHASE: Phase 2 — Identity: Keycloak + Google IdP + RBAC
OBJECTIVE: Add Google as IdP in Keycloak and map claims.
CONTEXT: “Sign in with Google” via Keycloak IdP federation.
INPUTS I MUST FILL:

- Google OAuth client ID/secret (placeholders ok)
- Allowed Google domains (optional)
  PROMPT TO RUN:
  <<<
  Explain and generate configuration steps for adding Google as an Identity Provider in Keycloak:
- Required Google OAuth settings
- Keycloak IdP configuration fields
- How to map email/name into Keycloak user attributes
  Provide FILES:
- docs/auth/google-idp-setup.md
- infra/keycloak/notes/google-idp.json (example config mapping, if applicable)
  Keep it practical and safe (no secrets committed).

> > >

DONE WHEN:

- Step-by-step Google + Keycloak config is documented
- Claim mapping approach is stated

---

### PROMPT ID: P2.3

PHASE: Phase 2 — Identity: Keycloak + Google IdP + RBAC
OBJECTIVE: Define RBAC model for UI widgets + backend permissions.
CONTEXT: Dashboard is role-based; menu/quick access also role-based.
INPUTS I MUST FILL:

- Roles list (or accept Admin/Operator/Viewer)
- Widget catalog (names)
  PROMPT TO RUN:
  <<<
  Create an RBAC model:
- Roles -> permissions
- Permissions -> widgets/menu/endpoints
- Include examples for KPI widgets, chart planes, alarms, inbox
  Output FILE-BY-FILE:
- docs/auth/rbac.md
- docs/auth/permissions.json (machine-readable)

> > >

DONE WHEN:

- A single source of truth permissions.json exists
- Mapping covers UI + API

---

### PROMPT ID: P2.4

PHASE: Phase 2 — Identity: Keycloak + Google IdP + RBAC
OBJECTIVE: Define token claims contract used by frontend/backend.
CONTEXT: Backend validates JWT and enforces RBAC. ([Stack Overflow][14])
INPUTS I MUST FILL:

- Expected claim locations (realm_access vs resource_access)
  PROMPT TO RUN:
  <<<
  Define a “token contract” document:
- required claims (iss, aud, sub, email, exp)
- where roles live in Keycloak tokens
- how frontend extracts roles safely
- how backend validates issuer/audience/JWKS and reads roles
  Output FILE-BY-FILE:
- docs/auth/token-contract.md
- packages/auth-contract/src/token.ts (TypeScript types + helpers)

> > >

DONE WHEN:

- Token fields are explicitly defined
- Shared TS types exist for consistent parsing

---

### PROMPT ID: P2.5

PHASE: Phase 2 — Identity: Keycloak + Google IdP + RBAC
OBJECTIVE: Create an auth security checklist (MVP).
CONTEXT: Avoid common SPA auth pitfalls; align with PKCE guidance. ([curity.io][13])
INPUTS I MUST FILL:

- Whether you’ll use cookies for session (yes/no)
  PROMPT TO RUN:
  <<<
  Create a concise security checklist for FreeFlow auth:
- PKCE/public client rules
- token storage guidance
- CORS/CSP basics
- logout and session expiration
- local dev cautions
  Output FILE-BY-FILE:
- docs/auth/security-checklist.md

> > >

DONE WHEN:

- Checklist is actionable
- Calls out “no client secret in browser”
- Mentions CORS/CSP and safe token storage

---

## Phase 3 prompts (Next.js portal)

### PROMPT ID: P3.1

PHASE: Phase 3 — Frontend: Next.js portal skeleton + dashboard widgets
OBJECTIVE: Scaffold Next.js app shell with top bar + right menu + quick access.
CONTEXT: After login → dashboard landing.
INPUTS I MUST FILL:

- UI library choice (MUI/AntD/Tailwind/shadcn)
  PROMPT TO RUN:
  <<<
  Generate a Next.js (App Router) frontend skeleton for FreeFlow:
- Layout: top bar, right-side menu, content area
- Quick access: Dashboard, Mini Apps, Task Inbox, Alarms, Profile
- Responsive design; dashboard grid supports 2–4 column KPI tiles + larger planes
  Output FILE-BY-FILE:
- apps/web/package.json
- apps/web/app/layout.tsx
- apps/web/app/page.tsx (dashboard)
- apps/web/components/\* (Nav, QuickAccess, Grid)
  Keep code minimal and runnable.

> > >

DONE WHEN:

- `npm/pnpm run dev` starts
- UI shell matches requirements
- Dashboard grid present

---

### PROMPT ID: P3.2

PHASE: Phase 3 — Frontend: Next.js portal skeleton + dashboard widgets
OBJECTIVE: Implement OIDC login with Keycloak (PKCE).
CONTEXT: Use Authorization Code + PKCE for web; integrate with Next.js safely. ([Vercel][2])
INPUTS I MUST FILL:

- Keycloak issuer URL
- Realm, client id
- Redirect URI
  PROMPT TO RUN:
  <<<
  Implement Keycloak OIDC (Auth Code + PKCE) in Next.js:
- Login button -> redirect to Keycloak
- Callback route to complete login
- Store session safely (recommend approach; implement MVP)
- Logout route
  Output FILE-BY-FILE changes for apps/web including:
- app/auth/login/page.tsx
- app/auth/callback/page.tsx
- app/auth/logout/route.ts
- lib/auth/\* (oidc config + helpers)
  Include notes for dev env vars.

> > >

DONE WHEN:

- Login redirects to Keycloak and returns authenticated state
- Roles are accessible in UI
- Logout clears session and redirects out

---

### PROMPT ID: P3.3

PHASE: Phase 3 — Frontend: Next.js portal skeleton + dashboard widgets
OBJECTIVE: Role-based widget rendering and route guarding.
CONTEXT: Use permissions.json from Phase 2.
INPUTS I MUST FILL:

- Path for permissions.json
  PROMPT TO RUN:
  <<<
  Implement RBAC in Next.js:
- Route guard for protected pages
- Widget guard: only render widgets allowed by permissions.json
- Example widgets: KPI tile, chart plane (mock data), alarms list
  Output FILE-BY-FILE:
- apps/web/lib/rbac.ts
- apps/web/components/widgets/\*
- apps/web/app/dashboard/page.tsx

> > >

DONE WHEN:

- Different roles show different widgets
- Unauthorized routes redirect to login/403

---

### PROMPT ID: P3.4

PHASE: Phase 3 — Frontend: Next.js portal skeleton + dashboard widgets
OBJECTIVE: Widget registry + configuration schema.
CONTEXT: Multiple widget types; future extensibility.
INPUTS I MUST FILL:

- Widget types list
  PROMPT TO RUN:
  <<<
  Create a widget framework:
- Widget registry (id -> component)
- Widget config schema (zod)
- Layout config fetched from backend (mock for now)
  Output FILE-BY-FILE:
- apps/web/lib/widgets/registry.ts
- apps/web/lib/widgets/schema.ts
- apps/web/lib/widgets/types.ts
- apps/web/components/dashboard/WidgetRenderer.tsx

> > >

DONE WHEN:

- New widget types can be added by registering
- Layout config drives rendering

---

### PROMPT ID: P3.5

PHASE: Phase 3 — Frontend: Next.js portal skeleton + dashboard widgets
OBJECTIVE: Frontend tests (unit/component).
CONTEXT: Use Testing Library + Vitest or Jest.
INPUTS I MUST FILL:

- Test runner preference (vitest/jest)
  PROMPT TO RUN:
  <<<
  Add frontend testing:
- Configure test runner + Testing Library
- Add tests for: RBAC guard, WidgetRenderer, QuickAccess menu
  Output FILE-BY-FILE:
- apps/web/test/\* (configs)
- apps/web/components/**/**tests\*_/_
  Update package.json scripts: test, test:watch.

> > >

DONE WHEN:

- `run test` passes locally
- Core RBAC and widget rendering covered

---

## Phase 4 prompts (NestJS microservices + auth)

### PROMPT ID: P4.1

PHASE: Phase 4 — Backend: NestJS microservices + API gateway + auth guards
OBJECTIVE: Scaffold NestJS gateway + initial services + shared packages.
CONTEXT: Use monorepo structure from Phase 0.
INPUTS I MUST FILL:

- Services list (or accept: identity-profile, dashboard, alarms, inbox)
  PROMPT TO RUN:
  <<<
  Generate NestJS backend scaffold:
- apps/api-gateway
- services/dashboard-service
- services/alarm-service
- services/inbox-service
- packages/shared (dto, errors)
  Add basic health endpoints (/health) for each.
  Output FILE-BY-FILE with minimal runnable code and scripts.

> > >

DONE WHEN:

- Services start locally
- Each has /health
- Shared DTO package exists

---

### PROMPT ID: P4.2

PHASE: Phase 4 — Backend: NestJS microservices + API gateway + auth guards
OBJECTIVE: Validate Keycloak JWT via issuer + JWKS, enforce auth guard.
CONTEXT: JWT validation best practice: verify issuer/audience and keys. ([Stack Overflow][14])
INPUTS I MUST FILL:

- Keycloak issuer URL
- Audience/client id
  PROMPT TO RUN:
  <<<
  Implement Keycloak JWT validation in NestJS:
- JWKS fetch + caching
- Verify iss, aud, exp
- AuthGuard for protected routes
- Extract roles from token into request.user
  Output FILE-BY-FILE:
- packages/auth/src/jwks.ts
- packages/auth/src/guards/jwt.guard.ts
- packages/auth/src/decorators/user.decorator.ts
- apply guard in api-gateway sample controller

> > >

DONE WHEN:

- Protected endpoint rejects invalid tokens
- Valid token yields user + roles in request

---

### PROMPT ID: P4.3

PHASE: Phase 4 — Backend: NestJS microservices + API gateway + auth guards
OBJECTIVE: RBAC decorators/guards using permissions.json contract.
CONTEXT: Enforce same policy as frontend.
INPUTS I MUST FILL:

- Permissions source (file path / config)
  PROMPT TO RUN:
  <<<
  Create RBAC for NestJS:
- @RequirePermission('dashboard:view') decorator
- Guard that checks mapped permissions from roles
- Central permissions loader (permissions.json)
  Output FILE-BY-FILE:
- packages/rbac/\*
- api-gateway example endpoints with RBAC applied

> > >

DONE WHEN:

- Permission guard blocks unauthorized roles
- Permissions are defined in one place and imported

---

### PROMPT ID: P4.4

PHASE: Phase 4 — Backend: NestJS microservices + API gateway + auth guards
OBJECTIVE: Implement APIs for dashboard layout + widgets + quick access.
CONTEXT: Use OpenAPI stubs from Phase 0.
INPUTS I MUST FILL:

- Widget layout storage choice (Postgres/Mongo)
  PROMPT TO RUN:
  <<<
  Implement minimal API endpoints in api-gateway:
- GET /me
- GET /dashboard/layout
- GET /dashboard/widgets
- GET /alarms
- GET /inbox/tasks
  Return mock data first, shaped for the frontend widget framework.
  Output FILE-BY-FILE controllers/services + DTOs.

> > >

DONE WHEN:

- Endpoints exist and return consistent JSON
- Frontend can render dashboard from these endpoints

---

### PROMPT ID: P4.5

PHASE: Phase 4 — Backend: NestJS microservices + API gateway + auth guards
OBJECTIVE: Add backend tests (unit + integration harness).
CONTEXT: Use Jest (default) and add Testcontainers later.
INPUTS I MUST FILL:

- Test runner (jest)
  PROMPT TO RUN:
  <<<
  Add backend testing:
- Unit tests for JWT guard and RBAC guard (mock JWKS)
- Controller tests for /me and /dashboard/layout
  Output FILE-BY-FILE:
- packages/auth/**/**tests\*_/_
- packages/rbac/**/**tests\*_/_
- apps/api-gateway/test/\*
  Add scripts: test, test:cov.

> > >

DONE WHEN:

- `run test` passes
- Guards are covered with meaningful tests

---

## Phase 5 prompts (Postgres/Mongo/Qdrant)

### PROMPT ID: P5.1

PHASE: Phase 5 — Data layer: Postgres + Mongo + Qdrant
OBJECTIVE: Postgres schema + Prisma migrations + seed.
CONTEXT: Prisma Migrate supports SQL migration files and seeding workflows. ([NestJS Documentation][15])
INPUTS I MUST FILL:

- Entities needed (e.g., dashboard_layout, widget_config, user_profile)
  PROMPT TO RUN:
  <<<
  Implement Postgres data layer with Prisma for NestJS:
- schema.prisma with core entities
- migrations
- seed script with sample layouts per role
  Output FILE-BY-FILE:
- packages/db-postgres/prisma/schema.prisma
- packages/db-postgres/prisma/seed.ts
- packages/db-postgres/src/client.ts
- docs/data/postgres.md

> > >

DONE WHEN:

- `prisma migrate dev` and `prisma db seed` flows are documented
- Seed creates role-based dashboard layouts

---

### PROMPT ID: P5.2

PHASE: Phase 5 — Data layer: Postgres + Mongo + Qdrant
OBJECTIVE: MongoDB model setup for documents (audit/events/views).
CONTEXT: Mongo is stateful; treat carefully in k8s. ([CNCF][10])
INPUTS I MUST FILL:

- What Mongo stores (audit logs / task docs / alarm history)
  PROMPT TO RUN:
  <<<
  Add MongoDB integration for NestJS:
- Mongoose module setup in a shared package
- Example model (AuditLog or AlarmHistory)
- Repository/service pattern
  Output FILE-BY-FILE:
- packages/db-mongo/\*
- docs/data/mongo.md

> > >

DONE WHEN:

- Mongo module connects via env vars
- Example model CRUD works

---

### PROMPT ID: P5.3

PHASE: Phase 5 — Data layer: Postgres + Mongo + Qdrant
OBJECTIVE: Qdrant client package + collection bootstrap.
CONTEXT: Qdrant supports Helm deployment; collections must be created. ([Qdrant][9])
INPUTS I MUST FILL:

- Collection name(s)
- Vector size + distance metric
  PROMPT TO RUN:
  <<<
  Create a Qdrant integration package:
- Qdrant client wrapper
- Bootstrap function to ensure collection exists
- Example “upsert vector” and “search” methods
  Output FILE-BY-FILE:
- packages/db-qdrant/\*
- docs/data/qdrant.md
  Include local dev steps using docker-compose qdrant.

> > >

DONE WHEN:

- Package can create/check collection
- Example search works with mock vectors

---

### PROMPT ID: P5.4

PHASE: Phase 5 — Data layer: Postgres + Mongo + Qdrant
OBJECTIVE: Integrate repositories into one service (dashboard-service).
CONTEXT: Use Postgres for layout configs; optional Mongo for audit.
INPUTS I MUST FILL:

- Which service gets which datastore
  PROMPT TO RUN:
  <<<
  Wire data repositories into dashboard-service:
- Read dashboard layout from Postgres
- Write audit log to Mongo (optional)
- Add endpoints in gateway to fetch the data
  Output FILE-BY-FILE changes across service + gateway.

> > >

DONE WHEN:

- Real data replaces mock for at least one flow
- Seeded layout renders in UI

---

### PROMPT ID: P5.5

PHASE: Phase 5 — Data layer: Postgres + Mongo + Qdrant
OBJECTIVE: Testcontainers integration tests for Postgres/Mongo.
CONTEXT: Integration tests should spin up real deps in CI.
INPUTS I MUST FILL:

- CI runner OS (ubuntu-latest default)
  PROMPT TO RUN:
  <<<
  Add integration tests using Testcontainers for Node:
- Postgres container: test Prisma queries
- Mongo container: test Mongoose model
  Output FILE-BY-FILE:
- packages/db-postgres/test/\*
- packages/db-mongo/test/\*
- docs/testing/integration.md

> > >

DONE WHEN:

- Tests run locally
- Clear notes for CI execution

---

## Phase 6 prompts (RabbitMQ orchestration)

### PROMPT ID: P6.1

PHASE: Phase 6 — Messaging: RabbitMQ orchestration + retries + DLQ
OBJECTIVE: Define event contracts and schemas.
CONTEXT: Contract-first for async reduces drift.
INPUTS I MUST FILL:

- Events list (e.g., task.created, alarm.raised)
  PROMPT TO RUN:
  <<<
  Create an event contract folder:
- JSON Schema for each event
- Naming/versioning rules
- Correlation ID + idempotency key requirements
  Output FILE-BY-FILE:
- docs/events/README.md
- docs/events/schemas/\*.json

> > >

DONE WHEN:

- Each event has schema and example payload
- Versioning strategy defined

---

### PROMPT ID: P6.2

PHASE: Phase 6 — Messaging: RabbitMQ orchestration + retries + DLQ
OBJECTIVE: Implement retry topology with TTL queues + DLX.
CONTEXT: DLX patterns are standard for retries/poison messages. ([rabbitmq.com][5])
INPUTS I MUST FILL:

- Retry delays (e.g., 30s/5m/30m)
  PROMPT TO RUN:
  <<<
  Design RabbitMQ retry topology:
- main exchange
- retry exchanges/queues with x-message-ttl
- DLX back to main
- final DLQ
  Provide FILE-BY-FILE:
- infra/rabbitmq/definitions.json (updated)
- docs/messaging/retry-dlx.md

> > >

DONE WHEN:

- Retry queues exist with TTL and DLX
- DLQ captures poison messages after N retries

---

### PROMPT ID: P6.3

PHASE: Phase 6 — Messaging: RabbitMQ orchestration + retries + DLQ
OBJECTIVE: NestJS microservices integration using RabbitMQ transport.
CONTEXT: Follow NestJS RabbitMQ microservices guidance. ([NestJS Documentation][12])
INPUTS I MUST FILL:

- Queue naming conventions
  PROMPT TO RUN:
  <<<
  Implement RabbitMQ messaging in NestJS:
- Publisher module (shared)
- Consumer example in alarm-service
- Message headers: correlationId, eventId
- Acknowledge/nack strategy: no hot loops
  Output FILE-BY-FILE:
- packages/messaging-rabbitmq/\*
- services/alarm-service/src/consumers/\*
- docs/messaging/nestjs-rabbitmq.md

> > >

DONE WHEN:

- One service can publish and another can consume
- Ack/nack behavior documented

---

### PROMPT ID: P6.4

PHASE: Phase 6 — Messaging: RabbitMQ orchestration + retries + DLQ
OBJECTIVE: Idempotency & de-dup store for consumers.
CONTEXT: At-least-once delivery requires idempotent handlers. ([rabbitmq.com][16])
INPUTS I MUST FILL:

- De-dup store location (Postgres table or Redis)
  PROMPT TO RUN:
  <<<
  Implement idempotency for RabbitMQ consumers:
- eventId required in message
- store processed eventIds (Postgres or Redis)
- skip duplicates safely
  Output FILE-BY-FILE:
- packages/messaging-idempotency/\*
- one consumer updated to use it

> > >

DONE WHEN:

- Duplicate messages don’t double-apply side effects
- eventId is required and validated

---

### PROMPT ID: P6.5

PHASE: Phase 6 — Messaging: RabbitMQ orchestration + retries + DLQ
OBJECTIVE: Transactional outbox pattern (Postgres) for reliable publishing.
CONTEXT: Reduces dual-write issues for DB + message publish.
INPUTS I MUST FILL:

- Which events use outbox first
  PROMPT TO RUN:
  <<<
  Implement a minimal transactional outbox in Postgres:
- outbox table
- helper to write event + domain change in one tx
- worker/cron to publish pending events to RabbitMQ
  Output FILE-BY-FILE:
- packages/outbox-postgres/\*
- docs/messaging/outbox.md

> > >

DONE WHEN:

- Outbox table + worker exists
- Events publish reliably even on restarts

---

## Phase 7 prompts (CI/CD + Kubernetes)

### PROMPT ID: P7.1

PHASE: Phase 7 — CI/CD + Kubernetes readiness
OBJECTIVE: GitHub Actions pipeline for lint/test/build with caching.
CONTEXT: Follow GitHub Actions best practices; use Docker build cache where applicable. ([GitHub][11])
INPUTS I MUST FILL:

- Node version
- Registry (GHCR/ECR/etc)
  PROMPT TO RUN:
  <<<
  Create GitHub Actions workflows for FreeFlow:
- PR: lint + unit tests + build
- main: build + containerize + push images
  Add caching for node modules and Docker layers where sensible.
  Output FILE-BY-FILE:
- .github/workflows/ci.yml
- .github/workflows/release.yml
- docs/cicd/github-actions.md

> > >

DONE WHEN:

- PR checks run fast with cache
- Main branch builds and pushes images

---

### PROMPT ID: P7.2

PHASE: Phase 7 — CI/CD + Kubernetes readiness
OBJECTIVE: Production-friendly Dockerfiles for Next.js and NestJS.
CONTEXT: Multi-stage builds and minimal runtime images are recommended. ([Docker Documentation][6])
INPUTS I MUST FILL:

- Node base image preference (alpine/slim)
  PROMPT TO RUN:
  <<<
  Generate Dockerfiles:
- apps/web (Next.js) production build
- apps/api-gateway and services/\* (NestJS) production build
  Use multi-stage builds, .dockerignore, and non-root user.
  Output FILE-BY-FILE:
- apps/web/Dockerfile
- apps/api-gateway/Dockerfile
- services/\*/Dockerfile
- .dockerignore
- docs/containers.md

> > >

DONE WHEN:

- Images are small and secure by default
- Build works locally and in CI

---

### PROMPT ID: P7.3

PHASE: Phase 7 — CI/CD + Kubernetes readiness
OBJECTIVE: Helm chart skeleton for web + gateway + services.
CONTEXT: MVP deploy to dev namespace first.
INPUTS I MUST FILL:

- K8s namespace names (dev/stg/prod)
- Ingress hostnames
  PROMPT TO RUN:
  <<<
  Create Helm charts for FreeFlow:
- charts/freeflow (umbrella) with subcharts or templates for:
  - web
  - api-gateway
  - dashboard-service
  - alarm-service
  - inbox-service
    Include:

- ConfigMaps/Secrets wiring
- service accounts
- resource requests/limits
  Output FILE-BY-FILE:
- infra/helm/freeflow/Chart.yaml
- infra/helm/freeflow/values.yaml
- infra/helm/freeflow/templates/\*
- docs/k8s/helm.md

> > >

DONE WHEN:

- `helm template` renders valid manifests
- values.yaml controls env-specific settings

---

### PROMPT ID: P7.4

PHASE: Phase 7 — CI/CD + Kubernetes readiness
OBJECTIVE: Add probes + production deployment hygiene.
CONTEXT: Use readiness/liveness/startup probe guidance. ([Kubernetes][4])
INPUTS I MUST FILL:

- Health endpoint paths (default /health)
  PROMPT TO RUN:
  <<<
  Update Helm templates to include:
- startupProbe (for slower services)
- readinessProbe
- livenessProbe (careful defaults)
- HPA stub
- PDB stub
- rolling update strategy
  Output FILE-BY-FILE:
- infra/helm/freeflow/templates/deployment.yaml (or per service)
- docs/k8s/probes-and-resources.md

> > >

DONE WHEN:

- Probes are configured per workload
- Resource requests/limits exist
- HPA/PDB stubs present

---

### PROMPT ID: P7.5

PHASE: Phase 7 — CI/CD + Kubernetes readiness
OBJECTIVE: Deploy stateful dependencies plan (managed vs in-cluster).
CONTEXT: Mongo/Postgres/Qdrant/RabbitMQ are stateful; operators often preferred. ([CNCF][10])
INPUTS I MUST FILL:

- Will you use managed services in prod? (yes/no)
  PROMPT TO RUN:
  <<<
  Create a deployment strategy doc for stateful dependencies:
- dev: docker-compose
- stg/prod: recommend managed where possible
  If in-cluster:
- RabbitMQ (operator/chart), DLX considerations
- MongoDB (operator/StatefulSet guidance)
- Qdrant (Helm chart caveats)
- Postgres (operator or managed)
  Output FILE-BY-FILE:
- docs/k8s/stateful-deps.md
- infra/helm/deps/ (optional chart values placeholders)

> > >

DONE WHEN:

- Clear recommendation per dependency
- Notes risks/backup/upgrade strategy

---

### PROMPT ID: P7.6

PHASE: Phase 7 — CI/CD + Kubernetes readiness
OBJECTIVE: Optional Camunda 8 + Form.io deployment plan in k8s.
CONTEXT: Camunda production Helm docs + Form.io k8s guide. ([Camunda 8 Docs][7])
INPUTS I MUST FILL:

- Camunda version (8.x) and whether you need Web Modeler
  PROMPT TO RUN:
  <<<
  Produce a practical deployment plan for:
- Camunda 8 (Helm, production-focused values)
- Form.io (API/PDF servers) Kubernetes deployment approach
  Output FILE-BY-FILE:
- docs/k8s/camunda.md
- docs/k8s/formio.md
- infra/helm/camunda-values.dev.yaml (starter)
- infra/helm/formio-values.dev.yaml (starter)

> > >

DONE WHEN:

- Steps to install via Helm are documented
- Starter values files exist (no secrets)

---

### PROMPT ID: P7.7

PHASE: Phase 7 — CI/CD + Kubernetes readiness
OBJECTIVE: Add image scanning + secret scanning to CI.
CONTEXT: DevSecOps hygiene; avoid leaking credentials.
INPUTS I MUST FILL:

- Preferred scanners (Trivy/Grype/Gitleaks)
  PROMPT TO RUN:
  <<<
  Enhance GitHub Actions:
- add dependency scanning (npm audit optional)
- add secret scanning (gitleaks)
- add container image scan (trivy) on built images
  Output FILE-BY-FILE:
- .github/workflows/security.yml
- docs/cicd/security-checks.md

> > >

DONE WHEN:

- Security workflow runs on PR + main
- Fails on critical findings (configurable)

---

### PROMPT ID: P7.8

PHASE: Phase 7 — CI/CD + Kubernetes readiness
OBJECTIVE: Release strategy (versioning, env promotion, approvals).
CONTEXT: dev→stg→prod with manual gates.
INPUTS I MUST FILL:

- Versioning scheme (semver / git sha)
  PROMPT TO RUN:
  <<<
  Design a lightweight release process for FreeFlow:
- tagging strategy
- environment promotion steps
- GitHub environments approvals
- Helm values per env
  Output FILE-BY-FILE:
- docs/release-process.md
- infra/helm/environments/dev-values.yaml
- infra/helm/environments/stg-values.yaml
- infra/helm/environments/prod-values.yaml

> > >

DONE WHEN:

- Clear promotion workflow exists
- Env-specific values files exist

---

## Phase 8 prompts (Operations + Observability)

### PROMPT ID: P8.1

PHASE: Phase 8 — Operations + Observability (Prod hardening)
OBJECTIVE: OpenTelemetry baseline (traces + metrics).
CONTEXT: Instrument NestJS + Next.js and export via OTLP.
INPUTS I MUST FILL:

- Telemetry backend (Tempo/Jaeger/Datadog/etc)
  PROMPT TO RUN:
  <<<
  Add OpenTelemetry guidance for FreeFlow:
- NestJS tracing + metrics
- Next.js tracing (optional)
- OTLP exporter configuration
  Output FILE-BY-FILE:
- docs/observability/otel.md
- infra/helm/otel-collector-values.dev.yaml (starter)

> > >

DONE WHEN:

- Clear setup steps for OTel exist
- Starter collector values exist (no secrets)

---

### PROMPT ID: P8.2

PHASE: Phase 8 — Operations + Observability (Prod hardening)
OBJECTIVE: Centralized logging + trace correlation IDs.
CONTEXT: Structured logs + log shipping.
INPUTS I MUST FILL:

- Log stack (Loki/ELK/Datadog/etc)
  PROMPT TO RUN:
  <<<
  Define a logging standard for FreeFlow:
- structured log format
- correlation IDs
- shipping to the chosen stack
  Output FILE-BY-FILE:
- docs/observability/logging.md
- infra/helm/logging-values.dev.yaml (optional)

> > >

DONE WHEN:

- Log format and correlation guidance exists
- Shipping guidance documented

---

### PROMPT ID: P8.3

PHASE: Phase 8 — Operations + Observability (Prod hardening)
OBJECTIVE: Metrics + dashboards + alerts.
CONTEXT: Prometheus/Grafana or equivalent.
INPUTS I MUST FILL:

- Metrics stack (Prometheus/Grafana/etc)
  PROMPT TO RUN:
  <<<
  Create a monitoring plan for FreeFlow:
- key service metrics
- example alert rules
- dashboard list
  Output FILE-BY-FILE:
- docs/observability/metrics-alerts.md
- infra/helm/monitoring-values.dev.yaml (starter)

> > >

DONE WHEN:

- Metrics/alerts/dashboards documented
- Starter values exist (no secrets)

---

### PROMPT ID: P8.4

PHASE: Phase 8 — Operations + Observability (Prod hardening)
OBJECTIVE: SLOs + error budgets per service.
CONTEXT: Define availability and latency targets for key endpoints.
INPUTS I MUST FILL:

- Key user journeys (list)
  PROMPT TO RUN:
  <<<
  Define SLOs for FreeFlow:
- availability SLOs
- latency SLOs
- error budget policies
  Output FILE-BY-FILE:
- docs/observability/slo.md

> > >

DONE WHEN:

- SLOs and error budgets documented

---

### PROMPT ID: P8.5

PHASE: Phase 8 — Operations + Observability (Prod hardening)
OBJECTIVE: Backup/restore drills for stateful dependencies.
CONTEXT: Postgres + Mongo + Qdrant + RabbitMQ.
INPUTS I MUST FILL:

- Cloud provider (AWS/GCP/Azure/Other)
  PROMPT TO RUN:
  <<<
  Create backup and restore guidance:
- per dependency
- schedules + retention
- restore drills checklist
  Output FILE-BY-FILE:
- docs/ops/backups.md

> > >

DONE WHEN:

- Backup/restore steps documented
- Drill checklist exists

---

### PROMPT ID: P8.6

PHASE: Phase 8 — Operations + Observability (Prod hardening)
OBJECTIVE: Load/performance baseline.
CONTEXT: Validate latency and capacity assumptions.
INPUTS I MUST FILL:

- Target RPS or load profile
  PROMPT TO RUN:
  <<<
  Create a load testing plan:
- target scenarios
- thresholds
- sample k6 scripts
  Output FILE-BY-FILE:
- docs/ops/perf-testing.md
- scripts/perf/k6/ (optional)

> > >

DONE WHEN:

- Load testing plan exists
- Example scripts provided

---

## Phase 9 prompts (Security + Reliability Hardening)

### PROMPT ID: P9.1

PHASE: Phase 9 — Security + Reliability Hardening
OBJECTIVE: Security hardening checklist.
CONTEXT: tighten auth, headers, TLS, and secret handling.
INPUTS I MUST FILL:

- Target environments (stg/prod)
  PROMPT TO RUN:
  <<<
  Create a security hardening checklist for FreeFlow:
- auth/JWT validation
- HTTP security headers
- TLS and HSTS
- secret storage/rotation
  Output FILE-BY-FILE:
- docs/security/hardening.md

> > >

DONE WHEN:

- Checklist exists with concrete steps

---

### PROMPT ID: P9.2

PHASE: Phase 9 — Security + Reliability Hardening
OBJECTIVE: Network policies and service isolation.
CONTEXT: Restrict east-west traffic in k8s.
INPUTS I MUST FILL:

- CNI (Calico/Cilium/etc)
  PROMPT TO RUN:
  <<<
  Define a network policy plan:
- default deny policy
- service-to-service allow list
  Output FILE-BY-FILE:
- docs/security/network-policies.md
- infra/helm/network-policies.yaml (starter)

> > >

DONE WHEN:

- Policy guidance exists
- Starter policy file exists

---

### PROMPT ID: P9.3

PHASE: Phase 9 — Security + Reliability Hardening
OBJECTIVE: Secrets management integration.
CONTEXT: External Secrets or Vault.
INPUTS I MUST FILL:

- Preferred secrets manager (External Secrets/HashiCorp Vault)
  PROMPT TO RUN:
  <<<
  Document secrets management for FreeFlow:
- how secrets are stored
- how apps reference them
  Output FILE-BY-FILE:
- docs/security/secrets-management.md
- infra/helm/secrets-values.dev.yaml (starter)

> > >

DONE WHEN:

- Secrets management guidance exists

---

### PROMPT ID: P9.4

PHASE: Phase 9 — Security + Reliability Hardening
OBJECTIVE: Data retention + privacy policy.
CONTEXT: PII classification and retention.
INPUTS I MUST FILL:

- Retention periods by data type
  PROMPT TO RUN:
  <<<
  Define a data retention policy:
- PII classification
- retention schedule
- deletion workflow
  Output FILE-BY-FILE:
- docs/security/data-retention.md

> > >

DONE WHEN:

- Data retention policy exists

---

### PROMPT ID: P9.5

PHASE: Phase 9 — Security + Reliability Hardening
OBJECTIVE: DR/BCP runbook.
CONTEXT: RTO/RPO targets and restore steps.
INPUTS I MUST FILL:

- RTO/RPO targets
  PROMPT TO RUN:
  <<<
  Create a DR/BCP runbook:
- RTO/RPO targets
- recovery steps
- validation checklist
  Output FILE-BY-FILE:
- docs/ops/dr-bcp.md

> > >

DONE WHEN:

- DR/BCP runbook exists

---

### PROMPT ID: P9.6

PHASE: Phase 9 — Security + Reliability Hardening
OBJECTIVE: Chaos/resilience testing plan.
CONTEXT: Validate failure modes.
INPUTS I MUST FILL:

- Tooling (Litmus/Chaos Mesh/etc)
  PROMPT TO RUN:
  <<<
  Create a resilience testing plan:
- failure scenarios
- safeguards
- success criteria
  Output FILE-BY-FILE:
- docs/ops/resilience-testing.md

> > >

DONE WHEN:

- Resilience testing plan exists

---

## Phase 10 prompts (Productization + Launch)

### PROMPT ID: P10.1

PHASE: Phase 10 — Productization + Launch
OBJECTIVE: Product readiness checklist.
CONTEXT: Ensure features, QA, legal, and release criteria are covered.
INPUTS I MUST FILL:

- Target launch date
  PROMPT TO RUN:
  <<<
  Create a product readiness checklist for FreeFlow:
- feature completeness
- QA/testing gates
- legal/security sign-offs
- release criteria
  Output FILE-BY-FILE:
- docs/launch/readiness.md

> > >

DONE WHEN:

- Checklist exists with clear gates

---

### PROMPT ID: P10.2

PHASE: Phase 10 — Productization + Launch
OBJECTIVE: Analytics + feedback instrumentation.
CONTEXT: Define events and feedback capture.
INPUTS I MUST FILL:

- Analytics stack (PostHog/Segment/GA/etc)
  PROMPT TO RUN:
  <<<
  Create an analytics and feedback plan for FreeFlow:
- event taxonomy
- user feedback capture
- dashboards
  Output FILE-BY-FILE:
- docs/launch/analytics.md

> > >

DONE WHEN:

- Event taxonomy documented

---

### PROMPT ID: P10.3

PHASE: Phase 10 — Productization + Launch
OBJECTIVE: Docs + onboarding flow.
CONTEXT: Help users get started quickly.
INPUTS I MUST FILL:

- Target user persona
  PROMPT TO RUN:
  <<<
  Create onboarding documentation:
- quick start
- key workflows
- troubleshooting
  Output FILE-BY-FILE:
- docs/launch/onboarding.md

> > >

DONE WHEN:

- Onboarding guide exists

---

### PROMPT ID: P10.4

PHASE: Phase 10 — Productization + Launch
OBJECTIVE: SLA + support model.
CONTEXT: Define support tiers and response times.
INPUTS I MUST FILL:

- Support tiers (e.g., Standard/Premium)
  PROMPT TO RUN:
  <<<
  Define an SLA and support model for FreeFlow:
- support tiers
- response times
- escalation path
  Output FILE-BY-FILE:
- docs/launch/sla.md

> > >

DONE WHEN:

- SLA/support model documented

---

### PROMPT ID: P10.5

PHASE: Phase 10 — Productization + Launch
OBJECTIVE: Go-live + post-launch monitoring.
CONTEXT: Rollout and early-life monitoring.
INPUTS I MUST FILL:

- Launch window
  PROMPT TO RUN:
  <<<
  Create a go-live checklist:
- pre-launch verification
- rollout steps
- post-launch monitoring
  Output FILE-BY-FILE:
- docs/launch/go-live.md

> > >

DONE WHEN:

- Go-live checklist exists

---

## Phase 11 prompts (Post-Launch Optimization)

### PROMPT ID: P11.1

PHASE: Phase 11 — Post-Launch Optimization
OBJECTIVE: Post-launch optimization checklist.
CONTEXT: Focus on performance and stability after launch.
INPUTS I MUST FILL:

- Time window (e.g., 30 days after launch)
  PROMPT TO RUN:
  <<<
  Create a post-launch optimization checklist:
- performance tuning
- incident review
- user feedback review
  Output FILE-BY-FILE:
- docs/post-launch/optimization.md

> > >

DONE WHEN:

- Checklist exists

---

### PROMPT ID: P11.2

PHASE: Phase 11 — Post-Launch Optimization
OBJECTIVE: Cost optimization plan.
CONTEXT: Reduce infra spend without impacting SLOs.
INPUTS I MUST FILL:

- Target cost reduction (e.g., 15%)
  PROMPT TO RUN:
  <<<
  Create a cost optimization plan:
- compute sizing
- storage lifecycle
- unused resources
  Output FILE-BY-FILE:
- docs/post-launch/cost-optimization.md

> > >

DONE WHEN:

- Cost plan exists

---

### PROMPT ID: P11.3

PHASE: Phase 11 — Post-Launch Optimization
OBJECTIVE: UX improvements backlog.
CONTEXT: Based on feedback and analytics.
INPUTS I MUST FILL:

- Top 3 user pain points
  PROMPT TO RUN:
  <<<
  Create a UX improvements backlog:
- prioritized list
- impact rationale
  Output FILE-BY-FILE:
- docs/post-launch/ux-backlog.md

> > >

DONE WHEN:

- Backlog exists

---

### PROMPT ID: P11.4

PHASE: Phase 11 — Post-Launch Optimization
OBJECTIVE: Release retrospective.
CONTEXT: Lessons learned and improvement plan.
INPUTS I MUST FILL:

- Release window
  PROMPT TO RUN:
  <<<
  Create a release retrospective template:
- what went well
- what went wrong
- action items
  Output FILE-BY-FILE:
- docs/post-launch/retrospective.md

> > >

DONE WHEN:

- Retrospective template exists

---

If you want, I can also generate a **single “Index.md”** that lists every Prompt ID in order (so you can literally check off the journey), but I didn’t include it yet to keep this response manageable.

[1]: https://www.keycloak.org/docs/25.0.6/securing_apps/index.html?utm_source=chatgpt.com 'Securing Applications and Services Guide'
[2]: https://vercel.com/templates/next.js/openid-connect?utm_source=chatgpt.com 'Next.js with OpenID Connect'
[3]: https://docs.nestjs.com/security/authentication?utm_source=chatgpt.com 'Authentication | NestJS - A progressive Node.js framework'
[4]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/?utm_source=chatgpt.com 'Configure Liveness, Readiness and Startup Probes'
[5]: https://www.rabbitmq.com/docs/dlx?utm_source=chatgpt.com 'Dead Letter Exchanges'
[6]: https://docs.docker.com/build/building/best-practices/?utm_source=chatgpt.com 'Building best practices'
[7]: https://docs.camunda.io/docs/self-managed/deployment/helm/install/production/?utm_source=chatgpt.com 'Install Camunda for production with Helm'
[8]: https://help.form.io/deployments/deployment-guide/kubernetes?utm_source=chatgpt.com 'Kubernetes'
[9]: https://qdrant.tech/documentation/guides/installation/?utm_source=chatgpt.com 'Installation'
[10]: https://www.cncf.io/blog/2024/03/14/production-deployment-of-mongodb-on-kubernetes/?utm_source=chatgpt.com 'Production deployment of MongoDB on Kubernetes'
[11]: https://github.com/github/awesome-copilot/blob/main/instructions/github-actions-ci-cd-best-practices.instructions.md?utm_source=chatgpt.com 'github-actions-ci-cd-best-practices.instructions.md'
[12]: https://docs.nestjs.com/microservices/rabbitmq?utm_source=chatgpt.com 'RabbitMQ - Microservices | NestJS - A progressive Node.js framework'
[13]: https://curity.io/resources/learn/javascript-pkce-client/?utm_source=chatgpt.com 'Javascript SPA using Code Flow + PKCE'
[14]: https://stackoverflow.com/questions/77908004/validate-keycloak-token?utm_source=chatgpt.com 'jwt - Validate keycloak token'
[15]: https://docs.nestjs.com/recipes/prisma?utm_source=chatgpt.com 'Prisma | NestJS - A progressive Node.js framework'
[16]: https://www.rabbitmq.com/blog/2022/03/29/at-least-once-dead-lettering?utm_source=chatgpt.com 'At-Least-Once Dead Lettering'
