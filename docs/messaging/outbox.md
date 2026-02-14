# Transactional Outbox (Postgres)

The transactional outbox ensures database changes and event publishing stay consistent.
Instead of publishing directly inside the request transaction, write an outbox row
in the same transaction. A worker publishes pending rows to RabbitMQ.

## Data Model

Table: `OutboxEvent`

Fields:

- `eventType` (routing key)
- `payload` (JSON)
- `headers` (JSON, optional)
- `status` (`PENDING`, `PROCESSING`, `PUBLISHED`, `FAILED`)
- `attempts`, `availableAt`, `lastError`

## Writing an Outbox Event (within a DB tx)

```ts
await prisma.$transaction(async (tx) => {
  await tx.dashboardLayout.update({
    where: { id: layoutId },
    data: { name: 'Ops Dashboard' },
  });

  await outboxService.enqueueTx(tx, {
    eventType: 'dashboard.layout.updated',
    payload: { layoutId },
    headers: { correlationId },
  });
});
```

## Worker

Run the worker to publish events:

```bash
node packages/outbox-postgres/src/worker.ts
```

Environment variables:

- `OUTBOX_POLL_INTERVAL` (ms, default `5000`)
- `OUTBOX_BATCH_SIZE` (default `20`)
- `OUTBOX_MAX_ATTEMPTS` (default `5`)
- `OUTBOX_RETRY_DELAY_MS` (default `30000`)

## Retry Behavior

- Failed publish attempts increment `attempts`.
- Events are retried after `OUTBOX_RETRY_DELAY_MS`.
- After max attempts, events are marked `FAILED`.

## Notes

- The outbox event id is used as the `eventId` header.
- Publish routing uses `eventType` as the routing key.
- Use `IdempotencyService` in consumers to avoid duplicates.
