# Qdrant Vector Database Setup

Qdrant is a vector similarity search engine for FreeFlow's AI/ML features.

## Overview

Qdrant does not require initialization scripts like SQL databases. Collections are created dynamically via API calls when your application starts or when needed.

## Creating Collections

Collections should be created by your application code at runtime, not during container initialization.

### Via REST API

```bash
# Create a collection
curl -X PUT "http://localhost:6333/collections/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 384,
      "distance": "Cosine"
    },
    "optimizers_config": {
      "indexing_threshold": 10000
    }
  }'
```

### Via Python Client

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(host="localhost", port=6333)

# Create a collection for document embeddings
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(
        size=384,  # Depends on your embedding model
        distance=Distance.COSINE
    )
)
```

### Via TypeScript/JavaScript Client

```typescript
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ url: "http://localhost:6333" });

// Create a collection
await client.createCollection("documents", {
  vectors: {
    size: 384,
    distance: "Cosine",
  },
});
```

## Recommended Collections for FreeFlow

### 1. Documents Collection

For semantic search over documents:

```bash
curl -X PUT "http://localhost:6333/collections/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 384,
      "distance": "Cosine"
    }
  }'
```

### 2. Users Collection

For user similarity and recommendations:

```bash
curl -X PUT "http://localhost:6333/collections/users" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 256,
      "distance": "Cosine"
    }
  }'
```

### 3. Workflows Collection

For workflow similarity search:

```bash
curl -X PUT "http://localhost:6333/collections/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 384,
      "distance": "Cosine"
    }
  }'
```

## Vector Dimensions

Choose vector size based on your embedding model:

| Model | Dimensions | Use Case |
|-------|------------|----------|
| sentence-transformers/all-MiniLM-L6-v2 | 384 | General purpose, fast |
| OpenAI text-embedding-3-small | 1536 | High quality, general |
| OpenAI text-embedding-3-large | 3072 | Highest quality |
| Cohere embed-english-v3.0 | 1024 | English documents |
| Google PaLM | 768 | Google ecosystem |

## Distance Metrics

Choose distance metric based on your use case:

- **Cosine**: Best for text embeddings (normalized vectors)
- **Euclidean**: Good for image embeddings
- **Dot**: Fast but requires normalized vectors

## Creating Collections in Application

### NestJS Example

```typescript
// src/qdrant/qdrant.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
    });
  }

  async onModuleInit() {
    await this.initializeCollections();
  }

  private async initializeCollections() {
    const collections = await this.client.getCollections();
    const existingCollections = collections.collections.map(c => c.name);

    // Create documents collection if it doesn't exist
    if (!existingCollections.includes('documents')) {
      await this.client.createCollection('documents', {
        vectors: {
          size: 384,
          distance: 'Cosine',
        },
      });
      console.log('✓ Created Qdrant collection: documents');
    }

    // Create users collection if it doesn't exist
    if (!existingCollections.includes('users')) {
      await this.client.createCollection('users', {
        vectors: {
          size: 256,
          distance: 'Cosine',
        },
      });
      console.log('✓ Created Qdrant collection: users');
    }
  }
}
```

### Next.js Example

```typescript
// lib/qdrant.ts
import { QdrantClient } from "@qdrant/js-client-rest";

let client: QdrantClient | null = null;

export async function getQdrantClient() {
  if (!client) {
    client = new QdrantClient({
      url: process.env.QDRANT_URL || "http://localhost:6333",
    });

    // Initialize collections
    await initializeCollections(client);
  }

  return client;
}

async function initializeCollections(client: QdrantClient) {
  try {
    const collections = await client.getCollections();
    const existingCollections = collections.collections.map((c) => c.name);

    if (!existingCollections.includes("documents")) {
      await client.createCollection("documents", {
        vectors: {
          size: 384,
          distance: "Cosine",
        },
      });
    }
  } catch (error) {
    console.error("Error initializing Qdrant collections:", error);
  }
}
```

## Verifying Collections

### Via Dashboard

Visit http://localhost:6333/dashboard to see all collections and their stats.

### Via API

```bash
# List all collections
curl "http://localhost:6333/collections"

# Get collection info
curl "http://localhost:6333/collections/documents"

# Get collection stats
curl "http://localhost:6333/collections/documents/cluster"
```

### Via Client

```python
from qdrant_client import QdrantClient

client = QdrantClient(host="localhost", port=6333)

# List all collections
collections = client.get_collections()
print([c.name for c in collections.collections])

# Get collection info
info = client.get_collection("documents")
print(f"Vectors count: {info.vectors_count}")
print(f"Points count: {info.points_count}")
```

## Inserting Test Data

```bash
# Insert a test point
curl -X PUT "http://localhost:6333/collections/documents/points" \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {
        "id": 1,
        "vector": [0.1, 0.2, 0.3, ...],  # 384 dimensions
        "payload": {
          "title": "Test Document",
          "content": "This is a test document for semantic search"
        }
      }
    ]
  }'
```

## Searching

```bash
# Search for similar vectors
curl -X POST "http://localhost:6333/collections/documents/points/search" \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, 0.3, ...],
    "limit": 10,
    "with_payload": true
  }'
```

## Production Considerations

### 1. Persistent Storage

Ensure data persists using Docker volumes (already configured):

```yaml
volumes:
  - qdrant_data:/qdrant/storage
```

### 2. Performance Tuning

```bash
# Create collection with performance optimization
curl -X PUT "http://localhost:6333/collections/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 384,
      "distance": "Cosine"
    },
    "optimizers_config": {
      "indexing_threshold": 20000,
      "memmap_threshold": 50000
    },
    "hnsw_config": {
      "m": 16,
      "ef_construct": 100
    }
  }'
```

### 3. Backups

```bash
# Create snapshot
curl -X POST "http://localhost:6333/collections/documents/snapshots"

# List snapshots
curl "http://localhost:6333/collections/documents/snapshots"

# Download snapshot
curl "http://localhost:6333/collections/documents/snapshots/{snapshot_name}" \
  --output snapshot.tar
```

### 4. Monitoring

```bash
# Check cluster health
curl "http://localhost:6333/cluster"

# Get telemetry
curl "http://localhost:6333/telemetry"

# Check specific collection
curl "http://localhost:6333/collections/documents"
```

## Environment Variables

Set in your application:

```bash
# .env
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Optional, for production
```

## Common Issues

### Collection Already Exists

If you try to create a collection that already exists, you'll get an error. Always check first:

```typescript
const collections = await client.getCollections();
const exists = collections.collections.some(c => c.name === 'documents');

if (!exists) {
  await client.createCollection('documents', config);
}
```

### Wrong Vector Dimensions

Ensure your embedding model's output dimensions match the collection configuration.

### Slow Queries

- Increase `ef_construct` in HNSW config for better accuracy
- Use filters to narrow down search space
- Consider using quantization for large collections

## References

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Qdrant REST API](https://qdrant.tech/documentation/quick-start/)
- [Qdrant Python Client](https://github.com/qdrant/qdrant-client)
- [Qdrant JS Client](https://github.com/qdrant/qdrant-js)

## Quick Reference

```bash
# Dashboard
open http://localhost:6333/dashboard

# List collections
curl http://localhost:6333/collections

# Create collection
curl -X PUT http://localhost:6333/collections/my_collection \
  -H "Content-Type: application/json" \
  -d '{"vectors": {"size": 384, "distance": "Cosine"}}'

# Delete collection
curl -X DELETE http://localhost:6333/collections/my_collection

# Get collection stats
curl http://localhost:6333/collections/my_collection
```
