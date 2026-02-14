export type WidgetDefinitionDto = {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'monitoring' | 'communication' | 'productivity';
  defaultSize: { w: number; h: number };
  features?: string[];
};

export type WidgetCatalogResponseDto = {
  data: WidgetDefinitionDto[];
  total: number;
};
