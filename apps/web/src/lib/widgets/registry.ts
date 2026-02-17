import {
  AlarmListWidget,
  ALARM_WIDGET_ID,
} from '../../components/widgets/AlarmListWidget';
import {
  EmeterWeeklyWidget,
  EMETER_WEEKLY_WIDGET_ID,
} from '../../components/widgets/EmeterWeeklyWidget';
import { KpiWidget, KPI_WIDGET_ID } from '../../components/widgets/KpiWidget';
import {
  LineChartWidget,
  LINE_CHART_WIDGET_ID,
} from '../../components/widgets/LineChartWidget';

import type { WidgetRegistry } from './types';

export const widgetRegistry: WidgetRegistry = {
  [KPI_WIDGET_ID]: {
    id: KPI_WIDGET_ID,
    displayName: 'Key Metrics',
    description: 'Operational KPI snapshot for the current shift.',
    component: KpiWidget,
    defaultSize: 'full',
  },
  [LINE_CHART_WIDGET_ID]: {
    id: LINE_CHART_WIDGET_ID,
    displayName: 'Load Distribution',
    description: 'Chart view of daily energy and water usage.',
    component: LineChartWidget,
    defaultSize: 'half',
  },
  [EMETER_WEEKLY_WIDGET_ID]: {
    id: EMETER_WEEKLY_WIDGET_ID,
    displayName: 'Emeter Weekly Trend',
    description: 'Seven-day energy consumption overview.',
    component: EmeterWeeklyWidget,
    defaultSize: 'full',
  },
  [ALARM_WIDGET_ID]: {
    id: ALARM_WIDGET_ID,
    displayName: 'Active Alarms',
    description: 'Monitoring feed of active alarms and severity.',
    component: AlarmListWidget,
    defaultSize: 'half',
  },
};
