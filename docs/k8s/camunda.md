# Camunda 8 Deployment Plan (Self-Managed)

This is a pragmatic plan for deploying Camunda 8 in Kubernetes using Helm.
The default version target is `8.4.x`, aligned with the local Docker profile.

## Recommended Approach

- Use Camunda Helm charts in a dedicated namespace (`camunda`).
- Start in dev/staging before production.
- Disable optional components you don't need (Web Modeler, Optimize).
- Use persistent volumes for Zeebe and Elasticsearch.

## Prereqs

- Kubernetes cluster with storage class for stateful workloads
- Ingress controller (optional)
- `helm` installed

## Helm Install (example)

```bash
helm repo add camunda https://helm.camunda.io
helm repo update

helm upgrade --install camunda camunda/camunda-platform \
  --namespace camunda --create-namespace \
  -f infra/helm/camunda-values.dev.yaml
```

## Values Guidance

The `infra/helm/camunda-values.dev.yaml` file is a starter for dev:

- Zeebe + Operate + Tasklist + Elasticsearch enabled
- Optional components disabled by default
- Conservative resource requests/limits

Validate keys against your target chart version before production.

## Production Notes

- For large workloads, consider external Elasticsearch or OpenSearch.
- Plan upgrades by version and test with a staging environment first.
