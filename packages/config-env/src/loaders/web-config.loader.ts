import {
  validateWebPublicEnv,
  validateWebServerEnv,
  type WebPublicEnv,
  type WebEnv,
} from '../schemas/web.schema';

/**
 * Load and validate web public configuration (safe for client)
 * These variables are exposed to the browser
 */
export function loadWebPublicConfig(): WebPublicEnv {
  try {
    const config = validateWebPublicEnv(process.env);
    return config;
  } catch (error) {
    console.error('Failed to load web public configuration:', error);
    throw error;
  }
}

/**
 * Load and validate web server configuration (server-only)
 * Call this only on server-side (API routes, getServerSideProps, etc.)
 */
export function loadWebServerConfig(): WebEnv {
  try {
    const config = validateWebServerEnv(process.env);
    console.log('✅ Web server configuration validated successfully');
    console.log(`📍 Environment: ${config.NODE_ENV}`);
    return config;
  } catch (error) {
    console.error('Failed to load web server configuration:', error);
    process.exit(1);
  }
}

/**
 * Get public configuration (safe for client)
 */
export function getWebPublicConfig(): WebPublicEnv {
  return validateWebPublicEnv(process.env);
}

/**
 * Get server configuration (server-only)
 */
export function getWebServerConfig(): WebEnv {
  return validateWebServerEnv(process.env);
}
