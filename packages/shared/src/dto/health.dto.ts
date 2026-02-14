export type HealthResponse = {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  timestamp: string;
};
