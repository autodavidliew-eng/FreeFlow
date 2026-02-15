import type { AuthenticatedUser } from '@freeflow/auth';
import {
  getAllowedWidgets,
  ROLE_KEYS,
  type RoleKey,
} from '@freeflow/rbac-config';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { TenantPostgresFactory } from '../tenants/tenant-data.factory';

import type {
  DashboardLayoutDto,
  DashboardLayoutUpdateDto,
  DashboardLayoutUpdateResponseDto,
} from './dto/dashboard-layout.dto';
import type { WidgetCatalogResponseDto } from './dto/widget-catalog.dto';

@Injectable()
export class UiService {
  constructor(private readonly tenantPostgres: TenantPostgresFactory) {}

  async getWidgetCatalog(
    user: AuthenticatedUser
  ): Promise<WidgetCatalogResponseDto> {
    const roles = resolveRoles(user);
    const allowedWidgetKeys = getAllowedWidgets(roles);

    if (allowedWidgetKeys.length === 0) {
      return { items: [], total: 0 };
    }

    const prisma = this.tenantPostgres.getClient() as unknown as UiPrismaClient;
    const records = (await prisma.widgetCatalog.findMany({
      where: { key: { in: allowedWidgetKeys } },
      orderBy: { key: 'asc' },
    })) as WidgetCatalogRecord[];

    return {
      items: records.map((record) => ({
        key: record.key,
        name: record.name,
        type: record.type,
        defaultConfig: record.defaultConfig as Record<string, unknown> | null,
      })),
      total: records.length,
    };
  }

  async getDashboardLayout(
    user: AuthenticatedUser
  ): Promise<DashboardLayoutDto> {
    const roles = resolveRoles(user);
    const primaryRole = resolvePrimaryRole(roles);
    const allowedWidgetKeys = new Set<string>(getAllowedWidgets(roles));

    if (!primaryRole) {
      return { version: 1, sections: [] };
    }

    const prisma = this.tenantPostgres.getClient() as unknown as UiPrismaClient;
    const record = (await prisma.roleDashboardLayout.findUnique({
      where: { role: primaryRole },
    })) as RoleLayoutRecord | null;

    if (!record) {
      return { version: 1, sections: [] };
    }

    const layout = record.layout as DashboardLayoutDto;
    const filteredSections = (layout.sections ?? [])
      .map((section) => ({
        ...section,
        widgets: (section.widgets ?? []).filter((widget) =>
          allowedWidgetKeys.has(widget.widgetId)
        ),
      }))
      .filter((section) => section.widgets.length > 0);

    return {
      version: record.version,
      sections: filteredSections,
    };
  }

  async updateDashboardLayout(
    user: AuthenticatedUser,
    payload: DashboardLayoutUpdateDto
  ): Promise<DashboardLayoutUpdateResponseDto> {
    if (!payload.layoutId) {
      throw new BadRequestException('Missing layout id.');
    }

    if (!payload.layout || typeof payload.layout !== 'object') {
      throw new BadRequestException('Invalid layout payload.');
    }

    const roles = resolveRoles(user);
    const allowedWidgetKeys = new Set<string>(getAllowedWidgets(roles));
    const layout = payload.layout as DashboardLayoutDto;
    const sections = Array.isArray(layout.sections) ? layout.sections : [];

    for (const section of sections) {
      const widgets = Array.isArray(section.widgets) ? section.widgets : [];
      for (const widget of widgets) {
        if (!allowedWidgetKeys.has(widget.widgetId)) {
          throw new ForbiddenException('Widget not allowed by role.');
        }
      }
    }

    const prisma = this.tenantPostgres.getClient() as unknown as UiPrismaClient;
    const version = typeof layout.version === 'number' ? layout.version : 1;

    await prisma.roleDashboardLayout.upsert({
      where: { role: payload.layoutId },
      update: {
        version,
        layout: payload.layout,
      },
      create: {
        role: payload.layoutId,
        name: 'Role Dashboard',
        version,
        layout: payload.layout,
      },
    });

    return {
      layoutId: payload.layoutId,
      status: 'updated',
    };
  }
}

const resolveRoles = (user: AuthenticatedUser): string[] => {
  if (user.freeflowRoles && user.freeflowRoles.length > 0) {
    return user.freeflowRoles;
  }

  return user.roles ?? [];
};

const resolvePrimaryRole = (roles: string[]): RoleKey | null => {
  for (const role of ROLE_KEYS) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return null;
};

type WidgetCatalogRecord = {
  key: string;
  name: string;
  type: string;
  defaultConfig: unknown;
};

type RoleLayoutRecord = {
  role: string;
  version: number;
  layout: unknown;
};

type UiPrismaClient = {
  widgetCatalog: {
    findMany: (args: {
      where: { key: { in: string[] } };
      orderBy: { key: 'asc' | 'desc' };
    }) => Promise<WidgetCatalogRecord[]>;
  };
  roleDashboardLayout: {
    findUnique: (args: {
      where: { role: string };
    }) => Promise<RoleLayoutRecord | null>;
    upsert: (args: {
      where: { role: string };
      update: { version: number; layout: unknown; name?: string | null };
      create: {
        role: string;
        name?: string | null;
        version: number;
        layout: unknown;
      };
    }) => Promise<RoleLayoutRecord>;
  };
};
