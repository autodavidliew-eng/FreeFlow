import { ROLE_KEYS } from '@freeflow/rbac-config';
import { BadRequestException, Injectable } from '@nestjs/common';

import { TenantPostgresFactory } from '../tenants/tenant-data.factory';

import type {
  RoleAccessAssignmentDto,
  RoleAccessSnapshotDto,
  RoleAccessUpdateDto,
} from './dto/role-access.dto';

const WIDGET_VIEW_ACTIONS = new Set(['view', '*']);
const APP_LAUNCH_ACTIONS = new Set(['launch', '*']);

@Injectable()
export class RoleAccessService {
  constructor(private readonly tenantPostgres: TenantPostgresFactory) {}

  async getAllowedWidgets(roles: string[]): Promise<string[]> {
    if (roles.length === 0) {
      return [];
    }

    const prisma = this.getClient();
    const records = await prisma.roleWidgetAccess.findMany({
      where: { role: { in: roles } },
    });

    const allowed = new Set<string>();
    for (const record of records) {
      if (this.hasAction(record.actions, WIDGET_VIEW_ACTIONS)) {
        allowed.add(record.widgetKey);
      }
    }

    return Array.from(allowed);
  }

  async getAllowedApps(roles: string[]): Promise<string[]> {
    if (roles.length === 0) {
      return [];
    }

    const prisma = this.getClient();
    const records = await prisma.roleAppAccess.findMany({
      where: { role: { in: roles } },
    });

    const allowed = new Set<string>();
    for (const record of records) {
      if (this.hasAction(record.actions, APP_LAUNCH_ACTIONS)) {
        allowed.add(record.appKey);
      }
    }

    return Array.from(allowed);
  }

  async getRoleAccessSnapshot(): Promise<RoleAccessSnapshotDto> {
    const prisma = this.getClient();
    const roles = [...ROLE_KEYS];

    const [widgetCatalog, appCatalog, widgetAccess, appAccess] =
      await Promise.all([
        prisma.widgetCatalog.findMany({ orderBy: { key: 'asc' } }),
        prisma.appCatalog.findMany({ orderBy: { appKey: 'asc' } }),
        prisma.roleWidgetAccess.findMany({
          where: { role: { in: roles } },
        }),
        prisma.roleAppAccess.findMany({
          where: { role: { in: roles } },
        }),
      ]);

    const assignments: Record<string, RoleAccessAssignmentDto> = {};
    for (const role of roles) {
      assignments[role] = { apps: [], widgets: [] };
    }

    for (const record of widgetAccess) {
      if (!assignments[record.role]) {
        continue;
      }
      if (this.hasAction(record.actions, WIDGET_VIEW_ACTIONS)) {
        assignments[record.role].widgets.push(record.widgetKey);
      }
    }

    for (const record of appAccess) {
      if (!assignments[record.role]) {
        continue;
      }
      if (this.hasAction(record.actions, APP_LAUNCH_ACTIONS)) {
        assignments[record.role].apps.push(record.appKey);
      }
    }

    for (const entry of Object.values(assignments)) {
      entry.widgets.sort();
      entry.apps.sort();
    }

    return {
      roles,
      widgets: widgetCatalog.map((widget) => ({
        key: widget.key,
        name: widget.name ?? widget.key,
        type: widget.type ?? 'widget',
      })),
      apps: appCatalog.map((app) => ({
        appKey: app.appKey,
        name: app.name ?? app.appKey,
        enabled: app.enabled ?? true,
      })),
      assignments,
    };
  }

  async updateRoleAccess(role: string, payload: RoleAccessUpdateDto) {
    if (!ROLE_KEYS.includes(role as (typeof ROLE_KEYS)[number])) {
      throw new BadRequestException('Unknown role.');
    }

    const prisma = this.getClient();
    const [widgetCatalog, appCatalog] = await Promise.all([
      prisma.widgetCatalog.findMany({ select: { key: true } }),
      prisma.appCatalog.findMany({ select: { appKey: true } }),
    ]);

    const widgetKeys = new Set(widgetCatalog.map((item) => item.key));
    const appKeys = new Set(appCatalog.map((item) => item.appKey));

    const widgets = Array.isArray(payload.widgets)
      ? payload.widgets.filter((key) => widgetKeys.has(key))
      : [];
    const apps = Array.isArray(payload.apps)
      ? payload.apps.filter((key) => appKeys.has(key))
      : [];

    await prisma.roleWidgetAccess.deleteMany({ where: { role } });
    await prisma.roleAppAccess.deleteMany({ where: { role } });

    if (widgets.length > 0) {
      await prisma.roleWidgetAccess.createMany({
        data: widgets.map((widgetKey) => ({
          role,
          widgetKey,
          actions: ['view'],
        })),
      });
    }

    if (apps.length > 0) {
      await prisma.roleAppAccess.createMany({
        data: apps.map((appKey) => ({
          role,
          appKey,
          actions: ['launch'],
        })),
      });
    }

    return {
      role,
      assignment: {
        widgets,
        apps,
      },
    };
  }

  private hasAction(
    actions: string[] | null | undefined,
    allowed: Set<string>
  ) {
    if (!actions || actions.length === 0) {
      return false;
    }
    return actions.some((action) => allowed.has(action));
  }

  private getClient() {
    return this.tenantPostgres.getClient() as unknown as RoleAccessPrismaClient;
  }
}

type RoleAccessPrismaClient = {
  roleWidgetAccess: {
    findMany: (args: {
      where?: { role?: { in: string[] } };
    }) => Promise<
      Array<{ role: string; widgetKey: string; actions: string[] }>
    >;
    deleteMany: (args: { where: { role: string } }) => Promise<unknown>;
    createMany: (args: {
      data: Array<{ role: string; widgetKey: string; actions: string[] }>;
    }) => Promise<unknown>;
  };
  roleAppAccess: {
    findMany: (args: {
      where?: { role?: { in: string[] } };
    }) => Promise<Array<{ role: string; appKey: string; actions: string[] }>>;
    deleteMany: (args: { where: { role: string } }) => Promise<unknown>;
    createMany: (args: {
      data: Array<{ role: string; appKey: string; actions: string[] }>;
    }) => Promise<unknown>;
  };
  widgetCatalog: {
    findMany: (args?: {
      orderBy?: { key: 'asc' | 'desc' };
      select?: { key: true };
    }) => Promise<Array<{ key: string; name?: string; type?: string }>>;
  };
  appCatalog: {
    findMany: (args?: {
      orderBy?: { appKey: 'asc' | 'desc' };
      select?: { appKey: true };
    }) => Promise<Array<{ appKey: string; name?: string; enabled?: boolean }>>;
  };
};
