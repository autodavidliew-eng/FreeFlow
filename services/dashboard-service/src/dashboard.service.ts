import { Injectable } from '@nestjs/common';
import { prisma } from '@freeflow/db-postgres';
import type { DashboardLayoutDto } from './dto/dashboard-layout.dto';
import type { DashboardWidgetConfigDto } from './dto/widget-config.dto';

@Injectable()
export class DashboardService {
  async getLayoutForUser(externalUserId: string): Promise<DashboardLayoutDto | null> {
    const user = await prisma.userProfile.findUnique({
      where: { externalId: externalUserId },
      include: { dashboardLayouts: true, widgetConfigs: true },
    });

    if (!user) {
      return null;
    }

    const layout = user.dashboardLayouts.find((entry) => entry.isDefault) ??
      user.dashboardLayouts[0];

    if (!layout) {
      return null;
    }

    const widgets: DashboardWidgetConfigDto[] = user.widgetConfigs
      .filter((config) => config.dashboardLayoutId === layout.id)
      .map((config) => ({
        instanceId: config.instanceId,
        widgetId: config.widgetId,
        title: config.title ?? undefined,
        size: (config.size ?? undefined) as DashboardWidgetConfigDto['size'],
        options: (config.options as Record<string, unknown> | null) ?? undefined,
      }));

    return {
      version: layout.version,
      sections: [
        {
          id: 'default',
          title: layout.name,
          layout: 'grid',
          columns: 2,
          widgets,
        },
      ],
    };
  }
}
