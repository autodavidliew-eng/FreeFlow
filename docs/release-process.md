# Release Process

This document defines a lightweight release strategy for FreeFlow with
dev → staging → production promotion.

## Versioning Strategy

- Every push to `main` produces images tagged with `:<git-sha>` and `:latest`.
- Production releases use SemVer tags: `vX.Y.Z`.
- Staging promotes a specific `:<git-sha>` tag for verification before prod.

## GitHub Environments

Create three environments in GitHub:

- `dev` (no approval required)
- `stg` (required reviewers)
- `prod` (required reviewers + manual approval)

Store environment-specific secrets in each environment (DB URLs, API keys, etc).

## Promotion Flow

1. Merge PR → `main`.
2. `release.yml` builds and pushes images for all services.
3. Deploy to **dev** with `infra/helm/environments/dev-values.yaml`.
4. Promote to **stg** by pinning `image.tag` to a specific `:<git-sha>` in
   `infra/helm/environments/stg-values.yaml`, then `helm upgrade`.
5. After staging validation, create a release tag `vX.Y.Z`, update
   `infra/helm/environments/prod-values.yaml` to the SemVer tag, and deploy
   with approval.

## Helm Commands (examples)

```bash
helm upgrade --install freeflow infra/helm/freeflow \
  --namespace freeflow --create-namespace \
  -f infra/helm/environments/dev-values.yaml

helm upgrade --install freeflow infra/helm/freeflow \
  --namespace freeflow \
  -f infra/helm/environments/stg-values.yaml

helm upgrade --install freeflow infra/helm/freeflow \
  --namespace freeflow \
  -f infra/helm/environments/prod-values.yaml
```

## Rollback

- Roll back via `helm rollback` to the previous release.
- Use the previous image tags recorded in the environment values.
