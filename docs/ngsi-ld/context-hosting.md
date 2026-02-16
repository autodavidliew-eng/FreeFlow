# Context Hosting

FreeFlow hosts JSON-LD contexts for NGSI-LD entities at a dedicated context server.

## Endpoints
- `GET /context/freeflow-energy.jsonld`
- `GET /context/ngsi-ld-core-context.jsonld`
- `GET /context/index.json`

## Local dev

```bash
pnpm --filter @freeflow/context-server dev
```

Default URL:
- http://localhost:8090/context/freeflow-energy.jsonld

## Docker compose
The `context-server` service is added to the compose file under the `ngsi` profile.

```bash
cd infra/compose
sudo docker compose --profile ngsi up -d context-server
```

## Notes
- Entities and subscriptions should reference this context in their `@context` array.
