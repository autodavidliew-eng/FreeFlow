# Probes and Resources

This chart includes startup, readiness, and liveness probes per service.
Defaults are conservative and can be tuned in `values.yaml`.

## Default Paths

- Web: `/`
- API/services: `/health`

## Resource Defaults

Each component has default resource requests/limits:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

Tune these per environment in your values files.

## HPA

Autoscaling is disabled by default. Enable per component:

```yaml
components:
  api:
    autoscaling:
      enabled: true
      minReplicas: 2
      maxReplicas: 5
      targetCPUUtilizationPercentage: 70
```

## PDB

PodDisruptionBudget is disabled by default. Enable per component:

```yaml
components:
  api:
    pdb:
      enabled: true
      minAvailable: 1
```
