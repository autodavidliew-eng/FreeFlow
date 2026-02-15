import type { AuthenticatedUser } from '@freeflow/auth';
import { ForbiddenException } from '@nestjs/common';
import { jwtVerify } from 'jose';

import type { TenantContextService } from '../../tenants/tenant-context';
import type { TenantPostgresFactory } from '../../tenants/tenant-data.factory';
import { AddonsService } from '../addons.service';

describe('AddonsService handoff', () => {
  const jwtSecret = 'test-secret-for-addon-handoff-1234567890';

  const tenantContext = {
    require: () => ({
      id: 'tenant-a',
      name: 'Tenant A',
      realmName: 'freeflow-tenant-a',
      postgresDb: 'freeflow_tenant_a',
      mongoDb: 'freeflow_tenant_a',
      qdrantCollection: 'freeflow_tenant_a_vectors',
      status: 'active',
    }),
  } as TenantContextService;

  const appCatalog = {
    appCatalog: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.appKey === 'system-configuration') {
          return {
            appKey: 'system-configuration',
            name: 'System Configuration',
            icon: 'settings',
            launchUrl: 'https://addons.freeflow.dev/system',
            integrationMode: 'external',
            enabled: true,
          };
        }
        return null;
      }),
      findMany: jest.fn(),
    },
  };

  const tenantFactory = {
    getClient: () => appCatalog,
  } as unknown as TenantPostgresFactory;

  beforeEach(() => {
    process.env.JWT_SECRET = jwtSecret;
    process.env.JWT_ISSUER = 'freeflow-api';
  });

  it('throws when RBAC forbids the app key', async () => {
    const service = new AddonsService(tenantFactory, tenantContext);
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

    await expect(
      service.handoff(user, { appKey: 'system-configuration' })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns a short-lived token when allowed', async () => {
    const service = new AddonsService(tenantFactory, tenantContext);
    const user: AuthenticatedUser = {
      sub: 'admin-1',
      email: 'admin@freeflow.dev',
      name: 'Admin',
      roles: ['Admin'],
      freeflowRoles: ['Admin'],
      token: 'token',
      claims: {
        iss: 'http://localhost:8080/realms/freeflow',
        aud: 'freeflow-api',
        sub: 'admin-1',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        email: 'admin@freeflow.dev',
      },
    };

    const result = await service.handoff(user, {
      appKey: 'system-configuration',
    });

    const { payload } = await jwtVerify(
      result.token,
      new TextEncoder().encode(jwtSecret),
      {
        issuer: 'freeflow-api',
        audience: 'system-configuration',
      }
    );

    expect(result.launchUrl).toBe('https://addons.freeflow.dev/system');
    expect(payload.sub).toBe('admin-1');
    expect(payload.tenant).toMatchObject({
      id: 'tenant-a',
      name: 'Tenant A',
      realm: 'freeflow-tenant-a',
    });
    if (payload.exp && payload.iat) {
      expect(payload.exp - payload.iat).toBeLessThanOrEqual(120);
    }
  });
});
