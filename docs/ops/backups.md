# Backup and Restore Guide

This document defines backup and restore guidance for FreeFlow dependencies.

## Strategy by Dependency

### PostgreSQL

- **Preferred:** Managed Postgres snapshots + PITR (WAL)
- **Self-managed:** Daily base backups + WAL archiving
- **Retention:** 7-30 days (prod), 7 days (stg)

### MongoDB

- **Preferred:** Managed Atlas backups with PITR
- **Self-managed:** Daily snapshots + oplog capture
- **Retention:** 7-30 days (prod), 7 days (stg)

### Qdrant

- **Preferred:** Managed Qdrant Cloud snapshots
- **Self-managed:** Scheduled snapshots to object storage
- **Retention:** 7-30 days (prod), 7 days (stg)

### RabbitMQ

- **Preferred:** Managed service or operator with definitions export
- **Self-managed:** Export definitions regularly; queues are ephemeral
- **Retention:** Keep last known-good definitions

## Restore Drill Checklist

1. Pick a staging environment window.
2. Restore Postgres backup to a new instance and validate schema/migrations.
3. Restore MongoDB snapshot and validate collections/indexes.
4. Restore Qdrant snapshot and validate collection status.
5. Reapply RabbitMQ definitions and validate queues/exchanges.
6. Run smoke tests for core APIs (dashboard/alarms/inbox).
7. Record time-to-recover and any issues.

## Notes

- Automate backups and verify alerts on failure.
- Always test restores; backups are useless without recovery practice.
