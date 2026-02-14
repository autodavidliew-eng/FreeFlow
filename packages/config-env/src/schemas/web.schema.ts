import { z } from 'zod';
import { BaseEnvSchema } from './base.schema';

/**
 * Public environment schema for Next.js (NEXT_PUBLIC_*)
 * These variables are exposed to the browser
 */
export const WebPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default('http://localhost:4000')
    .describe('API Gateway base URL'),

  NEXT_PUBLIC_APP_NAME: z
    .string()
    .default('FreeFlow')
    .describe('Application name'),

  NEXT_PUBLIC_APP_VERSION: z
    .string()
    .default('1.0.0')
    .describe('Application version'),

  NEXT_PUBLIC_ENVIRONMENT: z
    .enum(['development', 'staging', 'production'])
    .default('development')
    .describe('Current environment'),

  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .describe('Sentry DSN for error tracking (optional)'),

  NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce
    .boolean()
    .default(false)
    .describe('Enable analytics tracking'),
});

/**
 * Server-only environment schema for Next.js
 * These variables are NOT exposed to the browser
 */
export const WebServerEnvSchema = BaseEnvSchema.extend({
  // Session
  SESSION_SECRET: z
    .string()
    .min(32, 'Session secret must be at least 32 characters')
    .describe('Secret for signing session tokens'),

  // Internal API communication
  API_KEY: z
    .string()
    .min(32)
    .optional()
    .describe('API key for server-to-server requests'),

  // Analytics
  ANALYTICS_WRITE_KEY: z
    .string()
    .optional()
    .describe('Server-side analytics write key'),
});

/**
 * Combined Next.js environment schema
 */
export const WebEnvSchema = WebPublicEnvSchema.merge(WebServerEnvSchema);

export type WebPublicEnv = z.infer<typeof WebPublicEnvSchema>;
export type WebServerEnv = z.infer<typeof WebServerEnvSchema>;
export type WebEnv = z.infer<typeof WebEnvSchema>;

/**
 * Validate Next.js public environment variables
 * Safe to call in browser
 */
export function validateWebPublicEnv(
  env: Record<string, unknown> = process.env
): WebPublicEnv {
  const result = WebPublicEnvSchema.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid web public environment configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Web public environment validation failed');
  }

  return result.data;
}

/**
 * Validate Next.js server environment variables
 * Only call on server-side
 */
export function validateWebServerEnv(
  env: Record<string, unknown> = process.env
): WebEnv {
  const result = WebEnvSchema.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid web server environment configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Web server environment validation failed');
  }

  return result.data;
}
