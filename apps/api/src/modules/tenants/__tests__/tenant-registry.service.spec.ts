import { BadRequestException } from '@nestjs/common';

const provisionTenant = jest.fn();
const removeTenant = jest.fn();

jest.mock('@freeflow/db-master', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@freeflow/tenant-provisioning', () => ({
  TenantProvisioningService: jest.fn().mockImplementation(() => ({
    provisionTenant,
  })),
  TenantRemovalService: jest.fn().mockImplementation(() => ({
    removeTenant,
  })),
}));

import { prisma } from '@freeflow/db-master';

import { TenantRegistryService } from '../tenant-registry.service';

type TenantRecord = {
  id: string;
  name: string;
  realmName: string;
  postgresDb: string;
  mongoDb: string;
  qdrantCollection: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

const sampleTenant = (): TenantRecord => ({
  id: 'tenant-1',
  name: 'acme',
  realmName: 'freeflow-acme',
  postgresDb: 'freeflow_acme',
  mongoDb: 'freeflow_acme',
  qdrantCollection: 'freeflow_acme_vectors',
  status: 'active',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
});

describe('TenantRegistryService', () => {
  beforeEach(() => {
    provisionTenant.mockReset();
    removeTenant.mockReset();
    (prisma.$queryRaw as jest.Mock).mockReset();
  });

  it('rejects invalid tenant names', async () => {
    const service = new TenantRegistryService();

    await expect(service.createTenant({ name: '' })).rejects.toBeInstanceOf(
      BadRequestException
    );

    await expect(
      service.createTenant({ name: 'Too Long Name' })
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.createTenant({ name: 'bad-name' })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('provisions a tenant and maps response', async () => {
    const service = new TenantRegistryService();
    const tenant = sampleTenant();
    provisionTenant.mockResolvedValue({ tenant });

    const result = await service.createTenant({ name: 'Acme' });

    expect(provisionTenant).toHaveBeenCalledWith('acme');
    expect(result.name).toBe('acme');
    expect(result.realmName).toBe('freeflow-acme');
    expect(result.createdAt).toBe(tenant.createdAt.toISOString());
  });

  it('lists tenants from the master database', async () => {
    const service = new TenantRegistryService();
    const tenant = sampleTenant();
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([tenant]);

    const result = await service.listTenants();

    expect(result.total).toBe(1);
    expect(result.items[0].name).toBe('acme');
    expect(result.items[0].updatedAt).toBe(tenant.updatedAt.toISOString());
  });

  it('removes a tenant via the removal service', async () => {
    const service = new TenantRegistryService();
    const tenant = sampleTenant();
    removeTenant.mockResolvedValue(tenant);

    const result = await service.removeTenant('tenant-1', 'soft', false);

    expect(removeTenant).toHaveBeenCalledWith('tenant-1', 'soft', false);
    expect(result.id).toBe('tenant-1');
  });
});
