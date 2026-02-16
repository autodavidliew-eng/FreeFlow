# NGSI-LD Client

The `@freeflow/ngsi-ld-client` package provides a minimal TypeScript client for Scorpio NGSI-LD.

## Install (workspace)

```bash
pnpm --filter @freeflow/ngsi-ld-client test
```

## Usage

```ts
import { NgsiLdClient } from '@freeflow/ngsi-ld-client';

const client = new NgsiLdClient({
  baseUrl: 'http://localhost:9090',
  tenant: 'alpha',
});

await client.upsertEntity({
  id: 'urn:ngsi-ld:SmartMeter:alpha:emeter-001',
  type: 'SmartMeter',
  '@context': ['http://localhost:8090/context/freeflow-energy.jsonld'],
});
```

## Features
- `upsertEntity(entityJsonLd)`
- `getEntity(id)`
- `queryEntities(params)`
- `createSubscription(subscriptionJsonLd)`
- `deleteSubscription(id)`

All requests include `NGSILD-Tenant` if provided and send JSON-LD content types.
