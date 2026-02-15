const disableRealm = jest.fn();
const deleteRealm = jest.fn();

jest.mock('@freeflow/keycloak-admin', () => ({
  KeycloakAdminClient: jest.fn().mockImplementation(() => ({
    disableRealm,
    deleteRealm,
  })),
}));

const findTenantById = jest.fn();
const updateTenantStatus = jest.fn();
const insertProvisionLog = jest.fn();
const deleteTenantById = jest.fn();

jest.mock('../master-db', () => ({
  findTenantById,
  updateTenantStatus,
  insertProvisionLog,
  deleteTenantById,
}));

const dropPostgresDatabase = jest.fn();
const dropMongoDatabase = jest.fn();
const dropQdrantCollection = jest.fn();
const removeTenantStorage = jest.fn();

jest.mock('../steps/postgres', () => ({ dropPostgresDatabase }));
jest.mock('../steps/mongo', () => ({ dropMongoDatabase }));
jest.mock('../steps/qdrant', () => ({ dropQdrantCollection }));
jest.mock('../steps/storage', () => ({ removeTenantStorage }));

import type { ProvisioningConfig } from '../config';
import type { TenantRecord } from '../master-db';
import { TenantRemovalService } from '../tenant-removal.service';

const baseConfig: ProvisioningConfig = {
  masterDatabaseUrl: 'postgresql://master',
  postgresAdminUrl: 'postgresql://postgres',
  mongoAdminUri: 'mongodb://mongo',
  qdrantUrl: 'http://qdrant',
  qdrantVectorSize: 1536,
  qdrantDistance: 'Cosine',
  keycloakBaseUrl: 'http://keycloak',
  keycloakAdminUsername: 'admin',
  keycloakAdminPassword: 'admin',
  keycloakAdminClientId: 'admin-cli',
  keycloakAdminClientSecret: undefined,
  keycloakRealmTemplatePath: '/tmp/realm.json',
  storageRoot: '/tmp/storage',
  rollbackOnFailure: false,
  retryAttempts: 1,
  retryDelayMs: 10,
};

const sampleTenant = (overrides: Partial<TenantRecord> = {}): TenantRecord => ({
  id: 'tenant-1',
  name: 'acme',
  realmName: 'freeflow-acme',
  postgresDb: 'freeflow_acme',
  mongoDb: 'freeflow_acme',
  qdrantCollection: 'freeflow_acme_vectors',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('TenantRemovalService', () => {
  beforeEach(() => {
    disableRealm.mockReset();
    deleteRealm.mockReset();
    findTenantById.mockReset();
    updateTenantStatus.mockReset();
    insertProvisionLog.mockReset();
    deleteTenantById.mockReset();
    dropPostgresDatabase.mockReset();
    dropMongoDatabase.mockReset();
    dropQdrantCollection.mockReset();
    removeTenantStorage.mockReset();
  });

  it('performs soft delete by suspending tenant and disabling realm', async () => {
    const tenant = sampleTenant();
    findTenantById.mockResolvedValueOnce(tenant).mockResolvedValueOnce({
      ...tenant,
      status: 'suspended',
    });

    const service = new TenantRemovalService(baseConfig);
    const result = await service.removeTenant(tenant.id, 'soft', false);

    expect(updateTenantStatus).toHaveBeenCalledWith(tenant.id, 'suspended');
    expect(disableRealm).toHaveBeenCalledWith(tenant.realmName);
    expect(deleteTenantById).not.toHaveBeenCalled();
    expect(result.status).toBe('suspended');
  });

  it('requires force for hard delete', async () => {
    findTenantById.mockResolvedValueOnce(sampleTenant());
    const service = new TenantRemovalService(baseConfig);

    await expect(
      service.removeTenant('tenant-1', 'hard', false)
    ).rejects.toThrow('force=true is required for hard delete.');
  });

  it('performs hard delete by removing all resources', async () => {
    const tenant = sampleTenant();
    findTenantById.mockResolvedValueOnce(tenant);

    const service = new TenantRemovalService(baseConfig);
    const result = await service.removeTenant(tenant.id, 'hard', true);

    expect(updateTenantStatus).toHaveBeenCalledWith(tenant.id, 'deleting');
    expect(disableRealm).toHaveBeenCalledWith(tenant.realmName);
    expect(deleteRealm).toHaveBeenCalledWith(tenant.realmName);
    expect(dropPostgresDatabase).toHaveBeenCalledWith(
      baseConfig.postgresAdminUrl,
      tenant.postgresDb
    );
    expect(dropMongoDatabase).toHaveBeenCalledWith(
      baseConfig.mongoAdminUri,
      tenant.mongoDb
    );
    expect(dropQdrantCollection).toHaveBeenCalledWith(
      baseConfig.qdrantUrl,
      tenant.qdrantCollection
    );
    expect(removeTenantStorage).toHaveBeenCalledWith(
      baseConfig.storageRoot,
      tenant.name
    );
    expect(deleteTenantById).toHaveBeenCalledWith(tenant.id);
    expect(result.id).toBe(tenant.id);
  });

  it('rejects protected tenants', async () => {
    const tenant = sampleTenant({ name: 'freeflow' });
    findTenantById.mockResolvedValueOnce(tenant);
    const service = new TenantRemovalService(baseConfig);

    await expect(
      service.removeTenant(tenant.id, 'soft', false)
    ).rejects.toThrow('Protected tenant cannot be removed.');
  });
});
