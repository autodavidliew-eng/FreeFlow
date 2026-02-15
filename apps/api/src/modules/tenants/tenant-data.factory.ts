import { createPrismaClient, type PrismaClient } from '@freeflow/db-postgres';
import { createQdrantClient } from '@freeflow/db-qdrant';
import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import type { Connection } from 'mongoose';

import { TenantContextService } from './tenant-context';

type QdrantClient = ReturnType<typeof createQdrantClient>;

export type TenantQdrantScope = {
  client: QdrantClient;
  collection: string;
};

function buildTenantPostgresUrl(baseUrl: string, dbName: string): string {
  const url = new URL(baseUrl);
  url.pathname = `/${dbName}`;
  return url.toString();
}

@Injectable()
export class TenantPostgresFactory {
  private readonly clients = new Map<string, PrismaClient>();
  private readonly baseUrl: string;

  constructor(private readonly tenantContext: TenantContextService) {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      throw new Error(
        'DATABASE_URL is required for tenant Postgres connections.'
      );
    }
    this.baseUrl = baseUrl;
  }

  getClient(): PrismaClient {
    const tenant = this.tenantContext.require();
    const url = buildTenantPostgresUrl(this.baseUrl, tenant.postgresDb);

    let client = this.clients.get(url);
    if (!client) {
      client = createPrismaClient({ url, log: ['error', 'warn'] });
      this.clients.set(url, client);
    }

    return client;
  }
}

@Injectable()
export class TenantMongoFactory {
  private readonly connections = new Map<string, Promise<Connection>>();
  private readonly baseUri: string;

  constructor(private readonly tenantContext: TenantContextService) {
    const baseUri = process.env.MONGODB_URI;
    if (!baseUri) {
      throw new Error('MONGODB_URI is required for tenant Mongo connections.');
    }
    this.baseUri = baseUri;
  }

  async getConnection(): Promise<Connection> {
    const tenant = this.tenantContext.require();
    const key = tenant.mongoDb;

    let existing = this.connections.get(key);
    if (!existing) {
      existing = this.createConnection(key);
      this.connections.set(key, existing);
    }

    return existing;
  }

  private async createConnection(dbName: string): Promise<Connection> {
    const connection = mongoose.createConnection(this.baseUri, {
      dbName,
      appName: `freeflow:${dbName}`,
    });

    await connection.asPromise();
    return connection;
  }
}

@Injectable()
export class TenantQdrantFactory {
  private readonly client: QdrantClient;

  constructor(private readonly tenantContext: TenantContextService) {
    this.client = createQdrantClient();
  }

  getScope(): TenantQdrantScope {
    const tenant = this.tenantContext.require();
    return {
      client: this.client,
      collection: tenant.qdrantCollection,
    };
  }
}
