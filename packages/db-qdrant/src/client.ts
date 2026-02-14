import { QdrantClient } from '@qdrant/js-client-rest';

export type QdrantConfig = {
  url: string;
  apiKey?: string;
};

export function createQdrantClient(config?: Partial<QdrantConfig>) {
  const url = config?.url ?? process.env.QDRANT_URL;
  if (!url) {
    throw new Error('Missing QDRANT_URL');
  }

  return new QdrantClient({
    url,
    apiKey: config?.apiKey ?? process.env.QDRANT_API_KEY,
  });
}
