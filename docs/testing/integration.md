# Integration tests (Testcontainers)

These integration tests spin up real database containers using Testcontainers for Node.
They validate Prisma (Postgres) and Mongoose (Mongo) against live dependencies.

## Prerequisites

- Docker daemon running.
- Linux: your user must access the Docker socket. If not, run the commands with `sudo -E`.
- Run `pnpm install` in the repo root to ensure dependencies are present.

## Run tests

Postgres (Prisma):

```bash
pnpm --filter @freeflow/db-postgres test
```

Mongo (Mongoose):

```bash
pnpm --filter @freeflow/db-mongo test
```

## Notes

- The Postgres test runs `prisma generate` and `prisma migrate deploy` against the container.
- Each test starts and stops its own container; nothing is persisted.
- If your environment blocks Docker socket access, use:

```bash
sudo -E pnpm --filter @freeflow/db-postgres test
sudo -E pnpm --filter @freeflow/db-mongo test
```

Be aware `sudo` can create root-owned files; if that happens, fix ownership with:

```bash
sudo chown -R $USER:$USER /home/vapt/FreeFlow
```
