import type { AuthenticatedUser } from '@freeflow/auth';

import type { TenantPostgresFactory } from '../../tenants/tenant-data.factory';
import { UiService } from '../ui.service';

describe('UiService', () => {
  it('filters widget catalog by viewer roles', async () => {
    const catalog = [
      {
        key: 'kpi-widget',
        name: 'Key Metrics',
        type: 'kpi',
        defaultConfig: null,
      },
      {
        key: 'chart-widget',
        name: 'Load Distribution',
        type: 'chart',
        defaultConfig: null,
      },
      {
        key: 'alarm-widget',
        name: 'Active Alarms',
        type: 'alarm-list',
        defaultConfig: null,
      },
      {
        key: 'admin-widget',
        name: 'Admin Control',
        type: 'admin',
        defaultConfig: null,
      },
    ];

    const prisma = {
      widgetCatalog: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          const allowed = new Set(where?.key?.in ?? []);
          return catalog.filter((item) => allowed.has(item.key));
        }),
      },
      roleDashboardLayout: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const tenantFactory = {
      getClient: () => prisma,
    } as unknown as TenantPostgresFactory;

    const service = new UiService(tenantFactory);

    const user: AuthenticatedUser = {
      sub: 'viewer-1',
      email: 'viewer@freeflow.dev',
      name: 'Viewer',
      roles: ['Viewer'],
      freeflowRoles: ['Viewer'],
      token: 'token',
      claims: {
        iss: 'http://localhost:8080/realms/freeflow',
        aud: 'freeflow-api',
        sub: 'viewer-1',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        email: 'viewer@freeflow.dev',
      },
    };

    const result = await service.getWidgetCatalog(user);
    const keys = result.items.map((item) => item.key);

    expect(keys).toEqual(['kpi-widget', 'chart-widget']);
  });
});
