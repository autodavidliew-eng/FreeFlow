import { z } from 'zod';

/**
 * Base environment schema shared across all services
 */
export const BaseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),

  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug'])
    .default('info'),
});

export type BaseEnv = z.infer<typeof BaseEnvSchema>;
