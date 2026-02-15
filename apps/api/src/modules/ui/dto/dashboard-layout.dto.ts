export type DashboardLayoutUpdateDto = {
  layoutId: string;
  layout: Record<string, unknown>;
};

export type DashboardLayoutUpdateResponseDto = {
  layoutId: string;
  status: 'updated';
};
