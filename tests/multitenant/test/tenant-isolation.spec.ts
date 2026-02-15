import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { createQdrantClient } from '@freeflow/db-qdrant';
import { MongoClient } from 'mongodb';
import { Client } from 'pg';
import { GenericContainer } from 'testcontainers';
import type { StartedTestContainer } from 'testcontainers';

jest.mock('@freeflow/keycloak-admin', () => {
  const realms = new Set<string>();
  const disabledRealms = new Set<string>();
  const deletedRealms = new Set<string>();

  class KeycloakAdminClient {
    async realmExists(realmName: string): Promise<boolean> {
      return realms.has(realmName);
    }

    async createRealm(realm: Record<string, unknown>): Promise<void> {
      const realmName = String(realm.realm ?? realm.id ?? '');
      if (realmName) {
        realms.add(realmName);
      }
    }

    async disableRealm(realmName: string): Promise<void> {
      disabledRealms.add(realmName);
    }

    async deleteRealm(realmName: string): Promise<void> {
      realms.delete(realmName);
      deletedRealms.add(realmName);
    }
  }

  return {
    KeycloakAdminClient,
    __mock: {
      realms,
      disabledRealms,
      deletedRealms,
      reset: () => {
        realms.clear();
        disabledRealms.clear();
        deletedRealms.clear();
      },
    },
  };
});

describe('Multi-tenant isolation (MT-5)', () => {
  jest.setTimeout(240_000);

  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const suffix = Date.now().toString().slice(-6);
  const tenantAName = `mt5a${suffix}`;
  const tenantBName = `mt5b${suffix}`;
  const masterDbName = `freeflow_master_${suffix}`;

  let postgresContainer: StartedTestContainer;
  let mongoContainer: StartedTestContainer;
  let qdrantContainer: StartedTestContainer;

  let adminPostgresUrl: string;
  let masterDatabaseUrl: string;
  let mongoAdminUri: string;
  let qdrantUrl: string;
  let storageRoot: string;

  let TenantProvisioningService: any;
  let TenantRemovalService: any;
  let findTenantByName: any;
  let masterPrisma: any;

  const waitForPostgresReady = async (container: StartedTestContainer) => {
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const result = await container.exec(['pg_isready', '-U', 'freeflow']);
      if (result.exitCode === 0) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error('Timed out waiting for Postgres readiness');
  };

  const waitForQdrant = async (url: string, timeoutMs = 20_000) => {
    const started = Date.now();

    while (Date.now() - started < timeoutMs) {
      try {
        const response = await fetch(`${url.replace(/\/$/, '')}/collections`);
        if (response.ok) {
          return;
        }
      } catch {
        // ignore until ready
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error('Timed out waiting for Qdrant readiness');
  };

  const buildDatabaseUrl = (baseUrl: string, dbName: string) => {
    const url = new URL(baseUrl);
    url.pathname = `/${dbName}`;
    return url.toString();
  };

  const ensureDatabase = async (baseUrl: string, dbName: string) => {
    const client = new Client({ connectionString: baseUrl });
    await client.connect();

    try {
      const result = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );
      if (!result.rowCount) {
        await client.query(`CREATE DATABASE "${dbName}"`);
      }
    } finally {
      await client.end();
    }
  };

  beforeAll(async () => {
    postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_DB: 'postgres',
        POSTGRES_USER: 'freeflow',
        POSTGRES_PASSWORD: 'freeflow_dev_password',
      })
      .withExposedPorts(5432)
      .start();

    mongoContainer = await new GenericContainer('mongo:7')
      .withExposedPorts(27017)
      .start();

    qdrantContainer = await new GenericContainer('qdrant/qdrant:latest')
      .withExposedPorts(6333)
      .start();

    const pgHost = postgresContainer.getHost();
    const pgPort = postgresContainer.getMappedPort(5432);
    adminPostgresUrl = `postgresql://freeflow:freeflow_dev_password@${pgHost}:${pgPort}/postgres`;

    await waitForPostgresReady(postgresContainer);

    await ensureDatabase(adminPostgresUrl, masterDbName);
    masterDatabaseUrl = buildDatabaseUrl(adminPostgresUrl, masterDbName);

    const mongoHost = mongoContainer.getHost();
    const mongoPort = mongoContainer.getMappedPort(27017);
    mongoAdminUri = `mongodb://${mongoHost}:${mongoPort}`;

    const qdrantHost = qdrantContainer.getHost();
    const qdrantPort = qdrantContainer.getMappedPort(6333);
    qdrantUrl = `http://${qdrantHost}:${qdrantPort}`;
    await waitForQdrant(qdrantUrl);

    storageRoot = path.join(repoRoot, 'storage', 'tenants-test', suffix);
    await fs.mkdir(storageRoot, { recursive: true });

    process.env.MASTER_DATABASE_URL = masterDatabaseUrl;
    process.env.POSTGRES_ADMIN_URL = adminPostgresUrl;
    process.env.MONGODB_ADMIN_URI = mongoAdminUri;
    process.env.QDRANT_URL = qdrantUrl;
    process.env.KEYCLOAK_BASE_URL = 'http://keycloak.test.local';
    process.env.KEYCLOAK_ADMIN_USERNAME = 'admin';
    process.env.KEYCLOAK_ADMIN_PASSWORD = 'admin';
    process.env.KEYCLOAK_ADMIN_CLIENT_ID = 'admin-cli';
    process.env.KEYCLOAK_REALM_TEMPLATE_PATH = path.join(
      repoRoot,
      'infra/compose/keycloak/realms/freeflow-realm.json'
    );
    process.env.TENANT_STORAGE_ROOT = storageRoot;
    process.env.ROLLBACK_ON_FAILURE = 'false';

    const env = { ...process.env, MASTER_DATABASE_URL: masterDatabaseUrl };
    execSync('pnpm --filter @freeflow/db-master db:generate', {
      cwd: repoRoot,
      env,
      stdio: 'pipe',
    });
    execSync('pnpm --filter @freeflow/db-master db:deploy', {
      cwd: repoRoot,
      env,
      stdio: 'pipe',
    });

    ({ TenantProvisioningService, TenantRemovalService, findTenantByName } =
      await import('@freeflow/tenant-provisioning'));

    ({ prisma: masterPrisma } = await import('@freeflow/db-master'));
  });

  afterAll(async () => {
    if (masterPrisma) {
      await masterPrisma.$disconnect();
    }

    if (postgresContainer) {
      await postgresContainer.stop();
    }
    if (mongoContainer) {
      await mongoContainer.stop();
    }
    if (qdrantContainer) {
      await qdrantContainer.stop();
    }

    if (storageRoot) {
      await fs.rm(storageRoot, { recursive: true, force: true });
    }
  });

  it('provisions tenants, isolates data, and cleans up resources', async () => {
    const provisioningService = new TenantProvisioningService();
    const removalService = new TenantRemovalService();

    const keycloakMock = jest.requireMock('@freeflow/keycloak-admin') as {
      __mock: {
        realms: Set<string>;
        disabledRealms: Set<string>;
        deletedRealms: Set<string>;
      };
    };

    const { tenant: tenantA } =
      await provisioningService.provisionTenant(tenantAName);
    const { tenant: tenantB } =
      await provisioningService.provisionTenant(tenantBName);

    const tenantARecord = await findTenantByName(tenantAName);
    const tenantBRecord = await findTenantByName(tenantBName);

    expect(tenantARecord?.status).toBe('active');
    expect(tenantBRecord?.status).toBe('active');

    const tenantAUrl = buildDatabaseUrl(adminPostgresUrl, tenantA.postgresDb);
    const tenantBUrl = buildDatabaseUrl(adminPostgresUrl, tenantB.postgresDb);

    const testExternalId = `test-${tenantAName}`;
    const testEmail = `${testExternalId}@freeflow.local`;

    const tenantAClient = new Client({ connectionString: tenantAUrl });
    await tenantAClient.connect();
    await tenantAClient.query(
      'INSERT INTO "UserProfile" ("externalId", "email", "name", "roles", "updatedAt") VALUES ($1, $2, $3, $4, NOW())',
      [testExternalId, testEmail, 'Admin', ['Admin']]
    );
    await tenantAClient.end();

    const tenantBClient = new Client({ connectionString: tenantBUrl });
    await tenantBClient.connect();
    const countResult = await tenantBClient.query(
      'SELECT COUNT(*) FROM "UserProfile" WHERE "externalId" = $1',
      [testExternalId]
    );
    await tenantBClient.end();

    expect(Number(countResult.rows[0].count)).toBe(0);

    await removalService.removeTenant(tenantA.id, 'soft', false);
    const updatedTenantA = await findTenantByName(tenantAName);

    expect(updatedTenantA?.status).toBe('suspended');
    expect(keycloakMock.__mock.disabledRealms.has(tenantA.realmName)).toBe(
      true
    );

    await removalService.removeTenant(tenantB.id, 'hard', true);

    const removedTenantB = await findTenantByName(tenantBName);
    expect(removedTenantB).toBeNull();

    const adminClient = new Client({ connectionString: adminPostgresUrl });
    await adminClient.connect();
    const dbCheck = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [tenantB.postgresDb]
    );
    await adminClient.end();

    expect(dbCheck.rowCount).toBe(0);

    const mongoClient = new MongoClient(mongoAdminUri);
    await mongoClient.connect();
    const { databases } = await mongoClient.db().admin().listDatabases();
    await mongoClient.close();

    expect(databases.some((db) => db.name === tenantB.mongoDb)).toBe(false);

    const qdrantClient = createQdrantClient({ url: qdrantUrl });
    await expect(
      qdrantClient.getCollection(tenantB.qdrantCollection)
    ).rejects.toThrow();

    const tenantBStoragePath = path.join(storageRoot, tenantBName);
    expect(existsSync(tenantBStoragePath)).toBe(false);
    expect(keycloakMock.__mock.deletedRealms.has(tenantB.realmName)).toBe(true);
  });
});
