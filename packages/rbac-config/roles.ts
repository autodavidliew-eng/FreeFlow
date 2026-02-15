export const ROLE_KEYS = ['Admin', 'Operator', 'Viewer'] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const MENU_KEYS = [
  'dashboard',
  'alarms',
  'applications',
  'calendar',
  'electric-meter',
  'equipment',
  'scheduler',
  'report',
  'rule-engine',
  'scene-management',
  'vendor',
  'water-meter',
] as const;
export type MenuKey = (typeof MENU_KEYS)[number];

export const APP_KEYS = [
  'contractor',
  'electric-meter',
  'equipment-management',
  'operation-scheduler',
  'report',
  'rule-engine',
  'scene-management',
  'user',
  'water-meter',
  'system-configuration',
] as const;
export type AppKey = (typeof APP_KEYS)[number];

export const WIDGET_KEYS = [
  'kpi-widget',
  'alarm-widget',
  'chart-widget',
  'admin-widget',
] as const;
export type WidgetKey = (typeof WIDGET_KEYS)[number];

export type RoleAccess = {
  menus: MenuKey[];
  apps: AppKey[];
  widgets: WidgetKey[];
};

const allMenus = [...MENU_KEYS];
const allApps = [...APP_KEYS];
const allWidgets = [...WIDGET_KEYS];

export const ROLE_ACCESS: Record<RoleKey, RoleAccess> = {
  Admin: {
    menus: allMenus,
    apps: allApps,
    widgets: allWidgets,
  },
  Operator: {
    menus: allMenus.filter((key) => key !== 'vendor'),
    apps: allApps.filter((key) => key !== 'system-configuration'),
    widgets: allWidgets.filter((key) => key !== 'admin-widget'),
  },
  Viewer: {
    menus: ['dashboard', 'alarms', 'applications', 'report'],
    apps: ['report', 'water-meter', 'electric-meter'],
    widgets: ['kpi-widget', 'chart-widget'],
  },
};

export function isRoleKey(role: string): role is RoleKey {
  return ROLE_KEYS.includes(role as RoleKey);
}

function mergeUnique<T extends string>(target: Set<T>, items: T[]) {
  for (const item of items) {
    target.add(item);
  }
}

export function resolveAccess(roles: string[]): RoleAccess {
  const allowedMenus = new Set<MenuKey>();
  const allowedApps = new Set<AppKey>();
  const allowedWidgets = new Set<WidgetKey>();

  for (const role of roles) {
    if (!isRoleKey(role)) {
      continue;
    }
    const access = ROLE_ACCESS[role];
    mergeUnique(allowedMenus, access.menus);
    mergeUnique(allowedApps, access.apps);
    mergeUnique(allowedWidgets, access.widgets);
  }

  return {
    menus: Array.from(allowedMenus),
    apps: Array.from(allowedApps),
    widgets: Array.from(allowedWidgets),
  };
}

export function getAllowedMenus(roles: string[]) {
  return resolveAccess(roles).menus;
}

export function getAllowedApps(roles: string[]) {
  return resolveAccess(roles).apps;
}

export function getAllowedWidgets(roles: string[]) {
  return resolveAccess(roles).widgets;
}
