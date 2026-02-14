# Secrets Management

This document describes how to manage secrets for FreeFlow using External
Secrets (recommended) or Vault.

## Option A: External Secrets (Recommended)

- Install External Secrets Operator (ESO) in the cluster.
- Store secrets in a provider (AWS Secrets Manager, GCP Secret Manager, etc).
- Use `ExternalSecret` resources to sync into Kubernetes Secrets.

### Example Flow

1. Create secret in cloud provider.
2. Create `SecretStore` and `ExternalSecret` in the namespace.
3. Reference the synced Kubernetes Secret in Helm values.

## Option B: HashiCorp Vault

- Run Vault in-cluster or use managed Vault.
- Use Kubernetes auth + Vault Agent Injector for secrets injection.
- Avoid long-lived tokens in pods.

## App Integration

- Prefer `existingSecret` values in Helm charts.
- Keep secrets out of `values.yaml` and repo.
- Use rotation schedules and test rollouts.

## Notes

- Separate secrets per environment.
- Limit access with least privilege.
