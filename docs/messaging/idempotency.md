# Consumer Idempotency

FreeFlow consumers must be idempotent. We use a Postgres-backed de-dup table to
ensure each event is processed once per consumer.

## Storage

- Table: `ProcessedEvent`
- Unique key: `(eventId, consumer)`

This table lives in the Postgres schema managed by Prisma.

## Usage (NestJS)

```ts
import { IdempotencyService } from '@freeflow/messaging-idempotency';

const consumer = 'alarm-service';
const registered = await idempotency.register({ eventId, consumer });

if (!registered) {
  // duplicate, safe to ack and exit
}

try {
  // process message
} catch (error) {
  // release so it can be retried
  await idempotency.release({ eventId, consumer });
  throw error;
}
```

## Notes

- Register **before** processing to prevent concurrent duplicates.
- Release on failure to allow retries.
- Keep the original `eventId` when re-publishing to retry queues.
