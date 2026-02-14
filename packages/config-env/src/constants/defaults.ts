/**
 * Default configuration values
 */

export const DEFAULTS = {
  // Server
  PORT: 4000,
  HOST: '0.0.0.0',

  // Database
  DB_POOL_SIZE: 10,

  // JWT
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',

  // Rate limiting
  RATE_LIMIT_TTL: 60,
  RATE_LIMIT_MAX: 100,

  // Logging
  LOG_LEVEL: 'info',

  // Cookies
  COOKIE_SAME_SITE: 'lax',
  COOKIE_SECURE: false,
} as const;

/**
 * Production overrides
 */
export const PRODUCTION_DEFAULTS = {
  ...DEFAULTS,
  LOG_LEVEL: 'warn',
  COOKIE_SECURE: true,
  COOKIE_SAME_SITE: 'strict',
} as const;
