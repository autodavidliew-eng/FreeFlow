import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { verifyAccessToken } from '../jwks';
import type { AuthenticatedUser } from '../types';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

function extractBearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header) {
    return null;
  }

  if (Array.isArray(header)) {
    return header.find((entry) => entry.startsWith('Bearer '))?.slice(7) ?? null;
  }

  if (!header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim();
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const { payload, roles, freeflowRoles } = await verifyAccessToken(token);

      request.user = {
        sub: payload.sub,
        email: payload.email,
        name:
          payload.name ?? payload.preferred_username ?? payload.email ?? payload.sub,
        roles,
        freeflowRoles,
        token,
        claims: payload,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
