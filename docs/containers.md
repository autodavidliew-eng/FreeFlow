# Containers

This repo includes multi-stage Dockerfiles for the web app and NestJS services.

## Build Commands

From repo root:

```bash
docker build -f apps/web/Dockerfile -t freeflow-web .
docker build -f apps/api/Dockerfile -t freeflow-api .
docker build -f services/dashboard-service/Dockerfile -t freeflow-dashboard-service .
docker build -f services/alarm-service/Dockerfile -t freeflow-alarm-service .
docker build -f services/inbox-service/Dockerfile -t freeflow-inbox-service .
```

## Run Commands

```bash
docker run --rm -p 3000:3000 freeflow-web
docker run --rm -p 3001:3001 freeflow-api
docker run --rm -p 4101:4101 freeflow-dashboard-service
docker run --rm -p 4102:4102 freeflow-alarm-service
docker run --rm -p 4103:4103 freeflow-inbox-service
```

## Notes

- The NestJS services use `ts-node` at runtime to load workspace packages that
  currently export TypeScript sources (`packages/*` use `main: ./src/index.ts`).
  If you convert shared packages to buildable JS with `dist/` outputs, you can
  switch the service CMD to `node dist/main` and drop `ts-node` from runtime.
- `.dockerignore` excludes local build artifacts and secrets.
