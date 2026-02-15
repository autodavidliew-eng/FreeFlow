export type AddonApp = {
  appKey: string;
  name: string;
  icon?: string | null;
  launchUrl: string;
  integrationMode: string;
  enabled: boolean;
};

export type AppCatalogResponse = {
  items: AddonApp[];
  total: number;
};

export type AddonHandoffResponse = {
  appKey: string;
  status: 'allowed';
  launchUrl: string;
  integrationMode: string;
  token: string;
  expiresAt: string;
  expiresIn: number;
};
