# NGSI-LD Subscriptions

## Create subscription (script)

```bash
node scripts/ngsi/scorpio-create-smartmeter-subscription.js
```

If you see `Tenant not found`, bootstrap the tenant first:

```bash
node scripts/ngsi/scorpio-bootstrap-tenant.js
```

Environment overrides:
- `SCORPIO_URL`
- `TENANT`
- `CONTEXT_URL`
- `CORE_CONTEXT_URL`
- `CONSUMER_URL`
- `METER_ID`

## Delete subscription (script)

```bash
node scripts/ngsi/scorpio-delete-subscription.js --id urn:ngsi-ld:Subscription:alpha:emeter-001
```

## Docker compose note
When Scorpio runs in Docker, use the `context-server` hostname so the broker can resolve the context:

```bash
CONTEXT_URL=http://context-server:8090/context/freeflow-energy.jsonld \
CORE_CONTEXT_URL=http://context-server:8090/context/ngsi-ld-core-context.jsonld \
node scripts/ngsi/scorpio-create-smartmeter-subscription.js
```

## Curl equivalent

```bash
curl -i -X POST "http://localhost:9090/ngsi-ld/v1/subscriptions" \
  -H "Content-Type: application/ld+json" \
  -H "NGSILD-Tenant: alpha" \
  --data-binary @docs/ngsi-ld/examples/subscription-smartmeter.jsonld
```
