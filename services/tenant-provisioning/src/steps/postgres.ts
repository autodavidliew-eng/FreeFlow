import { Client } from 'pg';

import { safeIdentifier } from '../utils';

export const ensurePostgresDatabase = async (
  adminUrl: string,
  dbName: string
): Promise<void> => {
  const client = new Client({ connectionString: adminUrl });
  await client.connect();

  try {
    const check = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    if (check.rowCount && check.rowCount > 0) {
      return;
    }

    const safeName = safeIdentifier(dbName);
    await client.query(`CREATE DATABASE "${safeName}"`);
  } finally {
    await client.end();
  }
};

export const dropPostgresDatabase = async (
  adminUrl: string,
  dbName: string
): Promise<void> => {
  const client = new Client({ connectionString: adminUrl });
  await client.connect();

  try {
    const safeName = safeIdentifier(dbName);
    await client.query(`DROP DATABASE IF EXISTS "${safeName}"`);
  } finally {
    await client.end();
  }
};
