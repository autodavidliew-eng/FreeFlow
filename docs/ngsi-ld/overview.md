# NGSI-LD + Scorpio Overview

## Why NGSI-LD
NGSI-LD is an ETSI-standard API and information model for publishing, querying, and subscribing to context information. It models entities as properties and relationships and uses JSON-LD for semantic interoperability. It is suitable for real-time IoT data exchange across multiple domains.

## Why Scorpio
Scorpio is a reference NGSI-LD context broker with full NGSI-LD API support, including subscriptions and change notifications. It provides a standard interface for data providers and consumers, which matches FreeFlow’s goal of broker-agnostic, interoperable integrations.

## FreeFlow Integration (High Level)

```
IoT Devices -> ngsi-ingestor -> Scorpio NGSI-LD Broker -> ngsi-consumer -> Postgres (timeseries)
                              ^
                              |
                       context-server (@context)
```

## Multi-tenant strategy
- Every NGSI-LD request includes the `NGSILD-Tenant` header.
- Tenant header controls isolation for entities, subscriptions, and queries.

## Custom context strategy
- FreeFlow hosts a custom JSON-LD context at `/context/freeflow-energy.jsonld`.
- FreeFlow hosts a local NGSI-LD core context at `/context/ngsi-ld-core-context.jsonld` for offline dev.
- All entities/subscriptions include `@context` in the payload and use `Content-Type: application/ld+json`.

## Key APIs
- Entity operations: `/ngsi-ld/v1/entities`
- Subscriptions: `/ngsi-ld/v1/subscriptions`

## References
- NGSI-LD overview: https://ngsi-ld.org/
- Scorpio docs (API walkthrough): https://scorpio.readthedocs.io/en/stable/API_walkthrough.html
- NGSI-LD multi-tenancy (ETSI): https://docbox.etsi.org/isg/cim/open/NGSI-LD_API_v1.3.1-New_Features_and_Changes.pdf
- JSON-LD Link header guidance (FIWARE): https://fiware-datamodels.readthedocs.io/en/stable/ngsi-ld_faq/
- Smart Data Models: https://smart-data-models.github.io/data-models/
