# Logging Standard

This document defines the logging baseline for FreeFlow, including structured
logs and correlation with traces.

## Log Format

Use structured JSON logs with these fields:

- `timestamp` (RFC3339)
- `level` (debug/info/warn/error)
- `message`
- `service`
- `environment`
- `trace_id`
- `span_id`
- `request_id`
- `user_id` (optional)

## Correlation IDs

- Generate a `request_id` at the edge (API gateway) if missing.
- Propagate `traceparent` headers across services.
- Inject `trace_id` and `span_id` into log context for every request.

## Shipping (Dev)

Recommended stack:

- Loki for log storage
- Promtail for log collection
- Grafana for querying

See `infra/helm/logging-values.dev.yaml` for a starter Helm values file.

## Notes

- Avoid logging secrets or PII.
- Use sampling or log-level tuning for noisy endpoints.
