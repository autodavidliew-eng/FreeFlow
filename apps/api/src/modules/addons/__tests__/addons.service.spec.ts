import type { AuthenticatedUser } from '@freeflow/auth';

import type { RoleAccessService } from '../../access/role-access.service';
import type { TenantContextService } from '../../tenants/tenant-context';
import type { TenantPostgresFactory } from '../../tenants/tenant-data.factory';
import { AddonsService } from '../addons.service';

describe('AddonsService', () => {
  it('filters app catalog by viewer roles', async () => {
    const catalog = [
      {
        appKey: 'electric-meter',
        name: 'Electric Meter',
        icon: 'bolt',
        launchUrl: '/apps/electric-meter',
        integrationMode: 'embedded',
        enabled: true,
      },
      {
        appKey: 'report',
        name: 'Report',
        icon: 'file-text',
        launchUrl: '/apps/report',
        integrationMode: 'embedded',
        enabled: true,
      },
      {
        appKey: 'system-configuration',
        name: 'System Configuration',
        icon: 'settings',
        launchUrl: '/apps/system-configuration',
        integrationMode: 'embedded',
        enabled: true,
      },
    ];

    const prisma = {
      appCatalog: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          const allowed = new Set(where?.appKey?.in ?? []);
          return catalog.filter(
            (item) => allowed.has(item.appKey) && item.enabled
          );
        }),
      },
    };

    const tenantFactory = {
      getClient: () => prisma,
    } as unknown as TenantPostgresFactory;

    const tenantContext = {
      require: jest.fn(),
    } as unknown as TenantContextService;

    const roleAccess = {
      getAllowedApps: jest.fn().mockResolvedValue(['electric-meter', 'report']),
    } as unknown as RoleAccessService;

    const service = new AddonsService(tenantFactory, tenantContext, roleAccess);

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

    const result = await service.getApps(user);
    const keys = result.items.map((item) => item.appKey);

    expect(keys).toEqual(['electric-meter', 'report']);
    expect(keys).not.toContain('system-configuration');
  });
});
