# Resilience Testing Plan

This document defines a chaos/resilience testing baseline for FreeFlow.

## Tooling (Example)

- Chaos Mesh or Litmus

## Failure Scenarios

- Kill API pods under load
- Kill RabbitMQ pod
- Inject network latency between services
- Fail Postgres primary (if HA)

## Safeguards

- Run only in staging
- Limit blast radius to one service at a time
- Use abort criteria (error rate > 5%, latency > 2s)

## Success Criteria

- Services recover without manual intervention
- Alerts fire as expected
- No data loss beyond defined RPO
