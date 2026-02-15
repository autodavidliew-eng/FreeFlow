import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import type { TenantContext } from './tenant-context';
import { TenantContextService } from './tenant-context';
import { TenantResolverService } from './tenant-resolver.service';

type RequestWithTenant = Request & { tenant?: TenantContext };

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(
    private readonly resolver: TenantResolverService,
    private readonly tenantContext: TenantContextService
  ) {}

  async use(
    request: RequestWithTenant,
    _response: Response,
    next: NextFunction
  ) {
    if (this.shouldBypass(request)) {
      next();
      return;
    }

    try {
      const tenant = await this.resolver.resolveTenant(request);
      this.tenantContext.run(tenant, () => {
        request.tenant = tenant;
        next();
      });
    } catch (error) {
      next(error);
    }
  }

  private shouldBypass(request: Request): boolean {
    if (request.method === 'OPTIONS') {
      return true;
    }

    const path = request.path ?? request.url ?? '';
    if (!path) {
      return false;
    }

    if (path === '/' || path === '/health') {
      return true;
    }

    if (path.startsWith('/tenants')) {
      return true;
    }

    return false;
  }
}
