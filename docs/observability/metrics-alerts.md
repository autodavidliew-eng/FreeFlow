# Metrics, Dashboards, and Alerts

This document defines a pragmatic monitoring baseline for FreeFlow.

## Recommended Stack (Dev)

- Prometheus (metrics scraping)
- Grafana (dashboards)
- Alertmanager (alert routing)

## Key Service Metrics

Collect at least:

- Request rate (RPS)
- Error rate (4xx/5xx)
- Latency (p50/p95/p99)
- Saturation (CPU/memory)
- Queue depth (RabbitMQ) and retry/DLQ counts

## Suggested Dashboards

- API gateway overview (RPS, error rate, latency)
- Service health (per-service latency + error rate)
- Messaging (queue depth, retry, DLQ)
- Database health (connections, query latency)

## Example Alert Rules

- High 5xx error rate (> 2% over 5m)
- API p95 latency > 1s for 5m
- RabbitMQ queue depth > 1,000 for 10m
- Pod restarts > 3 in 10m
- CPU > 85% for 10m

## Notes

- Tune thresholds per environment.
- Alert on symptoms, not just resource usage.
- Keep alert volume small and actionable.
