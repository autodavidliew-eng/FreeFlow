# Helm Charts

This chart deploys the FreeFlow services (web, api, dashboard, alarm, inbox).

## Structure

- `infra/helm/freeflow/Chart.yaml`
- `infra/helm/freeflow/values.yaml`
- `infra/helm/freeflow/templates/*`

## Install

```bash
helm upgrade --install freeflow infra/helm/freeflow \
  --namespace freeflow --create-namespace
```

## Values

Each component has its own values block:

```yaml
components:
  api:
    image:
      repository: ghcr.io/OWNER/REPO-api
      tag: latest
    env:
      DATABASE_URL: postgresql://...
    secretEnv:
      JWT_SECRET: change-me
```

## ConfigMaps and Secrets

- `config` → ConfigMap per component
- `secretEnv` → Secret per component
- `existingSecret` → reference a pre-created Secret

## Services

Each component gets a ClusterIP service by default. Adjust `service.type` to `LoadBalancer`
if you want external access.

## Rendering

```bash
helm template freeflow infra/helm/freeflow
```
