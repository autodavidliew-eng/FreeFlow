# OpenFGA Authorization Model (P4.1)

This document captures the OpenFGA model used for FreeFlow fine-grained authorization.

## Model Source

- `infra/openfga/model.fga`
- Seed tuples: `infra/openfga/seed-tuples.json`

## Types

- `user`
- `tenant`
- `app`
- `dashboard`
- `task`
- `alarm`
- `site`
- `form`

## Relations (high-level)

- Tenants: `member`, `admin`
- Apps: `launch`, `manage`
- Dashboard: `view`, `edit`
- Task: `view`, `assign`, `complete`
- Alarm: `view`, `acknowledge`, `resolve`
- Site: `view`, `manage`
- Form: `view`, `submit`, `manage`

## Bootstrap

1. Start the local stack (includes OpenFGA).
2. Run `infra/openfga/bootstrap.sh` to create the store, write the model, and seed tuples.

```bash
export FGA_URL=http://localhost:8083
./infra/openfga/bootstrap.sh
```

The bootstrap script prints the store ID and model ID. Use those for API checks.

## Example Checks

```bash
# check if admin can launch rule-engine
fga query check --store-id <store_id> --model-id <model_id> \
  --user user:admin --relation launch --object app:rule-engine

# check if viewer can edit dashboard (expected false)
fga query check --store-id <store_id> --model-id <model_id> \
  --user user:viewer --relation edit --object dashboard:operations
```
