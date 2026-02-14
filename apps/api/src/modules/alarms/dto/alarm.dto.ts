export type AlarmDto = {
  id: string;
  label: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
};

export type AlarmListResponseDto = {
  items: AlarmDto[];
  total: number;
};
