import type { AuthenticatedUser } from '@freeflow/auth';
import type { AppKey } from '@freeflow/rbac-config';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignJWT } from 'jose';

import { RoleAccessService } from '../access/role-access.service';
import { TenantContextService } from '../tenants/tenant-context';
import { TenantPostgresFactory } from '../tenants/tenant-data.factory';

import type {
  AddonHandoffRequestDto,
  AddonHandoffResponseDto,
} from './dto/addon-handoff.dto';
import type { AppCatalogResponseDto } from './dto/app-catalog.dto';

const HANDOFF_TTL_SECONDS = 120;

@Injectable()
export class AddonsService {
  constructor(
    private readonly tenantPostgres: TenantPostgresFactory,
    private readonly tenantContext: TenantContextService,
    private readonly roleAccess: RoleAccessService
  ) {}

  async getApps(user: AuthenticatedUser): Promise<AppCatalogResponseDto> {
    const roles = resolveRoles(user);
    const allowedAppKeys = await this.roleAccess.getAllowedApps(roles);

    if (allowedAppKeys.length === 0) {
      return { items: [], total: 0 };
    }

    const prisma =
      this.tenantPostgres.getClient() as unknown as AppPrismaClient;
    const records = (await prisma.appCatalog.findMany({
      where: {
        appKey: { in: allowedAppKeys },
        enabled: true,
      },
      orderBy: { appKey: 'asc' },
    })) as AppCatalogRecord[];

    return {
      items: records.map((record) => ({
        appKey: record.appKey,
        name: record.name,
        icon: record.icon ?? null,
        launchUrl: record.launchUrl,
        integrationMode: record.integrationMode,
        enabled: record.enabled,
      })),
      total: records.length,
    };
  }

  async handoff(
    user: AuthenticatedUser,
    payload: AddonHandoffRequestDto
  ): Promise<AddonHandoffResponseDto> {
    const roles = resolveRoles(user);
    const allowedApps = new Set(await this.roleAccess.getAllowedApps(roles));

    if (!allowedApps.has(payload.appKey)) {
      throw new ForbiddenException('App not allowed by role.');
    }

    const prisma =
      this.tenantPostgres.getClient() as unknown as AppPrismaClient;
    const app = (await prisma.appCatalog.findUnique({
      where: { appKey: payload.appKey as AppKey },
    })) as AppCatalogRecord | null;

    if (!app || !app.enabled) {
      throw new NotFoundException('App not available.');
    }

    const tenant = this.tenantContext.require();
    const { token, expiresAt, expiresIn } = await mintHandoffToken(
      user,
      tenant,
      payload.appKey,
      roles
    );

    return {
      appKey: payload.appKey,
      status: 'allowed',
      launchUrl: app.launchUrl,
      integrationMode: app.integrationMode,
      token,
      expiresAt,
      expiresIn,
    };
  }
}

const resolveRoles = (user: AuthenticatedUser): string[] => {
  if (user.freeflowRoles && user.freeflowRoles.length > 0) {
    return user.freeflowRoles;
  }

  return user.roles ?? [];
};

type AppCatalogRecord = {
  appKey: AppKey;
  name: string;
  icon?: string | null;
  launchUrl: string;
  integrationMode: string;
  enabled: boolean;
};

type AppPrismaClient = {
  appCatalog: {
    findUnique: (args: {
      where: { appKey: AppKey };
    }) => Promise<AppCatalogRecord | null>;
    findMany: (args: {
      where: { appKey: { in: string[] }; enabled?: boolean };
      orderBy: { appKey: 'asc' | 'desc' };
    }) => Promise<AppCatalogRecord[]>;
  };
};

const loadJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET for addon handoff.');
  }

  return new TextEncoder().encode(secret);
};

async function mintHandoffToken(
  user: AuthenticatedUser,
  tenant: { id: string; name: string; realmName: string },
  appKey: string,
  roles: string[]
) {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = HANDOFF_TTL_SECONDS;
  const expiresAt = new Date((now + expiresIn) * 1000).toISOString();

  const token = await new SignJWT({
    tenant: {
      id: tenant.id,
      name: tenant.name,
      realm: tenant.realmName,
    },
    roles,
    freeflowRoles: user.freeflowRoles ?? [],
    appKey,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .setAudience(appKey)
    .setSubject(user.sub)
    .setIssuer(process.env.JWT_ISSUER ?? 'freeflow-api')
    .sign(loadJwtSecret());

  return { token, expiresAt, expiresIn };
}
