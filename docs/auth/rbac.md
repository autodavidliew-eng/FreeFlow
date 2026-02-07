# Role-Based Access Control (RBAC) Model

Complete guide to FreeFlow's Role-Based Access Control system with permissions mapping for UI and API.

## Table of Contents

- [Overview](#overview)
- [RBAC Model Structure](#rbac-model-structure)
- [Roles](#roles)
- [Permissions](#permissions)
- [Widgets](#widgets)
- [Menus](#menus)
- [API Endpoints](#api-endpoints)
- [Implementation Guide](#implementation-guide)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Overview

### What is RBAC?

Role-Based Access Control (RBAC) is a security paradigm where system access is granted based on roles assigned to users, rather than individual user permissions.

**Key Concepts:**
- **Roles**: Named collections of permissions (e.g., Admin, Operator, Viewer)
- **Permissions**: Specific capabilities to perform actions on resources
- **Resources**: System entities (documents, workflows, users, etc.)
- **Actions**: Operations that can be performed (read, write, delete, etc.)

### FreeFlow RBAC Model

```
Users ──assigned to──> Roles ──granted──> Permissions ──control access to──> Resources
                                                                               ├─ Widgets
                                                                               ├─ Menus
                                                                               └─ API Endpoints
```

### Single Source of Truth

All permissions are defined in **`docs/auth/permissions.json`**, which serves as the canonical reference for:
- Role definitions and hierarchies
- Permission mappings
- Widget access control
- Menu visibility
- API endpoint authorization

## RBAC Model Structure

### File Structure

```json
{
  "roles": { ... },          // Role definitions
  "permissions": { ... },    // Permission definitions
  "widgets": { ... },        // Widget access control
  "menus": { ... },          // Menu navigation
  "endpoints": { ... },      // API endpoint security
  "permissionMatrix": { ... } // Quick reference matrix
}
```

### Permission Naming Convention

Permissions follow the pattern: `resource:action`

**Examples:**
- `documents:read` - Read documents
- `documents:write` - Create/update documents
- `documents:*` - All document operations
- `system:*` - Full system access

## Roles

### Available Roles

FreeFlow includes three default roles:

#### 1. Admin (Level 100)

**Purpose**: System administrators with full access

**Capabilities:**
- ✅ Full system administration
- ✅ User and organization management
- ✅ System settings configuration
- ✅ Audit log access
- ✅ All CRUD operations on all resources

**Permissions:**
```json
[
  "system:*",
  "users:*",
  "organizations:*",
  "documents:*",
  "workflows:*",
  "analytics:*",
  "settings:*",
  "audit:*",
  "notifications:*",
  "alarms:*"
]
```

#### 2. Operator (Level 50)

**Purpose**: Operational users who manage content and workflows

**Capabilities:**
- ✅ Create, edit, and delete documents
- ✅ Execute and manage workflows
- ✅ View analytics dashboards
- ✅ Acknowledge and resolve alarms
- ✅ Send notifications
- ❌ Cannot manage users or system settings
- ❌ Cannot access audit logs

**Permissions:**
```json
[
  "documents:read",
  "documents:write",
  "documents:delete",
  "workflows:read",
  "workflows:write",
  "workflows:execute",
  "analytics:read",
  "notifications:read",
  "notifications:write",
  "alarms:read",
  "alarms:acknowledge"
]
```

#### 3. Viewer (Level 10)

**Purpose**: Read-only users who consume content

**Capabilities:**
- ✅ View documents
- ✅ View workflow status
- ✅ View analytics dashboards
- ✅ View notifications
- ✅ View alarms
- ❌ Cannot create or modify content
- ❌ Cannot execute workflows
- ❌ Cannot acknowledge alarms

**Permissions:**
```json
[
  "documents:read",
  "workflows:read",
  "analytics:read",
  "notifications:read",
  "alarms:read"
]
```

### Role Hierarchy

```
Admin (100)
    ↓
Operator (50)
    ↓
Viewer (10)
```

Higher-level roles do not automatically inherit lower-level permissions. Each role has explicit permission grants.

## Permissions

### Permission Categories

| Category | Resources | Example Permissions |
|----------|-----------|---------------------|
| System | System administration | `system:*` |
| Users | User management | `users:read`, `users:*` |
| Organizations | Org management | `organizations:*` |
| Documents | Document CRUD | `documents:read`, `documents:write`, `documents:delete` |
| Workflows | Workflow management | `workflows:read`, `workflows:execute` |
| Analytics | Dashboards & reports | `analytics:read`, `analytics:*` |
| Settings | Configuration | `settings:*` |
| Audit | Audit logs | `audit:*` |
| Notifications | Messaging | `notifications:read`, `notifications:write` |
| Alarms | Alarm system | `alarms:read`, `alarms:acknowledge` |

### Permission Actions

| Action | Description | Example |
|--------|-------------|---------|
| `read` | View resource | `documents:read` |
| `write` | Create/update resource | `documents:write` |
| `delete` | Delete resource | `documents:delete` |
| `execute` | Run/trigger resource | `workflows:execute` |
| `*` | All actions | `documents:*` |

### Wildcard Permissions

- `resource:*` - All actions on a specific resource
- `*:*` or `*` - All actions on all resources (super admin only)

## Widgets

### Widget Access Control

Each widget defines:
- **Required permissions**: Minimum permissions to display the widget
- **Optional permissions**: Additional capabilities within the widget
- **Features**: Specific features mapped to permissions
- **Endpoints**: Related API endpoints

### Widget Examples

#### KPI Widget

**Purpose**: Display key performance indicators

**Access Control:**
```json
{
  "displayName": "KPI Widget",
  "type": "visualization",
  "requiredPermissions": ["analytics:read"],
  "optionalPermissions": ["analytics:*"],
  "endpoints": [
    "/api/analytics/kpis",
    "/api/analytics/kpis/:id"
  ],
  "features": {
    "view": ["analytics:read"],
    "configure": ["analytics:*"],
    "export": ["analytics:*"]
  }
}
```

**Role Capabilities:**
- **Admin**: View, configure, export
- **Operator**: View only
- **Viewer**: View only

#### Chart Widget

**Purpose**: Display data visualizations

**Access Control:**
```json
{
  "displayName": "Chart Widget",
  "type": "visualization",
  "requiredPermissions": ["analytics:read"],
  "features": {
    "view": ["analytics:read"],
    "configure": ["analytics:*"],
    "export": ["analytics:*"],
    "drill-down": ["analytics:read"]
  }
}
```

**Role Capabilities:**
- **Admin**: Full access (view, configure, export, drill-down)
- **Operator**: View and drill-down
- **Viewer**: View and drill-down

#### Alarm Widget

**Purpose**: Display active alarms and alerts

**Access Control:**
```json
{
  "displayName": "Alarms Widget",
  "type": "monitoring",
  "requiredPermissions": ["alarms:read"],
  "endpoints": [
    "/api/alarms",
    "/api/alarms/active",
    "/api/alarms/:id/acknowledge"
  ],
  "features": {
    "view": ["alarms:read"],
    "acknowledge": ["alarms:acknowledge"],
    "resolve": ["alarms:acknowledge"],
    "configure": ["alarms:*"]
  }
}
```

**Role Capabilities:**
- **Admin**: Full control (view, acknowledge, resolve, configure)
- **Operator**: View, acknowledge, resolve
- **Viewer**: View only

#### Inbox Widget

**Purpose**: Display notifications and messages

**Access Control:**
```json
{
  "displayName": "Inbox Widget",
  "type": "communication",
  "requiredPermissions": ["notifications:read"],
  "endpoints": [
    "/api/notifications",
    "/api/notifications/unread",
    "/api/notifications/:id/read"
  ],
  "features": {
    "view": ["notifications:read"],
    "mark-read": ["notifications:read"],
    "delete": ["notifications:write"],
    "send": ["notifications:write"]
  }
}
```

**Role Capabilities:**
- **Admin**: Full access (view, mark-read, delete, send)
- **Operator**: View, mark-read, send
- **Viewer**: View, mark-read

## Menus

### Menu Navigation Control

Menu items are conditionally rendered based on user permissions.

### Menu Structure

```json
{
  "dashboard": {
    "displayName": "Dashboard",
    "path": "/dashboard",
    "requiredPermissions": []  // Always visible
  },
  "documents": {
    "displayName": "Documents",
    "path": "/documents",
    "requiredPermissions": ["documents:read"],
    "children": [...]
  },
  "admin": {
    "displayName": "Administration",
    "path": "/admin",
    "requiredPermissions": ["system:*"]  // Admin only
  }
}
```

### Menu Visibility by Role

| Menu Item | Admin | Operator | Viewer |
|-----------|-------|----------|--------|
| Dashboard | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ |
| Workflows | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ |
| Alarms | ✅ | ✅ | ✅ |
| Administration | ✅ | ❌ | ❌ |

### Submenu Visibility

Submenus have their own permission requirements:

**Documents Menu:**
- All Documents: `documents:read` (All roles)
- My Documents: `documents:read` (All roles)
- Shared with Me: `documents:read` (All roles)
- Create Document: `documents:write` (Admin, Operator only)

**Workflows Menu:**
- All Workflows: `workflows:read` (All roles)
- My Tasks: `workflows:execute` (Admin, Operator only)
- Workflow Builder: `workflows:write` (Admin, Operator only)

## API Endpoints

### Endpoint Authorization

Each API endpoint specifies required permissions per HTTP method.

### Example: Documents API

```json
"/api/documents": {
  "GET": {
    "description": "List documents",
    "requiredPermissions": ["documents:read", "documents:write", "documents:*"]
  },
  "POST": {
    "description": "Create document",
    "requiredPermissions": ["documents:write", "documents:*"]
  }
}
```

**Access by Role:**
- **Admin**: GET ✅, POST ✅ (has `documents:*`)
- **Operator**: GET ✅, POST ✅ (has `documents:write`)
- **Viewer**: GET ✅, POST ❌ (only has `documents:read`)

### Example: Alarms API

```json
"/api/alarms/:id/acknowledge": {
  "POST": {
    "description": "Acknowledge alarm",
    "requiredPermissions": ["alarms:acknowledge", "alarms:*"]
  }
}
```

**Access by Role:**
- **Admin**: POST ✅ (has `alarms:*`)
- **Operator**: POST ✅ (has `alarms:acknowledge`)
- **Viewer**: POST ❌ (only has `alarms:read`)

### Complete Endpoint Matrix

| Endpoint | Method | Admin | Operator | Viewer |
|----------|--------|-------|----------|--------|
| /api/documents | GET | ✅ | ✅ | ✅ |
| /api/documents | POST | ✅ | ✅ | ❌ |
| /api/documents/:id | DELETE | ✅ | ✅ | ❌ |
| /api/workflows/:id/execute | POST | ✅ | ✅ | ❌ |
| /api/analytics/kpis | GET | ✅ | ✅ | ✅ |
| /api/alarms/:id/acknowledge | POST | ✅ | ✅ | ❌ |
| /api/notifications | POST | ✅ | ✅ | ❌ |
| /api/users | GET | ✅ | ❌ | ❌ |

## Implementation Guide

### Backend (NestJS)

#### 1. Load Permissions

```typescript
// src/auth/permissions.service.ts
import { Injectable } from '@nestjs/common';
import * as permissions from '../../../docs/auth/permissions.json';

@Injectable()
export class PermissionsService {
  private permissions = permissions;

  getRolePermissions(role: string): string[] {
    return this.permissions.roles[role]?.permissions || [];
  }

  hasPermission(userRoles: string[], required: string[]): boolean {
    const userPermissions = this.getUserPermissions(userRoles);
    return required.some(perm => this.matchesPermission(userPermissions, perm));
  }

  private getUserPermissions(roles: string[]): string[] {
    return roles.flatMap(role => this.getRolePermissions(role));
  }

  private matchesPermission(userPerms: string[], required: string): boolean {
    return userPerms.some(perm => {
      // Exact match
      if (perm === required) return true;
      // Wildcard match: user has "documents:*", requires "documents:read"
      if (perm.endsWith(':*')) {
        const resource = perm.split(':')[0];
        return required.startsWith(resource + ':');
      }
      // Super admin: user has "system:*" or "*"
      if (perm === 'system:*' || perm === '*') return true;
      return false;
    });
  }

  getEndpointPermissions(path: string, method: string): string[] {
    const endpoint = this.permissions.endpoints[path];
    return endpoint?.[method]?.requiredPermissions || [];
  }
}
```

#### 2. Permission Guard

```typescript
// src/auth/guards/permission.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    return this.permissionsService.hasPermission(
      user.roles,
      requiredPermissions,
    );
  }
}
```

#### 3. Permission Decorator

```typescript
// src/auth/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
```

#### 4. Controller Usage

```typescript
// src/documents/documents.controller.ts
import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('documents')
@UseGuards(PermissionGuard)
export class DocumentsController {
  @Get()
  @RequirePermissions('documents:read')
  findAll() {
    return this.documentsService.findAll();
  }

  @Post()
  @RequirePermissions('documents:write')
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Delete(':id')
  @RequirePermissions('documents:delete')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
```

### Frontend (Next.js + React)

#### 1. Load Permissions

```typescript
// lib/permissions.ts
import permissions from '@/docs/auth/permissions.json';

export function getRolePermissions(role: string): string[] {
  return permissions.roles[role]?.permissions || [];
}

export function hasPermission(
  userRoles: string[],
  required: string[]
): boolean {
  const userPerms = userRoles.flatMap(role => getRolePermissions(role));

  return required.some(req =>
    userPerms.some(perm => {
      if (perm === req) return true;
      if (perm.endsWith(':*')) {
        const resource = perm.split(':')[0];
        return req.startsWith(resource + ':');
      }
      if (perm === 'system:*' || perm === '*') return true;
      return false;
    })
  );
}

export function canAccessWidget(
  userRoles: string[],
  widgetId: string
): boolean {
  const widget = permissions.widgets[widgetId];
  if (!widget) return false;
  return hasPermission(userRoles, widget.requiredPermissions);
}

export function getWidgetFeatures(
  userRoles: string[],
  widgetId: string
): string[] {
  const widget = permissions.widgets[widgetId];
  if (!widget) return [];

  return Object.entries(widget.features)
    .filter(([_, perms]) => hasPermission(userRoles, perms))
    .map(([feature]) => feature);
}
```

#### 2. Permission Hook

```typescript
// hooks/usePermissions.ts
'use client';

import { useSession } from 'next-auth/react';
import { hasPermission, canAccessWidget, getWidgetFeatures } from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];

  return {
    hasPermission: (required: string[]) => hasPermission(userRoles, required),
    canAccessWidget: (widgetId: string) => canAccessWidget(userRoles, widgetId),
    getWidgetFeatures: (widgetId: string) => getWidgetFeatures(userRoles, widgetId),
    roles: userRoles,
  };
}
```

#### 3. Widget Rendering

```typescript
// components/widgets/KPIWidget.tsx
'use client';

import { usePermissions } from '@/hooks/usePermissions';

export function KPIWidget() {
  const { canAccessWidget, getWidgetFeatures } = usePermissions();

  if (!canAccessWidget('kpi-widget')) {
    return null; // Widget not visible
  }

  const features = getWidgetFeatures('kpi-widget');
  const canConfigure = features.includes('configure');
  const canExport = features.includes('export');

  return (
    <div className="kpi-widget">
      <h3>Key Performance Indicators</h3>
      {/* KPI data display */}

      {canConfigure && (
        <button onClick={handleConfigure}>Configure</button>
      )}

      {canExport && (
        <button onClick={handleExport}>Export</button>
      )}
    </div>
  );
}
```

#### 4. Menu Rendering

```typescript
// components/Navigation.tsx
'use client';

import permissions from '@/docs/auth/permissions.json';
import { usePermissions } from '@/hooks/usePermissions';

export function Navigation() {
  const { hasPermission } = usePermissions();

  const visibleMenus = Object.entries(permissions.menus)
    .filter(([_, menu]) =>
      menu.requiredPermissions.length === 0 ||
      hasPermission(menu.requiredPermissions)
    )
    .sort((a, b) => a[1].order - b[1].order);

  return (
    <nav>
      {visibleMenus.map(([key, menu]) => (
        <MenuItem key={key} menu={menu} />
      ))}
    </nav>
  );
}
```

## Usage Examples

### Example 1: Check Widget Access

```typescript
// Check if user can view alarm widget
const { canAccessWidget, getWidgetFeatures } = usePermissions();

if (canAccessWidget('alarm-widget')) {
  const features = getWidgetFeatures('alarm-widget');

  // Viewer: ['view']
  // Operator: ['view', 'acknowledge', 'resolve']
  // Admin: ['view', 'acknowledge', 'resolve', 'configure']

  return <AlarmWidget features={features} />;
}
```

### Example 2: Conditional UI Elements

```typescript
// Show "Create Document" button only for Operators and Admins
const { hasPermission } = usePermissions();

return (
  <div>
    <h1>Documents</h1>
    {hasPermission(['documents:write']) && (
      <button onClick={createDocument}>Create Document</button>
    )}
  </div>
);
```

### Example 3: API Authorization

```typescript
// Backend: Protect API endpoint
@Post('documents')
@RequirePermissions('documents:write')
async createDocument(@Body() dto: CreateDocumentDto) {
  return this.documentsService.create(dto);
}

// Frontend: Check before calling API
const { hasPermission } = usePermissions();

async function createDocument() {
  if (!hasPermission(['documents:write'])) {
    toast.error('You do not have permission to create documents');
    return;
  }

  await fetch('/api/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### Example 4: Menu Visibility

```typescript
// Render menu based on permissions
import permissions from '@/docs/auth/permissions.json';

function AdminMenu() {
  const { hasPermission } = usePermissions();

  if (!hasPermission(['system:*'])) {
    return null; // Admin menu not visible
  }

  return (
    <div className="admin-menu">
      <Link href="/admin/users">Users</Link>
      <Link href="/admin/settings">Settings</Link>
      <Link href="/admin/audit">Audit Logs</Link>
    </div>
  );
}
```

## Best Practices

### 1. Principle of Least Privilege

**Always grant the minimum permissions needed:**

```typescript
// ✅ Good: Specific permissions
@RequirePermissions('documents:read')

// ❌ Bad: Overly broad permissions
@RequirePermissions('documents:*')
```

### 2. Separate UI and API Checks

**Check permissions on both frontend and backend:**

```typescript
// Frontend (UX): Hide button
{hasPermission(['documents:delete']) && <DeleteButton />}

// Backend (Security): Enforce permission
@RequirePermissions('documents:delete')
async deleteDocument() { ... }
```

### 3. Use Permission Matrix for Quick Reference

Reference `permissionMatrix` in permissions.json for role capabilities overview.

### 4. Test Permission Logic

```typescript
describe('Permissions', () => {
  it('should allow Operator to acknowledge alarms', () => {
    const roles = ['Operator'];
    const required = ['alarms:acknowledge'];
    expect(hasPermission(roles, required)).toBe(true);
  });

  it('should deny Viewer from creating documents', () => {
    const roles = ['Viewer'];
    const required = ['documents:write'];
    expect(hasPermission(roles, required)).toBe(false);
  });
});
```

### 5. Audit Permission Changes

Log permission grants and denials:

```typescript
@Post('documents')
@RequirePermissions('documents:write')
async createDocument(@Request() req) {
  await this.auditService.log({
    action: 'document.create',
    user: req.user.id,
    roles: req.user.roles,
    timestamp: new Date(),
  });

  return this.documentsService.create(dto);
}
```

### 6. Cache Permission Checks

For performance, cache permission computations:

```typescript
const permissionCache = new Map<string, boolean>();

function hasPermissionCached(roles: string[], required: string[]): boolean {
  const key = `${roles.join(',')}:${required.join(',')}`;

  if (permissionCache.has(key)) {
    return permissionCache.get(key)!;
  }

  const result = hasPermission(roles, required);
  permissionCache.set(key, result);
  return result;
}
```

### 7. Version Control Permissions

Track changes to permissions.json:

```bash
# Always commit permission changes with clear messages
git add docs/auth/permissions.json
git commit -m "Add alarm:acknowledge permission to Operator role"
```

## Quick Reference

### Permission Patterns

```
resource:action
├─ documents:read       # Read documents
├─ documents:write      # Create/update documents
├─ documents:delete     # Delete documents
├─ documents:*          # All document actions
├─ workflows:execute    # Execute workflows
├─ alarms:acknowledge   # Acknowledge alarms
└─ system:*             # System admin (all resources)
```

### Widget Access Matrix

| Widget | Admin | Operator | Viewer |
|--------|-------|----------|--------|
| KPI Widget | Full | View | View |
| Chart Widget | Full | View + Drill-down | View + Drill-down |
| Alarm Widget | Full | View + Ack/Resolve | View |
| Inbox Widget | Full | View + Send | View |

### API Method Matrix

| Method | Typical Permission |
|--------|-------------------|
| GET | `resource:read` |
| POST | `resource:write` |
| PUT/PATCH | `resource:write` |
| DELETE | `resource:delete` or `resource:*` |

## References

- [NIST RBAC Standard](https://csrc.nist.gov/projects/role-based-access-control)
- [OAuth 2.0 Scopes](https://oauth.net/2/scope/)
- [Next.js Authentication](https://next-auth.js.org/)
- [NestJS Authorization](https://docs.nestjs.com/security/authorization)
