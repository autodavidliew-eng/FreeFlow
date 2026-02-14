# Qdrant Data Layer

## Overview

This package provides a lightweight wrapper around the Qdrant REST client.
It includes helpers to ensure collections exist and to upsert/search vectors.

## Package

- `packages/db-qdrant`

## Connection

Set `QDRANT_URL` (and optional `QDRANT_API_KEY`) in the service `.env.local` file.
For the local docker-compose stack:

```bash
QDRANT_URL=http://localhost:6333
```

## Usage

```ts
import { ensureCollection, upsertVectors, searchVectors } from '@freeflow/db-qdrant';

await ensureCollection({
  name: 'freeflow-docs',
  vectorSize: 768,
  distance: 'Cosine',
});

await upsertVectors({
  collection: 'freeflow-docs',
  points: [
    { id: 'doc-1', vector: [0.1, 0.2], payload: { source: 'manual' } },
  ],
});

const results = await searchVectors({
  collection: 'freeflow-docs',
  vector: [0.1, 0.2],
  limit: 3,
});
```

## Notes

- Collections must exist before upserting points.
- Use `ensureCollection` during service startup.
- The default `distance` values include `Cosine`, `Dot`, `Euclid`.
