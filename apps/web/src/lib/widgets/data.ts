import 'server-only';

import {
  dashboardLayoutSchema,
  fallbackDashboardLayout,
  fallbackWidgetCatalog,
  widgetCatalogResponseSchema,
} from './schema';
import type { DashboardLayout, WidgetCatalogItem } from './types';

const DEFAULT_API_URL = 'http://localhost:4000';

type DashboardData = {
  layout: DashboardLayout;
  catalog: WidgetCatalogItem[];
  source: 'api' | 'fallback';
};

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
};

async function fetchJson(path: string, token?: string) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getDashboardData(token?: string): Promise<DashboardData> {
  if (!token) {
    return {
      layout: fallbackDashboardLayout,
      catalog: fallbackWidgetCatalog,
      source: 'fallback',
    };
  }

  try {
    const [catalogRaw, layoutRaw] = await Promise.all([
      fetchJson('/ui/widgets', token),
      fetchJson('/ui/dashboard/layout', token),
    ]);

    const catalogParsed = widgetCatalogResponseSchema.safeParse(catalogRaw);
    const layoutParsed = dashboardLayoutSchema.safeParse(layoutRaw);

    if (!catalogParsed.success || !layoutParsed.success) {
      throw new Error('Invalid UI response');
    }

    return {
      layout: layoutParsed.data,
      catalog: catalogParsed.data.items,
      source: 'api',
    };
  } catch {
    return {
      layout: fallbackDashboardLayout,
      catalog: fallbackWidgetCatalog,
      source: 'fallback',
    };
  }
}
