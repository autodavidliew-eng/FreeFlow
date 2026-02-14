import { validateApiEnv, type ApiEnv } from '../schemas/api.schema';

/**
 * Load and validate API configuration
 * Call this at application startup
 */
export function loadApiConfig(): ApiEnv {
  try {
    const config = validateApiEnv(process.env);
    console.log('✅ API configuration validated successfully');
    console.log(`📍 Environment: ${config.NODE_ENV}`);
    console.log(`🚀 Server will run on port ${config.PORT}`);
    return config;
  } catch (error) {
    console.error('Failed to load API configuration:', error);
    process.exit(1);
  }
}

/**
 * Get typed configuration object
 * Use this after calling loadApiConfig()
 */
export function getApiConfig(): ApiEnv {
  return validateApiEnv(process.env);
}
