/**
 * URL constants for different environments
 */

export const URLS = {
  development: {
    web: 'http://localhost:3000',
    api: 'http://localhost:4000',
  },
  staging: {
    web: 'https://staging.freeflow.dev',
    api: 'https://api.staging.freeflow.dev',
  },
  production: {
    web: 'https://freeflow.dev',
    api: 'https://api.freeflow.dev',
  },
} as const;

/**
 * Get URLs for current environment
 */
export function getUrls(env: keyof typeof URLS = 'development') {
  return URLS[env];
}

/**
 * Cookie domain for each environment
 */
export const COOKIE_DOMAINS = {
  development: 'localhost',
  staging: '.staging.freeflow.dev',
  production: '.freeflow.dev',
} as const;
