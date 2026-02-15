import { PrismaClient } from '@prisma/client';

type SeedUser = {
  externalId: string;
  email: string;
  name: string;
  roles: string[];
};

type LayoutSeed = {
  name: string;
  layout: {
    version: number;
    sections: Array<{
      id: string;
      title?: string;
      layout?: 'grid' | 'stack';
      columns?: number;
      widgets: Array<{
        instanceId: string;
        widgetId: string;
        size?: 'full' | 'half' | 'third';
      }>;
    }>;
  };
};

const prisma = new PrismaClient();

const widgetCatalog = [
  {
    key: 'kpi-widget',
    name: 'Key Metrics',
    type: 'kpi',
    defaultConfig: { emphasis: 'summary' },
  },
  {
    key: 'chart-widget',
    name: 'Load Distribution',
    type: 'chart',
    defaultConfig: { series: ['Energy', 'Water'] },
  },
  {
    key: 'alarm-widget',
    name: 'Active Alarms',
    type: 'alarm-list',
    defaultConfig: { severities: ['high', 'medium', 'low'] },
  },
  {
    key: 'admin-widget',
    name: 'Admin Control',
    type: 'admin',
    defaultConfig: { actions: ['export', 'configure'] },
  },
];

const appCatalog = [
  {
    appKey: 'contractor',
    name: 'Contractor',
    icon: 'users',
    launchUrl: '/apps/contractor',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'electric-meter',
    name: 'Electric Meter',
    icon: 'bolt',
    launchUrl: '/apps/electric-meter',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'equipment-management',
    name: 'Equipment Management',
    icon: 'tool',
    launchUrl: '/apps/equipment-management',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'operation-scheduler',
    name: 'Operation Scheduler',
    icon: 'calendar',
    launchUrl: '/apps/operation-scheduler',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'report',
    name: 'Report',
    icon: 'file-text',
    launchUrl: '/apps/report',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'rule-engine',
    name: 'Rule Engine',
    icon: 'sliders',
    launchUrl: '/apps/rule-engine',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'scene-management',
    name: 'Scene Management',
    icon: 'layers',
    launchUrl: '/apps/scene-management',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'user',
    name: 'User Management',
    icon: 'user',
    launchUrl: '/apps/user',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'water-meter',
    name: 'Water Meter',
    icon: 'droplet',
    launchUrl: '/apps/water-meter',
    integrationMode: 'embedded',
    enabled: true,
  },
  {
    appKey: 'system-configuration',
    name: 'System Configuration',
    icon: 'settings',
    launchUrl: '/apps/system-configuration',
    integrationMode: 'embedded',
    enabled: true,
  },
];

const baseLayout: LayoutSeed = {
  name: 'Operations Dashboard',
  layout: {
    version: 1,
    sections: [
      {
        id: 'metrics',
        title: 'Today',
        layout: 'stack',
        widgets: [
          {
            instanceId: 'kpi-primary',
            widgetId: 'kpi-widget',
            size: 'full',
          },
        ],
      },
      {
        id: 'ops-overview',
        title: 'Operational Overview',
        layout: 'grid',
        columns: 2,
        widgets: [
          {
            instanceId: 'chart-load',
            widgetId: 'chart-widget',
            size: 'half',
          },
          {
            instanceId: 'alarm-list',
            widgetId: 'alarm-widget',
            size: 'half',
          },
        ],
      },
    ],
  },
};

const viewerLayout: LayoutSeed = {
  name: 'Operations Dashboard',
  layout: {
    version: 1,
    sections: [
      {
        id: 'metrics',
        title: 'Today',
        layout: 'stack',
        widgets: [
          {
            instanceId: 'kpi-primary',
            widgetId: 'kpi-widget',
            size: 'full',
          },
        ],
      },
      {
        id: 'ops-overview',
        title: 'Operational Overview',
        layout: 'grid',
        columns: 2,
        widgets: [
          {
            instanceId: 'chart-load',
            widgetId: 'chart-widget',
            size: 'half',
          },
        ],
      },
    ],
  },
};

const users: SeedUser[] = [
  {
    externalId: 'user-admin',
    email: 'admin@freeflow.dev',
    name: 'Admin Operator',
    roles: ['Admin'],
  },
  {
    externalId: 'user-operator',
    email: 'operator@freeflow.dev',
    name: 'Ops Lead',
    roles: ['Operator'],
  },
  {
    externalId: 'user-viewer',
    email: 'viewer@freeflow.dev',
    name: 'Read Only',
    roles: ['Viewer'],
  },
];

function buildWidgetConfigs(
  layout: LayoutSeed['layout'],
  userId: string,
  dashboardLayoutId: string
) {
  const widgets = layout.sections.flatMap((section) =>
    section.widgets.map((widget) => ({
      userId,
      dashboardLayoutId,
      widgetId: widget.widgetId,
      instanceId: widget.instanceId,
      size: widget.size ?? null,
      options: {},
    }))
  );

  return widgets;
}

async function seedUser(user: SeedUser) {
  const storedUser = await prisma.userProfile.upsert({
    where: { externalId: user.externalId },
    update: {
      email: user.email,
      name: user.name,
      roles: user.roles,
    },
    create: {
      externalId: user.externalId,
      email: user.email,
      name: user.name,
      roles: user.roles,
    },
  });

  await prisma.dashboardLayout.deleteMany({
    where: { userId: storedUser.id },
  });

  await prisma.widgetConfig.deleteMany({
    where: { userId: storedUser.id },
  });

  const dashboard = await prisma.dashboardLayout.create({
    data: {
      userId: storedUser.id,
      name: baseLayout.name,
      isDefault: true,
      version: baseLayout.layout.version,
      layout: baseLayout.layout,
    },
  });

  const widgetConfigs = buildWidgetConfigs(
    baseLayout.layout,
    storedUser.id,
    dashboard.id
  );

  if (widgetConfigs.length > 0) {
    await prisma.widgetConfig.createMany({ data: widgetConfigs });
  }
}

async function seedWidgetCatalog() {
  for (const entry of widgetCatalog) {
    await prisma.widgetCatalog.upsert({
      where: { key: entry.key },
      update: {
        name: entry.name,
        type: entry.type,
        defaultConfig: entry.defaultConfig,
      },
      create: {
        key: entry.key,
        name: entry.name,
        type: entry.type,
        defaultConfig: entry.defaultConfig,
      },
    });
  }
}

async function seedAppCatalog() {
  for (const entry of appCatalog) {
    await prisma.appCatalog.upsert({
      where: { appKey: entry.appKey },
      update: {
        name: entry.name,
        icon: entry.icon,
        launchUrl: entry.launchUrl,
        integrationMode: entry.integrationMode,
        enabled: entry.enabled,
      },
      create: {
        appKey: entry.appKey,
        name: entry.name,
        icon: entry.icon,
        launchUrl: entry.launchUrl,
        integrationMode: entry.integrationMode,
        enabled: entry.enabled,
      },
    });
  }
}

async function seedRoleLayouts() {
  const layouts = [
    { role: 'Admin', seed: baseLayout },
    { role: 'Operator', seed: baseLayout },
    { role: 'Viewer', seed: viewerLayout },
  ];

  for (const entry of layouts) {
    await prisma.roleDashboardLayout.upsert({
      where: { role: entry.role },
      update: {
        name: entry.seed.name,
        version: entry.seed.layout.version,
        layout: entry.seed.layout,
      },
      create: {
        role: entry.role,
        name: entry.seed.name,
        version: entry.seed.layout.version,
        layout: entry.seed.layout,
      },
    });
  }
}

async function main() {
  await seedWidgetCatalog();
  await seedAppCatalog();
  await seedRoleLayouts();

  for (const user of users) {
    await seedUser(user);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
