# Network Policies

This document outlines a simple network policy baseline for FreeFlow.

## Goals

- Default deny all ingress in the namespace.
- Allow only required service-to-service traffic.
- Restrict egress where possible (DNS, database, message broker).

## Recommended CNI

- Calico or Cilium with NetworkPolicy support.

## Default Deny

Apply a namespace-wide default deny for ingress and egress, then add allowlists.

## Service Allowlist (example)

- `web` → `api` (HTTP 3001)
- `api` → `dashboard`, `alarm`, `inbox` (HTTP 4101/4102/4103)
- `api` → Postgres, Mongo, RabbitMQ
- `dashboard` → Postgres, Mongo
- `alarm` → RabbitMQ
- `inbox` → RabbitMQ

## Notes

- Start with ingress-only restrictions if egress is too disruptive.
- Validate policies in staging before production.
