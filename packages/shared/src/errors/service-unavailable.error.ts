export class ServiceUnavailableError extends Error {
  constructor(service: string, details?: string) {
    super(`Service unavailable: ${service}${details ? ` - ${details}` : ''}`);
    this.name = 'ServiceUnavailableError';
  }
}
