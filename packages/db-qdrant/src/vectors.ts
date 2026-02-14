import type { Schemas } from '@qdrant/js-client-rest';

import { createQdrantClient } from './client';

type PointStruct = Schemas['PointStruct'];
type ScoredPoint = Schemas['ScoredPoint'];

export type UpsertVectorInput = {
  collection: string;
  points: PointStruct[];
};

export type SearchVectorInput = {
  collection: string;
  vector: number[];
  limit?: number;
  filter?: Record<string, unknown>;
};

export async function upsertVectors(input: UpsertVectorInput) {
  const client = createQdrantClient();
  await client.upsert(input.collection, {
    wait: true,
    points: input.points,
  });
}

export async function searchVectors(
  input: SearchVectorInput
): Promise<ScoredPoint[]> {
  const client = createQdrantClient();

  return client.search(input.collection, {
    vector: input.vector,
    limit: input.limit ?? 5,
    filter: input.filter,
  });
}
