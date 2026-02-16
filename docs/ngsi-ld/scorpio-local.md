# Scorpio Local Dev

## Start Scorpio

From repo root:

```bash
cd infra/compose
sudo docker compose up -d scorpio-postgres scorpio
```

Scorpio will be available at:

- http://localhost:9090/ngsi-ld/v1

## Smoke test

```bash
INLINE_CONTEXT=1 ./scripts/ngsi/scorpio-smoke.sh
```

## Tenant bootstrap

```bash
node scripts/ngsi/scorpio-bootstrap-tenant.js
```

Optional env overrides:

```bash
SCORPIO_URL=http://localhost:9090 TENANT=alpha ./scripts/ngsi/scorpio-smoke.sh
```

## Notes

- The compose healthcheck uses `wget`. If the image lacks it, replace the healthcheck with a TCP check or install `wget` in a custom image.
