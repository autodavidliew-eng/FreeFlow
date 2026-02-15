export type AppCatalogItemDto = {
  appKey: string;
  name: string;
  icon?: string | null;
  launchUrl: string;
  integrationMode: string;
  enabled: boolean;
};

export type AppCatalogResponseDto = {
  items: AppCatalogItemDto[];
  total: number;
};
