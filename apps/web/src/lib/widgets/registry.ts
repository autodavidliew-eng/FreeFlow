import {
  AlarmListWidget,
  ALARM_WIDGET_ID,
} from '../../components/widgets/AlarmListWidget';
import {
  ChartPlaneWidget,
  CHART_WIDGET_ID,
} from '../../components/widgets/ChartPlaneWidget';
import { KpiWidget, KPI_WIDGET_ID } from '../../components/widgets/KpiWidget';
import type { WidgetRegistry } from './types';

export const widgetRegistry: WidgetRegistry = {
  [KPI_WIDGET_ID]: {
    id: KPI_WIDGET_ID,
    displayName: 'Key Metrics',
    description: 'Operational KPI snapshot for the current shift.',
    component: KpiWidget,
    defaultSize: 'full',
  },
  [CHART_WIDGET_ID]: {
    id: CHART_WIDGET_ID,
    displayName: 'Load Distribution',
    description: 'Chart view of peak utilization across assets.',
    component: ChartPlaneWidget,
    defaultSize: 'half',
  },
  [ALARM_WIDGET_ID]: {
    id: ALARM_WIDGET_ID,
    displayName: 'Active Alarms',
    description: 'Monitoring feed of active alarms and severity.',
    component: AlarmListWidget,
    defaultSize: 'half',
  },
};
