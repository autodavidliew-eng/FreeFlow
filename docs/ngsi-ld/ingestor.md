# NGSI-LD Ingestor

The NGSI-LD ingestor service converts smart-meter readings into NGSI-LD entities and upserts them into Scorpio.

## Endpoints
- `POST /ingest/smartmeter` — ingest a single reading
- `POST /replay/smartmeter/week?speed=real|fast` — replay the 1-week CSV

## Environment
- `SCORPIO_URL` (default: `http://localhost:9090`)
- `CONTEXT_URL` (default: `http://localhost:8090/context/freeflow-energy.jsonld`)
- `DEFAULT_TENANT` (default: `alpha`)
- `DEFAULT_METER_ID` (default: `emeter-001`)
- `DEFAULT_SITE_ID` (default: `site-001`)
- `SAMPLE_DATA_PATH` (default: `../../data/samples/smartmeter_week_5min.csv`)

## Example

```bash
curl -X POST http://localhost:8091/ingest/smartmeter \
  -H "Content-Type: application/json" \
  -H "NGSILD-Tenant: alpha" \
  -d '{"ts":"2026-02-16T00:00:00Z","powerW":1234.5,"energyKWh":0.1028,"meterId":"emeter-001"}'
```

## Replay note
Generate the sample CSV before calling `/replay/smartmeter/week`:

```bash
python3 scripts/data/build_smartmeter_week_5min.py --start 2007-01-01
```
