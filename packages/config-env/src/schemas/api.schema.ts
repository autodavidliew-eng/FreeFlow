import { z } from 'zod';

import { BaseEnvSchema } from './base.schema';

/**
 * Environment schema for NestJS API Gateway
 */
export const ApiEnvSchema = BaseEnvSchema.extend({
  // Server
  PORT: z.coerce
    .number()
    .min(1000, 'Port must be >= 1000')
    .max(65535, 'Port must be <= 65535')
    .default(4000),

  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://', 'Must be a PostgreSQL connection string')
    .describe('PostgreSQL connection string'),

  MASTER_DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://', 'Must be a PostgreSQL connection string')
    .describe('Master tenant registry PostgreSQL connection string'),

  DB_POOL_SIZE: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(10)
    .describe('Database connection pool size'),

  MONGODB_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\//, 'Must be a MongoDB connection string')
    .describe('MongoDB connection string'),

  QDRANT_URL: z.string().url().describe('Qdrant base URL'),

  QDRANT_API_KEY: z.string().optional().describe('Qdrant API key (optional)'),

  TENANT_BASE_DOMAIN: z
    .string()
    .optional()
    .describe('Base domain for tenant subdomain resolution'),

  TENANT_HEADER_NAME: z
    .string()
    .default('x-tenant-id')
    .describe('HTTP header name used for tenant resolution'),

  TENANT_HEADER_ENABLED: z.coerce
    .boolean()
    .default(true)
    .describe('Enable tenant resolution via header'),

  // Redis (optional for caching)
  REDIS_URL: z
    .string()
    .url()
    .optional()
    .describe('Redis connection string (optional)'),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, 'JWT secret must be at least 32 characters for security')
    .describe('Secret key for signing JWT tokens'),

  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'Must be a valid time string (e.g., 15m, 1h, 7d)')
    .default('15m')
    .describe('Access token expiration time'),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'Must be a valid time string')
    .default('7d')
    .describe('Refresh token expiration time'),

  // Session
  SESSION_SECRET: z
    .string()
    .min(32, 'Session secret must be at least 32 characters for security')
    .describe('Secret key for signing session cookies'),

  // CORS
  CORS_ORIGIN: z
    .string()
    .url()
    .default('http://localhost:3000')
    .describe('Allowed CORS origin (frontend URL)'),

  CORS_CREDENTIALS: z.coerce
    .boolean()
    .default(true)
    .describe('Allow credentials (cookies) in CORS requests'),

  // Cookie settings
  COOKIE_DOMAIN: z
    .string()
    .optional()
    .describe('Cookie domain (e.g., .freeflow.dev)'),

  COOKIE_SECURE: z.coerce
    .boolean()
    .default(false)
    .describe('Use secure cookies (HTTPS only)'),

  COOKIE_SAME_SITE: z
    .enum(['strict', 'lax', 'none'])
    .default('lax')
    .describe('SameSite cookie attribute'),

  // Rate limiting
  RATE_LIMIT_TTL: z.coerce
    .number()
    .default(60)
    .describe('Rate limit window in seconds'),

  RATE_LIMIT_MAX: z.coerce
    .number()
    .default(100)
    .describe('Max requests per window'),

  // Service URLs (for inter-service communication)
  AUTH_SERVICE_URL: z
    .string()
    .url()
    .optional()
    .describe('Auth service internal URL'),

  DASHBOARD_SERVICE_URL: z
    .string()
    .url()
    .optional()
    .describe('Dashboard service internal URL'),

  NOTIFICATION_SERVICE_URL: z
    .string()
    .url()
    .optional()
    .describe('Notification service internal URL'),

  TASK_SERVICE_URL: z
    .string()
    .url()
    .optional()
    .describe('Task service internal URL'),

  MINIAPP_SERVICE_URL: z
    .string()
    .url()
    .optional()
    .describe('MiniApp service internal URL'),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

/**
 * Validate API environment variables
 * Throws error if validation fails
 */
export function validateApiEnv(
  env: Record<string, unknown> = process.env
): ApiEnv {
  const result = ApiEnvSchema.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid API environment configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('API environment validation failed');
  }

  return result.data;
}
