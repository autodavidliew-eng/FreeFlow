// eslint-disable-next-line import/no-unresolved
import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

type PermissionMatrixRole = {
  widgets?: Record<string, string[]>;
  menus?: string[];
};

type PermissionsFile = {
  roles?: Record<string, unknown>;
  widgets?: Record<string, unknown>;
  permissionMatrix?: Record<string, PermissionMatrixRole>;
};

let cached: PermissionsFile | null = null;

async function loadPermissions(): Promise<PermissionsFile> {
  if (cached) {
    return cached;
  }

  const root = path.resolve(process.cwd(), '..', '..');
  const filePath = path.join(root, 'docs', 'auth', 'permissions.json');
  const raw = await readFile(filePath, 'utf-8');
  cached = JSON.parse(raw) as PermissionsFile;
  return cached;
}

export type WidgetPermissions = Record<string, string[]>;

function mergeActions(target: Set<string>, incoming: string[]) {
  for (const action of incoming) {
    target.add(action);
  }
}

export async function getWidgetPermissionsForRoles(
  roles: string[]
): Promise<WidgetPermissions> {
  const permissions = await loadPermissions();
  const matrix = permissions.permissionMatrix ?? {};
  const aggregated: Record<string, Set<string>> = {};

  for (const role of roles) {
    const entry = matrix[role];
    if (!entry?.widgets) {
      continue;
    }
    for (const [widgetId, actions] of Object.entries(entry.widgets)) {
      if (!Array.isArray(actions)) {
        continue;
      }
      const bucket = aggregated[widgetId] ?? new Set<string>();
      mergeActions(bucket, actions);
      aggregated[widgetId] = bucket;
    }
  }

  const result: WidgetPermissions = {};
  for (const [widgetId, actions] of Object.entries(aggregated)) {
    result[widgetId] = Array.from(actions);
  }

  return result;
}

export async function getAllowedWidgetsForRoles(
  roles: string[]
): Promise<Set<string>> {
  const widgetPermissions = await getWidgetPermissionsForRoles(roles);
  const allowed = new Set<string>();

  for (const [widgetId, actions] of Object.entries(widgetPermissions)) {
    if (actions.includes('view') || actions.includes('*')) {
      allowed.add(widgetId);
    }
  }

  return allowed;
}

export async function getKnownRoles(): Promise<string[]> {
  const permissions = await loadPermissions();
  return Object.keys(permissions.roles ?? {});
}

export async function hasKnownRole(roles: string[]): Promise<boolean> {
  const permissions = await loadPermissions();
  const matrix = permissions.permissionMatrix ?? {};
  return roles.some((role) => Boolean(matrix[role]));
}
