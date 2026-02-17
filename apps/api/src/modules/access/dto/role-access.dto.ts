export type RoleAccessAssignmentDto = {
  widgets: string[];
  apps: string[];
};

export type RoleAccessSnapshotDto = {
  roles: string[];
  widgets: Array<{ key: string; name: string; type: string }>;
  apps: Array<{ appKey: string; name: string; enabled: boolean }>;
  assignments: Record<string, RoleAccessAssignmentDto>;
};

export type RoleAccessUpdateDto = {
  widgets?: string[];
  apps?: string[];
};

export type RoleAccessUpdateResponseDto = {
  role: string;
  assignment: RoleAccessAssignmentDto;
};
