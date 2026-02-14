/** @jest-environment node */
import { getAllowedWidgetsForRoles, hasKnownRole } from '../rbac';

describe('rbac helpers', () => {
  it('recognizes known roles from the permissions matrix', async () => {
    await expect(hasKnownRole(['Viewer'])).resolves.toBe(true);
  });

  it('rejects unknown roles', async () => {
    await expect(hasKnownRole(['Ghost'])).resolves.toBe(false);
  });

  it('returns allowed widgets for a role', async () => {
    const allowed = await getAllowedWidgetsForRoles(['Viewer']);
    expect(allowed.has('kpi-widget')).toBe(true);
    expect(allowed.has('alarm-widget')).toBe(true);
  });

  it('returns an empty set when no widgets are allowed', async () => {
    const allowed = await getAllowedWidgetsForRoles(['Ghost']);
    expect(allowed.size).toBe(0);
  });
});
