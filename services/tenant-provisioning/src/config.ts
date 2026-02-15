import path from 'path';

export type ProvisioningConfig = {
  masterDatabaseUrl: string;
  postgresAdminUrl: string;
  mongoAdminUri: string;
  qdrantUrl: string;
  qdrantVectorSize: number;
  qdrantDistance: 'Cosine' | 'Dot' | 'Euclid';
  keycloakBaseUrl: string;
  keycloakAdminUsername: string;
  keycloakAdminPassword: string;
  keycloakAdminClientId: string;
  keycloakAdminClientSecret?: string;
  keycloakRealmTemplatePath: string;
  storageRoot: string;
  rollbackOnFailure: boolean;
  retryAttempts: number;
  retryDelayMs: number;
};

const requireEnv = (
  env: Record<string, string | undefined>,
  key: string
): string => {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const loadProvisioningConfig = (
  env: Record<string, string | undefined> = process.env
): ProvisioningConfig => {
  const repoRoot = process.cwd();

  return {
    masterDatabaseUrl: requireEnv(env, 'MASTER_DATABASE_URL'),
    postgresAdminUrl: requireEnv(env, 'POSTGRES_ADMIN_URL'),
    mongoAdminUri: requireEnv(env, 'MONGODB_ADMIN_URI'),
    qdrantUrl: requireEnv(env, 'QDRANT_URL'),
    qdrantVectorSize: Number(env.QDRANT_VECTOR_SIZE ?? 1536),
    qdrantDistance:
      (env.QDRANT_DISTANCE as ProvisioningConfig['qdrantDistance']) ?? 'Cosine',
    keycloakBaseUrl: requireEnv(env, 'KEYCLOAK_BASE_URL'),
    keycloakAdminUsername: requireEnv(env, 'KEYCLOAK_ADMIN_USERNAME'),
    keycloakAdminPassword: requireEnv(env, 'KEYCLOAK_ADMIN_PASSWORD'),
    keycloakAdminClientId: env.KEYCLOAK_ADMIN_CLIENT_ID ?? 'admin-cli',
    keycloakAdminClientSecret: env.KEYCLOAK_ADMIN_CLIENT_SECRET,
    keycloakRealmTemplatePath:
      env.KEYCLOAK_REALM_TEMPLATE_PATH ??
      path.resolve(
        repoRoot,
        'infra/compose/keycloak/realms/freeflow-realm.json'
      ),
    storageRoot:
      env.TENANT_STORAGE_ROOT ?? path.resolve(repoRoot, 'storage/tenants'),
    rollbackOnFailure: env.ROLLBACK_ON_FAILURE === 'true',
    retryAttempts: Number(env.PROVISION_RETRY_ATTEMPTS ?? 3),
    retryDelayMs: Number(env.PROVISION_RETRY_DELAY_MS ?? 1500),
  };
};
