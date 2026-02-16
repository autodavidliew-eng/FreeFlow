# NGSI-LD Consumer

The consumer receives NGSI-LD subscription notifications and persists smart meter measurements in Postgres.

## Endpoint
- `POST /notify/ngsi-ld`

## Database
Table: `SmartMeterMeasurement`
- `tenant`, `meterId`, `ts` (unique)
- `powerW`, `energyKWh`
- `rawJson`

## Run

```bash
pnpm --filter @freeflow/ngsi-consumer dev
```

Ensure `DATABASE_URL` is set to the FreeFlow Postgres instance.
