# NGSI-LD Subscriptions

## Create subscription (script)

```bash
pnpm exec ts-node scripts/ngsi/scorpio-create-smartmeter-subscription.ts
```

Environment overrides:
- `SCORPIO_URL`
- `TENANT`
- `CONTEXT_URL`
- `CONSUMER_URL`
- `METER_ID`

## Delete subscription (script)

```bash
pnpm exec ts-node scripts/ngsi/scorpio-delete-subscription.ts --id urn:ngsi-ld:Subscription:alpha:emeter-001
```

## Curl equivalent

```bash
curl -i -X POST "http://localhost:9090/ngsi-ld/v1/subscriptions" \
  -H "Content-Type: application/ld+json" \
  -H "NGSILD-Tenant: alpha" \
  --data-binary @docs/ngsi-ld/examples/subscription-smartmeter.jsonld
```
