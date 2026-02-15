import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import { checkAccess } from '../client';
import {
  FGA_REQUIRE_KEY,
  type FgaRequirement,
} from '../decorators/require-fga.decorator';

type RequestWithUser = {
  user?: {
    sub?: string;
  };
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
};

const getValue = (source: unknown, path: string): string | null => {
  if (!source) {
    return null;
  }

  let current: unknown = source;

  for (const key of path.split('.')) {
    if (!current || typeof current !== 'object') {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : null;
};

const resolveObjectId = (
  spec: FgaRequirement['objectId'],
  request: RequestWithUser
): string | null => {
  if (typeof spec === 'function') {
    const resolved = spec(request as unknown);
    return typeof resolved === 'string' ? resolved : null;
  }

  if (spec.startsWith('body.')) {
    return getValue(request.body, spec.slice(5));
  }

  if (spec.startsWith('param.') || spec.startsWith('params.')) {
    return getValue(
      request.params,
      spec.replace('params.', '').replace('param.', '')
    );
  }

  if (spec.startsWith('query.')) {
    return getValue(request.query, spec.slice(6));
  }

  if (spec.startsWith('header.')) {
    const headerKey = spec.slice(7).toLowerCase();
    const value = request.headers?.[headerKey];
    return typeof value === 'string' ? value : null;
  }

  if (spec.startsWith(':')) {
    return request.params?.[spec.slice(1)] ?? null;
  }

  return spec;
};

@Injectable()
export class FgaGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<FgaRequirement>(
      FGA_REQUIRE_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.sub) {
      throw new UnauthorizedException('Missing authenticated user');
    }

    const objectId = resolveObjectId(requirement.objectId, request);

    if (!objectId) {
      throw new BadRequestException('Missing FGA object id');
    }

    const object = `${requirement.objectType}:${objectId}`;
    const allowed = await checkAccess({
      user: `user:${user.sub}`,
      relation: requirement.relation,
      object,
    });

    if (!allowed) {
      throw new ForbiddenException('Forbidden by OpenFGA');
    }

    return true;
  }
}
