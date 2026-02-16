import { NgsiLdClientOptions, NgsiLdQueryParams, NgsiLdRequestOptions } from './types';

const DEFAULT_HEADERS = {
  Accept: 'application/ld+json',
};

export class NgsiLdClient {
  private readonly baseUrl: string;
  private readonly tenant?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: NgsiLdClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.tenant = options.tenant;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.defaultHeaders = {
      ...DEFAULT_HEADERS,
      ...(options.defaultHeaders ?? {}),
    };
  }

  async upsertEntity(entity: Record<string, unknown>, options?: NgsiLdRequestOptions) {
    const id = entity.id;
    if (!id || typeof id !== 'string') {
      throw new Error('Entity id is required for upsert');
    }

    await this.request(`/ngsi-ld/v1/entities?options=update`, {
      method: 'POST',
      body: JSON.stringify(entity),
      headers: {
        'Content-Type': 'application/ld+json',
      },
      options,
    });
  }

  async getEntity(id: string, options?: NgsiLdRequestOptions) {
    return this.request(`/ngsi-ld/v1/entities/${encodeURIComponent(id)}`, {
      method: 'GET',
      options,
    });
  }

  async queryEntities(params?: NgsiLdQueryParams, options?: NgsiLdRequestOptions) {
    const search = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          search.append(key, String(value));
        }
      });
    }

    const suffix = search.toString();
    const path = suffix ? `/ngsi-ld/v1/entities?${suffix}` : '/ngsi-ld/v1/entities';
    return this.request(path, {
      method: 'GET',
      options,
    });
  }

  async createSubscription(subscription: Record<string, unknown>, options?: NgsiLdRequestOptions) {
    return this.request('/ngsi-ld/v1/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/ld+json',
      },
      options,
    });
  }

  async deleteSubscription(id: string, options?: NgsiLdRequestOptions) {
    await this.request(`/ngsi-ld/v1/subscriptions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      options,
    });
  }

  private async request(
    path: string,
    {
      method,
      body,
      headers,
      options,
    }: {
      method: string;
      body?: string;
      headers?: Record<string, string>;
      options?: NgsiLdRequestOptions;
    },
  ) {
    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...(headers ?? {}),
    };

    const tenant = options?.tenant ?? this.tenant;
    if (tenant) {
      requestHeaders['NGSILD-Tenant'] = tenant;
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`NGSI-LD request failed (${response.status}): ${text}`);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json') || contentType.includes('application/ld+json')) {
      return response.json();
    }

    return response.text();
  }
}
