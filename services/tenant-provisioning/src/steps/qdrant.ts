export const ensureQdrantCollection = async (input: {
  qdrantUrl: string;
  collectionName: string;
  vectorSize: number;
  distance: 'Cosine' | 'Dot' | 'Euclid';
}): Promise<void> => {
  const base = input.qdrantUrl.replace(/\/$/, '');
  const collectionUrl = `${base}/collections/${encodeURIComponent(input.collectionName)}`;

  const existsResponse = await fetch(collectionUrl);
  if (existsResponse.status === 200) {
    return;
  }

  if (existsResponse.status !== 404) {
    const message = await existsResponse.text();
    throw new Error(`Qdrant check failed: ${existsResponse.status} ${message}`);
  }

  const createResponse = await fetch(collectionUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vectors: {
        size: input.vectorSize,
        distance: input.distance,
      },
    }),
  });

  if (!createResponse.ok) {
    const message = await createResponse.text();
    throw new Error(
      `Qdrant create failed: ${createResponse.status} ${message}`
    );
  }
};

export const dropQdrantCollection = async (
  qdrantUrl: string,
  collectionName: string
): Promise<void> => {
  const base = qdrantUrl.replace(/\/$/, '');
  const collectionUrl = `${base}/collections/${encodeURIComponent(collectionName)}`;

  const response = await fetch(collectionUrl, { method: 'DELETE' });
  if (response.status === 200 || response.status === 404) {
    return;
  }

  const message = await response.text();
  throw new Error(`Qdrant delete failed: ${response.status} ${message}`);
};
