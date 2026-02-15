import type { AuthenticatedUser } from '@freeflow/auth';
import { getAllowedApps, type AppKey } from '@freeflow/rbac-config';
import { Injectable } from '@nestjs/common';

import { TenantPostgresFactory } from '../tenants/tenant-data.factory';

import type {
  AddonHandoffRequestDto,
  AddonHandoffResponseDto,
} from './dto/addon-handoff.dto';
import type { AppCatalogResponseDto } from './dto/app-catalog.dto';

@Injectable()
export class AddonsService {
  constructor(private readonly tenantPostgres: TenantPostgresFactory) {}

  async getApps(user: AuthenticatedUser): Promise<AppCatalogResponseDto> {
    const roles = resolveRoles(user);
    const allowedAppKeys = getAllowedApps(roles);

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

  handoff(payload: AddonHandoffRequestDto): AddonHandoffResponseDto {
    return {
      appKey: payload.appKey,
      status: 'allowed',
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
    findMany: (args: {
      where: { appKey: { in: AppKey[] }; enabled?: boolean };
      orderBy: { appKey: 'asc' | 'desc' };
    }) => Promise<AppCatalogRecord[]>;
  };
};
