# OpenTelemetry Baseline

This document defines the baseline OpenTelemetry (OTel) setup for FreeFlow.
It focuses on service-side tracing and metrics with an OTLP exporter.

## Recommended Stack (Dev)

- OpenTelemetry Collector (in-cluster)
- Traces backend (Tempo or Jaeger)
- Metrics backend (Prometheus)

## NestJS Instrumentation

- Use the Node OTel SDK with auto-instrumentations.
- Set a consistent `service.name` per service.
- Export via OTLP to the Collector.

Environment variables (example):

- `OTEL_SERVICE_NAME=freeflow-api`
- `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318`
- `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`
- `OTEL_TRACES_EXPORTER=otlp`
- `OTEL_METRICS_EXPORTER=otlp`
- `OTEL_RESOURCE_ATTRIBUTES=service.namespace=freeflow,service.version=<git-sha>`

## Next.js Instrumentation (Optional)

- Use browser-side tracing only if you need frontend spans.
- Prefer sampling and avoid sending sensitive data from clients.
- Export via OTLP/HTTP to the Collector ingress or a public endpoint.

## Collector Values (Dev)

See `infra/helm/otel-collector-values.dev.yaml` for a starter config. It:

- Receives OTLP (gRPC + HTTP)
- Applies batch processing
- Exports traces and metrics to a backend

## Notes

- Start with low sampling in dev, then adjust for staging/prod.
- Add baggage and correlation IDs only where needed to avoid cardinality blowups.
