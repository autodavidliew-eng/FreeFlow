import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type PermissionMatrixRole = {
  widgets?: Record<string, string[]>;
  menus?: string[];
};

export type PermissionsFile = {
  roles?: Record<string, { permissions?: string[] }>;
  permissions?: Record<string, unknown>;
  widgets?: Record<string, unknown>;
  menus?: Record<string, unknown>;
  endpoints?: Record<string, unknown>;
  permissionMatrix?: Record<string, PermissionMatrixRole>;
};

let cached: PermissionsFile | null = null;

function resolvePermissionsPath() {
  const configured = process.env.FREEFLOW_PERMISSIONS_PATH;
  if (configured) {
    return configured;
  }

  const root = path.resolve(process.cwd(), '..', '..');
  return path.join(root, 'docs', 'auth', 'permissions.json');
}

export async function loadPermissions(): Promise<PermissionsFile> {
  if (cached) {
    return cached;
  }

  const filePath = resolvePermissionsPath();
  const raw = await readFile(filePath, 'utf-8');
  cached = JSON.parse(raw) as PermissionsFile;
  return cached;
}

export function clearPermissionsCache() {
  cached = null;
}
