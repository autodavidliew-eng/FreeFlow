# Form.io Deployment Plan (Kubernetes)

This is a pragmatic plan for deploying Form.io in Kubernetes. It focuses on a
single API server plus an optional PDF server and relies on MongoDB for storage.

## Recommended Approach

- Use a dedicated namespace (for example, `formio`).
- Run Form.io API server as a standard Deployment + Service.
- Run the PDF server as a separate Deployment (if you need PDF export).
- Use managed MongoDB in staging/production where possible.
- Store files in object storage (S3/GCS/Azure) instead of local volumes.

## Prereqs

- MongoDB (managed or in-cluster)
- Kubernetes Ingress controller (optional)
- TLS via cert-manager (recommended)

## Core Configuration

Match the env vars used in `infra/compose/docker-compose.yml`:

- `MONGO_URL`
- `MONGO_HIGH_AVAILABILITY`
- `FORMIO_FILES_SERVER`
- `PORTAL_ENABLED`
- `JWT_SECRET`
- `DB_SECRET`
- `PRIMARY`
- `PROJECT_TEMPLATE`
- `ROOT_EMAIL`
- `ROOT_PASSWORD`

Store secrets in a Kubernetes Secret and reference via `envFrom`/`secretKeyRef`.

## Helm Install (example)

You can use a small in-house Helm chart (Deployment/Service/Ingress) or a
generic app-template chart. The `infra/helm/formio-values.dev.yaml` file is a
starter for a minimal chart with common `image`, `service`, `env`, and
`resources` keys.

```bash
helm upgrade --install formio ./infra/helm/formio \
  --namespace formio --create-namespace \
  -f infra/helm/formio-values.dev.yaml
```

## PDF Server (Optional)

- Deploy as a separate Deployment/Service.
- Configure the API server to point to the PDF service.
- Keep resource limits conservative; PDF render can spike CPU/memory.

## Storage Notes

- Use managed MongoDB for stg/prod.
- Prefer external object storage for uploaded files.
- Use persistent volumes only for dev or when object storage is unavailable.

## Operational Notes

- Start with 1 replica; scale API server horizontally after confirming session
  and file handling behavior.
- Add readiness/liveness probes on `/health`.
- Rotate `JWT_SECRET` and `DB_SECRET` through a controlled rollout.
