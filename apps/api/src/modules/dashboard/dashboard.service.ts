import { Injectable } from '@nestjs/common';

import type { DashboardLayoutDto } from './dto/dashboard-layout.dto';
import type {
  WidgetCatalogResponseDto,
  WidgetDefinitionDto,
} from './dto/widget-catalog.dto';

@Injectable()
export class DashboardService {
  getLayout(): DashboardLayoutDto {
    return {
      version: 1,
      sections: [
        {
          id: 'metrics',
          title: 'Today',
          layout: 'stack',
          widgets: [
            {
              instanceId: 'kpi-primary',
              widgetId: 'kpi-widget',
              size: 'full',
            },
          ],
        },
        {
          id: 'ops-overview',
          title: 'Operational Overview',
          layout: 'grid',
          columns: 2,
          widgets: [
            {
              instanceId: 'chart-load',
              widgetId: 'chart-widget',
              size: 'half',
            },
            {
              instanceId: 'alarm-list',
              widgetId: 'alarm-widget',
              size: 'half',
            },
          ],
        },
      ],
    };
  }

  getWidgetCatalog(): WidgetCatalogResponseDto {
    const data: WidgetDefinitionDto[] = [
      {
        id: 'kpi-widget',
        name: 'Key Metrics',
        description: 'Operational KPI snapshot for the current shift.',
        category: 'analytics',
        defaultSize: { w: 12, h: 2 },
        features: ['view', 'configure', 'export'],
      },
      {
        id: 'chart-widget',
        name: 'Load Distribution',
        description: 'Chart view of peak utilization across assets.',
        category: 'analytics',
        defaultSize: { w: 6, h: 2 },
        features: ['view', 'drill-down'],
      },
      {
        id: 'alarm-widget',
        name: 'Active Alarms',
        description: 'Monitoring feed of active alarms and severity.',
        category: 'monitoring',
        defaultSize: { w: 6, h: 2 },
        features: ['view', 'acknowledge', 'resolve'],
      },
    ];

    return {
      data,
      total: data.length,
    };
  }
}
