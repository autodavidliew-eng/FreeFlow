import {
  APP_KEYS,
  MENU_KEYS,
  ROLE_ACCESS,
  ROLE_KEYS,
  WIDGET_KEYS,
  getAllowedApps,
  getAllowedMenus,
  getAllowedWidgets,
  resolveAccess,
} from '../roles';

describe('rbac-config role mapping', () => {
  it('declares all role keys', () => {
    expect(ROLE_KEYS).toEqual(['Admin', 'Operator', 'Viewer']);
  });

  it('ensures role access references only known keys', () => {
    for (const [role, access] of Object.entries(ROLE_ACCESS)) {
      for (const key of access.menus) {
        expect(MENU_KEYS).toContain(key);
      }
      for (const key of access.apps) {
        expect(APP_KEYS).toContain(key);
      }
      for (const key of access.widgets) {
        expect(WIDGET_KEYS).toContain(key);
      }
      expect(access.menus.length).toBeGreaterThan(0);
      expect(access.apps.length).toBeGreaterThan(0);
      expect(access.widgets.length).toBeGreaterThan(0);
      expect(role).toBeDefined();
    }
  });

  it('keeps Admin access as a superset', () => {
    const admin = ROLE_ACCESS.Admin;
    expect(admin.menus).toEqual(MENU_KEYS);
    expect(admin.apps).toEqual(APP_KEYS);
    expect(admin.widgets).toEqual(WIDGET_KEYS);
  });

  it('resolves access by merging known roles only', () => {
    const resolved = resolveAccess(['Viewer', 'Unknown', 'Operator']);
    expect(resolved.menus).toEqual(
      expect.arrayContaining(ROLE_ACCESS.Operator.menus)
    );
    expect(resolved.apps).toEqual(
      expect.arrayContaining(ROLE_ACCESS.Operator.apps)
    );
    expect(resolved.widgets).toEqual(
      expect.arrayContaining(ROLE_ACCESS.Operator.widgets)
    );
  });

  it('exposes helpers for menus, apps, and widgets', () => {
    expect(getAllowedMenus(['Viewer'])).toEqual(ROLE_ACCESS.Viewer.menus);
    expect(getAllowedApps(['Viewer'])).toEqual(ROLE_ACCESS.Viewer.apps);
    expect(getAllowedWidgets(['Viewer'])).toEqual(ROLE_ACCESS.Viewer.widgets);
  });
});
