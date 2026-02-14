# Stateful Dependencies Strategy

This document outlines how FreeFlow should deploy stateful dependencies across dev/stg/prod.

## Summary

- **Dev**: Use Docker Compose (local)
- **Staging/Prod**: Prefer managed services where possible
- **In-cluster**: Use Helm charts/operators if managed services are not available

## Dependency Recommendations

### PostgreSQL

**Preferred (stg/prod):** Managed Postgres (RDS, Cloud SQL, Azure Database)

**In-cluster alternative:**
- CloudNativePG or CrunchyData Postgres Operator
- Ensure backups, PITR, TLS, and monitoring

### MongoDB

**Preferred (stg/prod):** Managed MongoDB Atlas

**In-cluster alternative:**
- MongoDB Community Operator
- StatefulSet with storage class, backups, and TLS

### Qdrant

**Preferred (stg/prod):** Managed Qdrant Cloud

**In-cluster alternative:**
- Official Qdrant Helm chart
- Use persistent volumes and snapshot backups

### RabbitMQ

**Preferred (stg/prod):** Managed RabbitMQ (CloudAMQP, Aiven)

**In-cluster alternative:**
- Bitnami RabbitMQ Helm chart or RabbitMQ Cluster Operator
- Configure DLX/DLQ, quorum queues for HA

### Redis (if used)

**Preferred (stg/prod):** Managed Redis (ElastiCache, MemoryStore)

**In-cluster alternative:**
- Bitnami Redis Helm chart with persistence disabled if used as cache only

## Backups & Recovery

- Postgres: daily snapshots + WAL/PITR
- Mongo: daily snapshots + oplog backup
- Qdrant: scheduled snapshots stored in object storage
- RabbitMQ: definitions export; queues are ephemeral by design

## Environment-Specific Notes

### Dev

Use `infra/compose/docker-compose.yml` and the Makefile targets:

```bash
make up
make backup
make restore
```

### Staging/Prod

- Use environment-specific secrets
- Enforce TLS and network policies
- Enable monitoring/alerting

## Tradeoffs

- Managed services reduce operational load and risk.
- In-cluster gives more control but requires strong SRE practices.
