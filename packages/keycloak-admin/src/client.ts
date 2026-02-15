export type KeycloakAdminClientConfig = {
  baseUrl: string;
  realm?: string;
  clientId?: string;
  clientSecret?: string;
  username: string;
  password: string;
};

type AccessToken = {
  access_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type?: string;
  scope?: string;
};

type CachedToken = {
  token: string;
  expiresAt: number;
};

export class KeycloakAdminClient {
  private readonly baseUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret?: string;
  private readonly username: string;
  private readonly password: string;
  private token?: CachedToken;

  constructor(config: KeycloakAdminClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.realm = config.realm ?? 'master';
    this.clientId = config.clientId ?? 'admin-cli';
    this.clientSecret = config.clientSecret;
    this.username = config.username;
    this.password = config.password;
  }

  async realmExists(realmName: string): Promise<boolean> {
    const response = await this.request(
      `/realms/${encodeURIComponent(realmName)}`,
      {
        method: 'GET',
      }
    );

    return response.status === 200;
  }

  async createRealm(realm: Record<string, unknown>): Promise<void> {
    const response = await this.request('/realms', {
      method: 'POST',
      body: JSON.stringify(realm),
    });

    if (response.status === 201 || response.status === 204) {
      return;
    }

    if (response.status === 409) {
      return;
    }

    const message = await response.text();
    throw new Error(
      `Keycloak realm creation failed: ${response.status} ${message}`
    );
  }

  async deleteRealm(realmName: string): Promise<void> {
    const response = await this.request(
      `/realms/${encodeURIComponent(realmName)}`,
      {
        method: 'DELETE',
      }
    );

    if (response.status === 204 || response.status === 404) {
      return;
    }

    const message = await response.text();
    throw new Error(
      `Keycloak realm deletion failed: ${response.status} ${message}`
    );
  }

  async disableRealm(realmName: string): Promise<void> {
    const response = await this.request(
      `/realms/${encodeURIComponent(realmName)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ enabled: false }),
      }
    );

    if (response.status === 204 || response.status === 404) {
      return;
    }

    const message = await response.text();
    throw new Error(
      `Keycloak realm disable failed: ${response.status} ${message}`
    );
  }

  private async request(
    path: string,
    options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> }
  ): Promise<Response> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/admin${path}`;

    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt) {
      return this.token.token;
    }

    const tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,
      username: this.username,
      password: this.password,
    });

    if (this.clientSecret) {
      body.append('client_secret', this.clientSecret);
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Keycloak auth failed: ${response.status} ${message}`);
    }

    const payload = (await response.json()) as AccessToken;
    const expiresAt = Date.now() + Math.max(payload.expires_in - 30, 0) * 1000;

    this.token = {
      token: payload.access_token,
      expiresAt,
    };

    return payload.access_token;
  }
}
