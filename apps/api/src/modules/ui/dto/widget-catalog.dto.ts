export type WidgetCatalogItemDto = {
  key: string;
  name: string;
  type: string;
  defaultConfig?: Record<string, unknown> | null;
};

export type WidgetCatalogResponseDto = {
  items: WidgetCatalogItemDto[];
  total: number;
};
