# JWT RBAC Source of Truth

FreeFlow authorization is derived from **JWT claims**, not database flags.
The UI and API should gate access based on the roles present in the token.

## Principles

- **JWT is the source of truth** for user roles and coarse-grained access.
- **No DB role toggles** are used to decide UI visibility or API access.
- **Tenant isolation** relies on the Keycloak realm (`iss` claim) and per-tenant role assignments.
- **Fine-grained controls** (object-level permissions) are enforced with OpenFGA.

## Role Claims

Roles are read from Keycloak realm roles:

```json
{
  "realm_access": {
    "roles": ["Admin", "Operator", "Viewer"]
  }
}
```

Only `Admin`, `Operator`, and `Viewer` are considered application roles.
Other Keycloak roles (e.g. `uma_authorization`, `offline_access`) are ignored.

## Role Mapping (UI)

The UI uses a static mapping for visibility controls:

- **Menus**: side navigation visibility
- **Apps**: application catalog tiles
- **Widgets**: dashboard widget availability

Mapping lives in:

- `packages/rbac-config/roles.ts`

## Backend Enforcement

- The API validates JWT signatures and issuer.
- Access checks should use role claims directly from the token.
- If a route requires fine-grained access, apply OpenFGA checks after JWT validation.

## Example Usage

```ts
import { getAllowedMenus } from '@freeflow/rbac-config/roles';

const menus = getAllowedMenus(userRoles);
```

## Notes

- Roles must be **consistent across realms** so UI and API mappings remain stable.
- If roles evolve, update Keycloak realm configuration and `roles.ts` together.
