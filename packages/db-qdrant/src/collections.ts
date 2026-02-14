import type { Schemas } from '@qdrant/js-client-rest';

import { createQdrantClient } from './client';

type CreateCollection = Schemas['CreateCollection'];
type VectorParams = Schemas['VectorParams'];
type Distance = Schemas['Distance'];

export type CollectionConfig = {
  name: string;
  vectorSize: number;
  distance: Distance;
};

function buildConfig(config: CollectionConfig): CreateCollection {
  const vectors: VectorParams = {
    size: config.vectorSize,
    distance: config.distance,
  };

  return { vectors };
}

export async function ensureCollection(config: CollectionConfig) {
  const client = createQdrantClient();

  try {
    await client.getCollection(config.name);
    return { created: false };
  } catch {
    await client.createCollection(config.name, buildConfig(config));
    return { created: true };
  }
}
