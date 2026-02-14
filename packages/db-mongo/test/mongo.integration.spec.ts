import type { Connection, Model } from 'mongoose';
import mongoose from 'mongoose';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';
import { AuditLog, type AuditLogDocument, AuditLogSchema } from '../src/models/audit-log.schema';
import { AuditLogRepository } from '../src/repositories/audit-log.repository';

describe('Mongo integration (Mongoose)', () => {
  jest.setTimeout(120_000);

  let container: StartedTestContainer;
  let connection: Connection;
  let repository: AuditLogRepository;

  beforeAll(async () => {
    container = await new GenericContainer('mongo:7')
      .withExposedPorts({ container: 27017, host: 27018 })
      .withWaitStrategy(Wait.forLogMessage('Waiting for connections'))
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(27017);
    const connectionString = `mongodb://${host}:${port}`;
    connection = await mongoose.createConnection(connectionString, {
      dbName: 'freeflow',
    }).asPromise();

    const model = connection.model(
      AuditLog.name,
      AuditLogSchema,
    ) as unknown as Model<AuditLogDocument>;
    repository = new AuditLogRepository(model);
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    if (container) {
      await container.stop();
    }
  });

  it('writes and reads audit logs', async () => {
    await repository.create({
      action: 'dashboard.view',
      userId: 'user-admin',
      resourceType: 'dashboard',
      resourceId: 'default',
      metadata: { source: 'integration-test' },
    });

    const recent = await repository.findRecent(5);

    expect(recent.length).toBeGreaterThan(0);
    expect(recent[0].action).toBe('dashboard.view');
  });
});
