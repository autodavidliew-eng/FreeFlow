import { KeycloakAdminClient } from '@freeflow/keycloak-admin';

import { loadProvisioningConfig, type ProvisioningConfig } from './config';
import {
  deleteTenantById,
  findTenantById,
  insertProvisionLog,
  type TenantRecord,
  updateTenantStatus,
} from './master-db';
import { dropMongoDatabase } from './steps/mongo';
import { dropPostgresDatabase } from './steps/postgres';
import { dropQdrantCollection } from './steps/qdrant';
import { removeTenantStorage } from './steps/storage';

export type TenantRemovalMode = 'soft' | 'hard';

const PROTECTED_TENANTS = new Set(['freeflow', 'system']);

type RemovalStep = {
  name: string;
  run: () => Promise<void>;
};

export class TenantRemovalService {
  private readonly config: ProvisioningConfig;

  constructor(config: ProvisioningConfig = loadProvisioningConfig()) {
    this.config = config;
  }

  async removeTenant(
    tenantId: string,
    mode: TenantRemovalMode,
    force: boolean
  ): Promise<TenantRecord> {
    const tenant = await findTenantById(tenantId);

    if (!tenant) {
      throw new Error('Tenant not found.');
    }

    if (PROTECTED_TENANTS.has(tenant.name)) {
      throw new Error('Protected tenant cannot be removed.');
    }

    if (mode === 'hard' && !force) {
      throw new Error('force=true is required for hard delete.');
    }

    const keycloakClient = new KeycloakAdminClient({
      baseUrl: this.config.keycloakBaseUrl,
      username: this.config.keycloakAdminUsername,
      password: this.config.keycloakAdminPassword,
      clientId: this.config.keycloakAdminClientId,
      clientSecret: this.config.keycloakAdminClientSecret,
    });

    if (mode === 'soft') {
      await insertProvisionLog({
        tenantId: tenant.id,
        step: 'remove:soft',
        status: 'started',
        message: 'Soft delete requested.',
      });

      await updateTenantStatus(tenant.id, 'suspended');
      await keycloakClient.disableRealm(tenant.realmName);

      await insertProvisionLog({
        tenantId: tenant.id,
        step: 'remove:soft',
        status: 'succeeded',
      });

      const updated = await findTenantById(tenant.id);
      return updated ?? tenant;
    }

    await updateTenantStatus(tenant.id, 'deleting');

    const steps: RemovalStep[] = [
      {
        name: 'keycloak:disable',
        run: () => keycloakClient.disableRealm(tenant.realmName),
      },
      {
        name: 'keycloak:delete',
        run: () => keycloakClient.deleteRealm(tenant.realmName),
      },
      {
        name: 'postgres:drop',
        run: () =>
          dropPostgresDatabase(this.config.postgresAdminUrl, tenant.postgresDb),
      },
      {
        name: 'mongo:drop',
        run: () => dropMongoDatabase(this.config.mongoAdminUri, tenant.mongoDb),
      },
      {
        name: 'qdrant:drop',
        run: () =>
          dropQdrantCollection(this.config.qdrantUrl, tenant.qdrantCollection),
      },
      {
        name: 'storage:remove',
        run: () => removeTenantStorage(this.config.storageRoot, tenant.name),
      },
    ];

    try {
      for (const step of steps) {
        await insertProvisionLog({
          tenantId: tenant.id,
          step: step.name,
          status: 'started',
        });

        await step.run();

        await insertProvisionLog({
          tenantId: tenant.id,
          step: step.name,
          status: 'succeeded',
        });
      }

      await insertProvisionLog({
        tenantId: tenant.id,
        step: 'remove:finalize',
        status: 'succeeded',
        message: 'Hard delete completed.',
      });

      await deleteTenantById(tenant.id);

      return tenant;
    } catch (error) {
      await updateTenantStatus(tenant.id, 'suspended');
      await insertProvisionLog({
        tenantId: tenant.id,
        step: 'remove:failed',
        status: 'failed',
        message: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}
