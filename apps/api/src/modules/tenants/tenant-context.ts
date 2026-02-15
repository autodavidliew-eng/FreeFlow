import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

import type { TenantStatusDto } from './dto/tenant.dto';

export type TenantContext = {
  id: string;
  name: string;
  realmName: string;
  postgresDb: string;
  mongoDb: string;
  qdrantCollection: string;
  status: TenantStatusDto;
};

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): TenantContext | undefined {
    return this.storage.getStore();
  }

  require(): TenantContext {
    const context = this.storage.getStore();
    if (!context) {
      throw new Error('Tenant context is not available for this request.');
    }

    return context;
  }
}
