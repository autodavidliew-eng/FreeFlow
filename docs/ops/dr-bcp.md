# Disaster Recovery and Business Continuity

This runbook defines baseline DR/BCP guidance for FreeFlow.

## RTO/RPO Targets (Example)

- **RTO:** 4 hours
- **RPO:** 15 minutes

## Recovery Steps

1. Declare incident and start the incident bridge.
2. Restore Postgres from latest snapshot + WAL.
3. Restore MongoDB from latest snapshot + oplog.
4. Restore Qdrant snapshot to a fresh instance.
5. Reapply RabbitMQ definitions and confirm queue topology.
6. Deploy services from the last known-good release tag.
7. Run smoke tests for core journeys.

## Validation Checklist

- Auth/login works
- Dashboard loads
- Alarms list loads
- Inbox tasks load
- Background jobs running

## Notes

- Rehearse at least quarterly.
- Document and time every step to improve RTO/RPO.
