import { KeycloakAdminClient } from '@freeflow/keycloak-admin';

import { loadProvisioningConfig, type ProvisioningConfig } from './config';
import type { TenantRecord } from './master-db';
import {
  createTenant,
  findTenantByName,
  insertProvisionLog,
  updateTenantStatus,
  upsertTenantConnection,
} from './master-db';
import { ensureKeycloakRealm } from './steps/keycloak';
import { runTenantMigrations } from './steps/migrations';
import { dropMongoDatabase, ensureMongoDatabase } from './steps/mongo';
import { dropPostgresDatabase, ensurePostgresDatabase } from './steps/postgres';
import { dropQdrantCollection, ensureQdrantCollection } from './steps/qdrant';
import { ensureTenantStorage, removeTenantStorage } from './steps/storage';
import { withRetry } from './utils';

const TENANT_NAME_PATTERN = /^[a-z0-9]{3,30}$/;

type ProvisioningOutcome = {
  tenant: TenantRecord;
  postgresDatabaseUrl: string;
};

type ProvisioningStep = {
  name: string;
  run: () => Promise<void>;
  rollback?: () => Promise<void>;
};

const buildTenantNames = (tenantName: string) => {
  const base = `freeflow_${tenantName}`;

  return {
    realmName: `freeflow-${tenantName}`,
    postgresDb: base,
    mongoDb: base,
    qdrantCollection: `${base}_vectors`,
  };
};

const buildPostgresTenantUrl = (adminUrl: string, dbName: string): string => {
  const url = new URL(adminUrl);
  url.pathname = `/${dbName}`;
  return url.toString();
};

const parseHostInfo = (connectionString: string, defaultPort: number) => {
  const url = new URL(connectionString);
  const port = url.port ? Number(url.port) : defaultPort;

  return {
    host: url.hostname || null,
    port: Number.isNaN(port) ? null : port,
    username: url.username || null,
  };
};

export class TenantProvisioningService {
  private readonly config: ProvisioningConfig;
  private readonly repoRoot: string;

  constructor(config: ProvisioningConfig = loadProvisioningConfig()) {
    this.config = config;
    this.repoRoot = process.cwd();
  }

  async provisionTenant(tenantName: string): Promise<ProvisioningOutcome> {
    const tenantKey = tenantName.trim().toLowerCase();

    if (!TENANT_NAME_PATTERN.test(tenantKey)) {
      throw new Error(
        'Tenant name must be 3-30 lowercase letters or digits with no spaces.'
      );
    }

    const names = buildTenantNames(tenantKey);
    let tenant = await findTenantByName(tenantKey);

    if (!tenant) {
      tenant = await createTenant({
        name: tenantKey,
        realmName: names.realmName,
        postgresDb: names.postgresDb,
        mongoDb: names.mongoDb,
        qdrantCollection: names.qdrantCollection,
      });
    } else {
      await updateTenantStatus(tenant.id, 'provisioning');
    }

    await insertProvisionLog({
      tenantId: tenant.id,
      step: 'initialize',
      status: 'started',
      message: 'Starting tenant provisioning.',
    });

    const keycloakClient = new KeycloakAdminClient({
      baseUrl: this.config.keycloakBaseUrl,
      username: this.config.keycloakAdminUsername,
      password: this.config.keycloakAdminPassword,
      clientId: this.config.keycloakAdminClientId,
      clientSecret: this.config.keycloakAdminClientSecret,
    });

    const postgresTenantUrl = buildPostgresTenantUrl(
      this.config.postgresAdminUrl,
      names.postgresDb
    );

    const postgresInfo = parseHostInfo(this.config.postgresAdminUrl, 5432);
    const mongoInfo = parseHostInfo(this.config.mongoAdminUri, 27017);
    const qdrantInfo = parseHostInfo(this.config.qdrantUrl, 6333);

    await upsertTenantConnection({
      tenantId: tenant.id,
      service: 'postgres',
      dbName: names.postgresDb,
      host: postgresInfo.host,
      port: postgresInfo.port,
      username: postgresInfo.username,
    });

    await upsertTenantConnection({
      tenantId: tenant.id,
      service: 'mongodb',
      dbName: names.mongoDb,
      host: mongoInfo.host,
      port: mongoInfo.port,
      username: mongoInfo.username,
    });

    await upsertTenantConnection({
      tenantId: tenant.id,
      service: 'qdrant',
      dbName: names.qdrantCollection,
      host: qdrantInfo.host,
      port: qdrantInfo.port,
      username: null,
      options: {
        vectorSize: this.config.qdrantVectorSize,
        distance: this.config.qdrantDistance,
      },
    });

    const steps: ProvisioningStep[] = [
      {
        name: 'keycloak',
        run: () =>
          ensureKeycloakRealm({
            client: keycloakClient,
            realmName: names.realmName,
            displayName: `FreeFlow ${tenantKey}`,
            templatePath: this.config.keycloakRealmTemplatePath,
          }),
        rollback: () => keycloakClient.deleteRealm(names.realmName),
      },
      {
        name: 'postgres',
        run: () =>
          ensurePostgresDatabase(
            this.config.postgresAdminUrl,
            names.postgresDb
          ),
        rollback: () =>
          dropPostgresDatabase(this.config.postgresAdminUrl, names.postgresDb),
      },
      {
        name: 'mongo',
        run: () =>
          ensureMongoDatabase(this.config.mongoAdminUri, names.mongoDb),
        rollback: () =>
          dropMongoDatabase(this.config.mongoAdminUri, names.mongoDb),
      },
      {
        name: 'qdrant',
        run: () =>
          ensureQdrantCollection({
            qdrantUrl: this.config.qdrantUrl,
            collectionName: names.qdrantCollection,
            vectorSize: this.config.qdrantVectorSize,
            distance: this.config.qdrantDistance,
          }),
        rollback: () =>
          dropQdrantCollection(this.config.qdrantUrl, names.qdrantCollection),
      },
      {
        name: 'migrations',
        run: () =>
          runTenantMigrations({
            databaseUrl: postgresTenantUrl,
            repoRoot: this.repoRoot,
          }),
      },
      {
        name: 'storage',
        run: () => ensureTenantStorage(this.config.storageRoot, tenantKey),
        rollback: () => removeTenantStorage(this.config.storageRoot, tenantKey),
      },
    ];

    try {
      for (const step of steps) {
        await this.runStep(tenant.id, step);
      }

      await updateTenantStatus(tenant.id, 'active');
      await insertProvisionLog({
        tenantId: tenant.id,
        step: 'finalize',
        status: 'succeeded',
        message: 'Tenant provisioning completed.',
      });

      const refreshed = await findTenantByName(tenantKey);
      if (!refreshed) {
        throw new Error('Tenant not found after provisioning.');
      }

      return {
        tenant: refreshed,
        postgresDatabaseUrl: postgresTenantUrl,
      };
    } catch (error) {
      await updateTenantStatus(tenant.id, 'suspended');
      await insertProvisionLog({
        tenantId: tenant.id,
        step: 'failed',
        status: 'failed',
        message: error instanceof Error ? error.message : String(error),
      });

      if (this.config.rollbackOnFailure) {
        await this.rollbackSteps(tenant.id, steps);
      }

      throw error;
    }
  }

  private async runStep(
    tenantId: string,
    step: ProvisioningStep
  ): Promise<void> {
    await insertProvisionLog({
      tenantId,
      step: step.name,
      status: 'started',
    });

    await withRetry(
      step.run,
      this.config.retryAttempts,
      this.config.retryDelayMs,
      step.name
    );

    await insertProvisionLog({
      tenantId,
      step: step.name,
      status: 'succeeded',
    });
  }

  private async rollbackSteps(
    tenantId: string,
    steps: ProvisioningStep[]
  ): Promise<void> {
    const rollbackSteps = steps.filter((step) => step.rollback).reverse();

    for (const step of rollbackSteps) {
      try {
        await insertProvisionLog({
          tenantId,
          step: `${step.name}:rollback`,
          status: 'started',
        });

        await step.rollback?.();

        await insertProvisionLog({
          tenantId,
          step: `${step.name}:rollback`,
          status: 'succeeded',
        });
      } catch (error) {
        await insertProvisionLog({
          tenantId,
          step: `${step.name}:rollback`,
          status: 'failed',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}
