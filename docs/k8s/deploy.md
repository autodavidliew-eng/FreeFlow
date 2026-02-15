# Kubernetes Deployment

## Health Endpoints

All services expose health endpoints used by Kubernetes probes:

- `GET /healthz`: liveness and startup
- `GET /readyz`: readiness

Services:

- Web (`apps/web`): `/healthz`, `/readyz`
- API (`apps/api`): `/healthz`, `/readyz`
- Alarm service: `/healthz`, `/readyz`
- Dashboard service: `/healthz`, `/readyz`
- Inbox service: `/healthz`, `/readyz`

## Helm Chart

The FreeFlow Helm chart configures probes, resources, and env wiring per component.

```bash
helm upgrade --install freeflow infra/helm/freeflow \
  -f infra/helm/environments/dev-values.yaml
```

### Probe Configuration

Probe paths are defined in `infra/helm/freeflow/values.yaml` under each component:

- `probes.liveness.path = /healthz`
- `probes.readiness.path = /readyz`
- `probes.startup.path = /healthz`

### Resources

Each component declares CPU/memory requests and limits in values:

- `resources.requests.cpu`
- `resources.requests.memory`
- `resources.limits.cpu`
- `resources.limits.memory`

### Config + Secrets

Environment variables and secrets are wired via:

- `global.env` and `components.<name>.env`
- `components.<name>.config` -> ConfigMap
- `components.<name>.secretEnv` or `components.<name>.existingSecret`

## Validation

```bash
helm template freeflow infra/helm/freeflow > /tmp/freeflow-rendered.yaml
```
