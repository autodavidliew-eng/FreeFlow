# FreeFlow Permissions Matrix

## Overview

This document defines the role-based access control (RBAC) system for FreeFlow. It specifies which roles have access to which features, UI components, and API endpoints.

## Roles

FreeFlow supports four primary roles with hierarchical permissions:

| Role | Description | Typical Users |
|------|-------------|---------------|
| **Admin** | Full system access and administrative capabilities | System administrators, platform owners |
| **Manager** | Team management and oversight capabilities | Team leads, project managers, supervisors |
| **User** | Standard user with full productivity features | Regular employees, team members |
| **Guest** | Limited read-only access | External collaborators, auditors, viewers |

### Role Hierarchy

```
Admin > Manager > User > Guest
```

Higher roles inherit all permissions from lower roles.

---

## UI Component Permissions

### Main Navigation Menu

| Menu Item | Admin | Manager | User | Guest |
|-----------|-------|---------|------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Inbox (Tasks) | ✅ | ✅ | ✅ | ❌ |
| Alarms | ✅ | ✅ | ✅ | ✅ (read-only) |
| Mini Apps | ✅ | ✅ | ✅ | ❌ |
| Team Management | ✅ | ✅ | ❌ | ❌ |
| Reports & Analytics | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| User Profile | ✅ | ✅ | ✅ | ✅ |

---

## Dashboard Widgets Permissions

### Available Widgets by Role

| Widget | Description | Admin | Manager | User | Guest |
|--------|-------------|-------|---------|------|-------|
| **Task Summary** | Overview of tasks and progress | ✅ | ✅ | ✅ | ❌ |
| **Alarm List** | Recent alarms and notifications | ✅ | ✅ | ✅ | ✅ |
| **Team Activity** | Team member activity feed | ✅ | ✅ | ❌ | ❌ |
| **System Metrics** | System health and performance | ✅ | ❌ | ❌ | ❌ |
| **Calendar** | Upcoming events and deadlines | ✅ | ✅ | ✅ | ✅ |
| **Quick Actions** | Shortcuts for common tasks | ✅ | ✅ | ✅ | ❌ |
| **MiniApp Launcher** | Installed mini-apps grid | ✅ | ✅ | ✅ | ❌ |
| **Analytics Chart** | Custom analytics visualizations | ✅ | ✅ | ❌ | ❌ |
| **Recent Documents** | Recently accessed files | ✅ | ✅ | ✅ | ✅ |
| **User Directory** | Organization user list | ✅ | ✅ | ✅ | ❌ |

### Widget Actions by Role

| Widget Action | Admin | Manager | User | Guest |
|---------------|-------|---------|------|-------|
| Add widget | ✅ | ✅ | ✅ | ❌ |
| Remove widget | ✅ | ✅ | ✅ | ❌ |
| Resize widget | ✅ | ✅ | ✅ | ❌ |
| Move/reorder widget | ✅ | ✅ | ✅ | ❌ |
| Configure widget | ✅ | ✅ | ✅ | ❌ |
| Export widget data | ✅ | ✅ | ❌ | ❌ |

---

## Task/Inbox Permissions

### Task Actions

| Action | Admin | Manager | User | Guest |
|--------|-------|---------|------|-------|
| **View own tasks** | ✅ | ✅ | ✅ | ❌ |
| **View team tasks** | ✅ | ✅ | ❌ | ❌ |
| **View all tasks** | ✅ | ❌ | ❌ | ❌ |
| **Create task** | ✅ | ✅ | ✅ | ❌ |
| **Edit own task** | ✅ | ✅ | ✅ | ❌ |
| **Edit team task** | ✅ | ✅ | ❌ | ❌ |
| **Edit any task** | ✅ | ❌ | ❌ | ❌ |
| **Delete own task** | ✅ | ✅ | ✅ | ❌ |
| **Delete team task** | ✅ | ✅ | ❌ | ❌ |
| **Delete any task** | ✅ | ❌ | ❌ | ❌ |
| **Assign task to self** | ✅ | ✅ | ✅ | ❌ |
| **Assign task to team member** | ✅ | ✅ | ❌ | ❌ |
| **Assign task to anyone** | ✅ | ❌ | ❌ | ❌ |
| **Add comment** | ✅ | ✅ | ✅ | ❌ |
| **Add attachment** | ✅ | ✅ | ✅ | ❌ |
| **Change priority** | ✅ | ✅ | ✅ (own) | ❌ |
| **Set deadline** | ✅ | ✅ | ✅ (own) | ❌ |
| **Create subtask** | ✅ | ✅ | ✅ | ❌ |
| **Export tasks** | ✅ | ✅ | ✅ (own) | ❌ |

---

## Alarm/Notification Permissions

### Alarm Actions

| Action | Admin | Manager | User | Guest |
|--------|-------|---------|------|-------|
| **View own alarms** | ✅ | ✅ | ✅ | ✅ |
| **View team alarms** | ✅ | ✅ | ❌ | ❌ |
| **View system alarms** | ✅ | ❌ | ❌ | ❌ |
| **Create personal alarm** | ✅ | ✅ | ✅ | ❌ |
| **Create team alarm** | ✅ | ✅ | ❌ | ❌ |
| **Create system alarm** | ✅ | ❌ | ❌ | ❌ |
| **Edit own alarm** | ✅ | ✅ | ✅ | ❌ |
| **Edit team alarm** | ✅ | ✅ | ❌ | ❌ |
| **Delete own alarm** | ✅ | ✅ | ✅ | ❌ |
| **Delete team alarm** | ✅ | ✅ | ❌ | ❌ |
| **Snooze alarm** | ✅ | ✅ | ✅ | ✅ |
| **Dismiss alarm** | ✅ | ✅ | ✅ | ✅ |
| **Configure notification channels** | ✅ | ✅ | ✅ | ❌ |
| **Set alarm schedule** | ✅ | ✅ | ✅ | ❌ |

---

## MiniApp Permissions

### MiniApp Actions

| Action | Admin | Manager | User | Guest |
|--------|-------|---------|------|-------|
| **Browse marketplace** | ✅ | ✅ | ✅ | ❌ |
| **Install mini-app** | ✅ | ✅ | ✅ | ❌ |
| **Uninstall mini-app** | ✅ | ✅ | ✅ | ❌ |
| **Configure mini-app** | ✅ | ✅ | ✅ | ❌ |
| **Use installed mini-app** | ✅ | ✅ | ✅ | ❌ |
| **Rate/review mini-app** | ✅ | ✅ | ✅ | ❌ |
| **Upload custom mini-app** | ✅ | ✅ (approved) | ❌ | ❌ |
| **Publish to marketplace** | ✅ | ✅ (approved) | ❌ | ❌ |
| **Manage app permissions** | ✅ | ✅ | ✅ | ❌ |

---

## API Endpoint Permissions

### User & Profile Endpoints

| Endpoint | Method | Admin | Manager | User | Guest |
|----------|--------|-------|---------|------|-------|
| `/me` | GET | ✅ | ✅ | ✅ | ✅ |
| `/me` | PATCH | ✅ | ✅ | ✅ | ❌ |
| `/users` | GET | ✅ | ✅ | ✅ | ❌ |
| `/users/{id}` | GET | ✅ | ✅ | ✅ (team) | ❌ |
| `/users/{id}` | PATCH | ✅ | ✅ (team) | ❌ | ❌ |
| `/users/{id}` | DELETE | ✅ | ❌ | ❌ | ❌ |

### Dashboard Endpoints

| Endpoint | Method | Admin | Manager | User | Guest |
|----------|--------|-------|---------|------|-------|
| `/dashboard/layout` | GET | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/layout` | PUT | ✅ | ✅ | ✅ | ❌ |
| `/dashboard/widgets` | GET | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/widgets/{id}/data` | GET | ✅ | ✅ | ✅ | ✅* |
| `/dashboard/templates` | GET | ✅ | ✅ | ✅ | ❌ |
| `/dashboard/templates` | POST | ✅ | ✅ | ❌ | ❌ |

*Guest: Limited to read-only widgets

### Alarm Endpoints

| Endpoint | Method | Admin | Manager | User | Guest |
|----------|--------|-------|---------|------|-------|
| `/alarms` | GET | ✅ | ✅ | ✅ | ✅ |
| `/alarms` | POST | ✅ | ✅ | ✅ | ❌ |
| `/alarms/{id}` | GET | ✅ | ✅ | ✅ | ✅ |
| `/alarms/{id}` | PATCH | ✅ | ✅ | ✅ (own) | ❌ |
| `/alarms/{id}` | DELETE | ✅ | ✅ | ✅ (own) | ❌ |
| `/alarms/{id}/snooze` | POST | ✅ | ✅ | ✅ | ✅ |
| `/notifications` | GET | ✅ | ✅ | ✅ | ✅ |
| `/notifications/{id}/read` | PATCH | ✅ | ✅ | ✅ | ✅ |

### Task Endpoints

| Endpoint | Method | Admin | Manager | User | Guest |
|----------|--------|-------|---------|------|-------|
| `/inbox/tasks` | GET | ✅ | ✅ | ✅ | ❌ |
| `/inbox/tasks` | POST | ✅ | ✅ | ✅ | ❌ |
| `/inbox/tasks/{id}` | GET | ✅ | ✅ | ✅ (assigned) | ❌ |
| `/inbox/tasks/{id}` | PATCH | ✅ | ✅ | ✅ (assigned) | ❌ |
| `/inbox/tasks/{id}` | DELETE | ✅ | ✅ (team) | ✅ (own) | ❌ |
| `/inbox/tasks/{id}/comments` | GET | ✅ | ✅ | ✅ (assigned) | ❌ |
| `/inbox/tasks/{id}/comments` | POST | ✅ | ✅ | ✅ (assigned) | ❌ |
| `/inbox/tasks/{id}/assign` | POST | ✅ | ✅ | ❌ | ❌ |

### MiniApp Endpoints

| Endpoint | Method | Admin | Manager | User | Guest |
|----------|--------|-------|---------|------|-------|
| `/miniapps` | GET | ✅ | ✅ | ✅ | ❌ |
| `/miniapps/{id}` | GET | ✅ | ✅ | ✅ | ❌ |
| `/miniapps/{id}` | DELETE | ✅ | ✅ | ✅ | ❌ |
| `/miniapps/installed` | GET | ✅ | ✅ | ✅ | ❌ |
| `/miniapps/installed` | POST | ✅ | ✅ | ✅ | ❌ |
| `/miniapps/{id}/config` | GET | ✅ | ✅ | ✅ | ❌ |
| `/miniapps/{id}/config` | PUT | ✅ | ✅ | ✅ | ❌ |

---

## Feature Flags by Role

### Beta Features Access

| Feature | Admin | Manager | User | Guest |
|---------|-------|---------|------|-------|
| **AI Task Suggestions** | ✅ | ✅ | ✅ (opt-in) | ❌ |
| **Advanced Analytics** | ✅ | ✅ | ❌ | ❌ |
| **Workflow Automation** | ✅ | ✅ (limited) | ❌ | ❌ |
| **API Key Management** | ✅ | ✅ | ❌ | ❌ |
| **Webhook Configuration** | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** | ✅ | ✅ (own team) | ❌ | ❌ |
| **Export All Data** | ✅ | ❌ | ❌ | ❌ |

---

## Rate Limits by Role

| Endpoint Category | Admin | Manager | User | Guest |
|------------------|-------|---------|------|-------|
| **General API** | 10,000/hr | 5,000/hr | 1,000/hr | 100/hr |
| **Task Creation** | Unlimited | 500/hr | 100/hr | 0/hr |
| **Alarm Creation** | Unlimited | 200/hr | 50/hr | 0/hr |
| **MiniApp Install** | Unlimited | 100/day | 20/day | 0/day |
| **File Upload** | 10 GB/day | 5 GB/day | 1 GB/day | 0/day |
| **Export Requests** | Unlimited | 50/day | 10/day | 5/day |

---

## Data Access Scope

### Visibility Rules

| Data Type | Admin | Manager | User | Guest |
|-----------|-------|---------|------|-------|
| **Own data** | ✅ Full | ✅ Full | ✅ Full | ✅ Read-only |
| **Team data** | ✅ Full | ✅ Full | ❌ | ❌ |
| **Organization data** | ✅ Full | ✅ Read-only | ❌ | ❌ |
| **System data** | ✅ Full | ❌ | ❌ | ❌ |
| **User profiles** | ✅ All | ✅ Team only | ✅ Team only | ❌ |
| **Audit logs** | ✅ All | ✅ Team only | ❌ | ❌ |

---

## Permission Enforcement

### Implementation Strategy

1. **API Gateway Level**
   - JWT token validation
   - Role extraction from token claims
   - Endpoint-level permission check
   - Rate limiting per role

2. **Service Level**
   - Data scope filtering (own/team/org)
   - Resource ownership validation
   - Business logic permission checks
   - Audit logging

3. **Frontend Level**
   - Conditional UI rendering
   - Navigation menu filtering
   - Feature flag evaluation
   - Role-based component visibility

### Permission Check Flow

```
1. User makes request → API Gateway
2. Gateway validates JWT token
3. Gateway extracts user role from token
4. Gateway checks endpoint permission matrix
5. If allowed → Forward to microservice
6. Microservice performs additional scope checks
7. Microservice returns filtered data
8. Gateway returns response to user
```

---

## Special Permissions

### Admin-Only Capabilities

- Create/delete users
- Assign/revoke roles
- Configure system settings
- View system metrics
- Access audit logs (all users)
- Manage integrations
- Configure SSO/SAML
- Export all system data
- Manage billing (if applicable)

### Manager-Only Capabilities

- View team analytics
- Assign tasks to team members
- Create team alarms
- View team audit logs
- Approve mini-app uploads (if enabled)
- Create dashboard templates

---

## Role Assignment Rules

| Action | Who Can Perform | Notes |
|--------|----------------|-------|
| **Assign Guest role** | Admin, Manager | Can invite external users |
| **Assign User role** | Admin, Manager | Default role for new users |
| **Assign Manager role** | Admin only | Requires admin approval |
| **Assign Admin role** | Admin only | Requires existing admin approval |
| **Revoke any role** | Admin only | Audit logged |
| **Change own role** | ❌ Never | Must be changed by higher role |

---

## Notes

- All permission changes are audit logged
- Permissions are evaluated at request time (not cached)
- Higher roles inherit all permissions from lower roles
- Custom roles can be defined in enterprise edition
- Permissions can be overridden per workspace/organization
- API responses are filtered based on user's data access scope
