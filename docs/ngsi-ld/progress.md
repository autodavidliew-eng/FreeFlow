# NGSI-LD (Scorpio) Integration Progress

Last updated: 2026-02-16

## Scope
- FIWARE/NGSI-LD integration using Scorpio broker
- Custom JSON-LD @context hosting
- Smart meter data model + samples (1 week @ 5-min)
- Ingestor service (NGSI-LD upserts)
- Consumer service + subscription automation
- Multi-tenant via NGSILD-Tenant header

## Phases
- S0.1 (Contract + docs + examples): Completed
- S1.1 (Scorpio compose + smoke tests): Completed
- S2.1 (Context server): Completed
- S3.1 (NGSI-LD client): Completed
- S4.1 (Sample data pipeline): Completed
- S5.1 (Ingestor): Completed
- S6.1 (Consumer): Completed
- S6.2 (Subscription scripts): Completed
- S7.1 (Gateway + RBAC/FGA): Deferred (future phase)
- S8.1 (Dashboard widget): Deferred (future phase)

## Notes
- Dataset source to be used: UCI “Individual household electric power consumption” (1-minute), aggregated to 5-minute.
- One-week sample CSV output: data/samples/smartmeter_week_5min.csv
- All broker calls include `NGSILD-Tenant` header.
