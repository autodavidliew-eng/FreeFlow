import { MongoClient } from 'mongodb';

export const ensureMongoDatabase = async (
  adminUri: string,
  dbName: string
): Promise<void> => {
  const client = new MongoClient(adminUri);
  await client.connect();

  try {
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();
    const exists = databases.some((db) => db.name === dbName);

    if (!exists) {
      await client.db(dbName).createCollection('healthcheck');
    }
  } finally {
    await client.close();
  }
};

export const dropMongoDatabase = async (
  adminUri: string,
  dbName: string
): Promise<void> => {
  const client = new MongoClient(adminUri);
  await client.connect();

  try {
    await client.db(dbName).dropDatabase();
  } finally {
    await client.close();
  }
};
