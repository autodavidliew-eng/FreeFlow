export type FgaConfig = {
  apiUrl: string;
  storeId: string;
  modelId: string;
  apiToken?: string;
};

let cachedConfig: FgaConfig | null = null;

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

export const getFgaConfig = (
  env: Record<string, string | undefined> = process.env
): FgaConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    apiUrl: env.FGA_API_URL ?? 'http://localhost:8083',
    storeId: requireEnv(env, 'FGA_STORE_ID'),
    modelId: requireEnv(env, 'FGA_MODEL_ID'),
    apiToken: env.FGA_API_TOKEN,
  };

  return cachedConfig;
};

export const resetFgaConfigForTests = () => {
  cachedConfig = null;
};
