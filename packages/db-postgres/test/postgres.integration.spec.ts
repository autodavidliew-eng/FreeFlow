import { execSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';

describe('Postgres integration (Prisma)', () => {
  jest.setTimeout(120_000);

  let prisma: PrismaClient;
  let container: StartedTestContainer;

  const waitForPort = (host: string, port: number, timeoutMs = 20_000) =>
    new Promise<void>((resolve, reject) => {
      const started = Date.now();

      const attempt = () => {
        const socket = net.createConnection({ host, port });
        socket.once('connect', () => {
          socket.end();
          resolve();
        });
        socket.once('error', () => {
          socket.destroy();
          if (Date.now() - started >= timeoutMs) {
            reject(
              new Error(`Timed out waiting for Postgres on ${host}:${port}`),
            );
            return;
          }
          setTimeout(attempt, 500);
        });
      };

      attempt();
    });

  const waitForPostgresReady = async (retries = 20) => {
    for (let attempt = 0; attempt < retries; attempt += 1) {
      const result = await container.exec([
        'pg_isready',
        '-U',
        'freeflow',
      ]);
      if (result.exitCode === 0) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error('Timed out waiting for Postgres readiness');
  };

  beforeAll(async () => {
    container = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_DB: 'freeflow',
        POSTGRES_USER: 'freeflow',
        POSTGRES_PASSWORD: 'freeflow_dev_password',
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .start();

    const host = container.getHost();
    const resolvedHost = host === 'localhost' ? '127.0.0.1' : host;
    const mappedPort = container.getMappedPort(5432);

    let connectionHost = resolvedHost;
    let connectionPort = mappedPort;

    const networkNames = container.getNetworkNames();
    if (networkNames.length > 0) {
      const directHost = container.getIpAddress(networkNames[0]);
      try {
        await waitForPort(directHost, 5432, 5_000);
        connectionHost = directHost;
        connectionPort = 5432;
      } catch {
        await waitForPort(resolvedHost, mappedPort);
      }
    } else {
      await waitForPort(resolvedHost, mappedPort);
    }

    const connectionString = `postgresql://freeflow:freeflow_dev_password@${connectionHost}:${connectionPort}/freeflow`;
    await waitForPostgresReady();
    process.env.DATABASE_URL = connectionString;
    process.env.NODE_ENV = 'test';

    const packageRoot = path.join(__dirname, '..');
    const prismaBin = path.join(packageRoot, 'node_modules', '.bin', 'prisma');
    const env = { ...process.env, DATABASE_URL: connectionString };

    execSync(`"${prismaBin}" generate --schema prisma/schema.prisma`, {
      cwd: packageRoot,
      env,
      stdio: 'pipe',
    });

    execSync(`"${prismaBin}" migrate deploy --schema prisma/schema.prisma`, {
      cwd: packageRoot,
      env,
      stdio: 'pipe',
    });

    const clientModule = await import('../src/client');
    prisma = clientModule.prisma as PrismaClient;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (container) {
      await container.stop();
    }
  });

  it('creates and reads a dashboard layout', async () => {
    const user = await prisma.userProfile.create({
      data: {
        externalId: 'user-admin',
        email: 'admin@freeflow.local',
        name: 'Admin',
        roles: ['Admin'],
      },
    });

    await prisma.dashboardLayout.create({
      data: {
        userId: user.id,
        name: 'Default',
        isDefault: true,
        version: 1,
        layout: {
          sections: [
            {
              id: 'default',
              title: 'Operations',
              layout: 'grid',
              columns: 2,
            },
          ],
        },
      },
    });

    const layouts = await prisma.dashboardLayout.findMany({
      where: { userId: user.id },
    });

    expect(layouts).toHaveLength(1);
    expect(layouts[0].name).toBe('Default');
    expect(layouts[0].layout).toMatchObject({
      sections: [{ id: 'default', columns: 2 }],
    });
  });
});
