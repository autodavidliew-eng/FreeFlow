export type AlarmSeverity = 'Low' | 'Medium' | 'High';

export type AlarmStatus = 'Open' | 'Acknowledged' | 'Resolved';

export type AlarmRecord = {
  id: string;
  site: string;
  device: string;
  category: string;
  severity: AlarmSeverity;
  description: string;
  timestamp: string;
  status: AlarmStatus;
};
