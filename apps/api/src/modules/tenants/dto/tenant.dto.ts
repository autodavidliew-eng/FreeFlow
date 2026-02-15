export type TenantStatusDto =
  | 'provisioning'
  | 'active'
  | 'suspended'
  | 'deleting'
  | 'deleted';

export type TenantDto = {
  id: string;
  name: string;
  realmName: string;
  postgresDb: string;
  mongoDb: string;
  qdrantCollection: string;
  status: TenantStatusDto;
  createdAt: string;
  updatedAt: string;
};

export type TenantCreateRequestDto = {
  name: string;
};

export type TenantListResponseDto = {
  items: TenantDto[];
  total: number;
};
