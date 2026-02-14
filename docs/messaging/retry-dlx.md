# RabbitMQ Retry Topology (TTL + DLX)

This document describes the retry topology for FreeFlow events. It uses TTL-based
retry queues that dead-letter back to the main exchange after a delay.

## Summary

- Main exchange: `freeflow.events` (topic)
- Retry exchange: `freeflow.events.retry` (direct)
- DLX: `freeflow.events.dlx` → `freeflow.events.dlq`

Consumers publish failed messages to the retry exchange using a delay routing key.
After the delay, the message is dead-lettered back to the main exchange and reprocessed.

## Delay Queues

Each domain has 3 delay tiers:

- `30s` → 30 seconds
- `5m` → 5 minutes
- `30m` → 30 minutes

Queue naming:

- `freeflow.<domain>.retry.30s`
- `freeflow.<domain>.retry.5m`
- `freeflow.<domain>.retry.30m`

Supported domains:

- `user`
- `auth`
- `alarm`
- `document`
- `workflow`
- `notification`
- `audit`

Each retry queue has:

- `x-message-ttl` set to the delay
- `x-dead-letter-exchange = freeflow.events`
- `x-dead-letter-routing-key = <domain>.retry`

This routing key matches the existing `domain.*` bindings on the main exchange,
so the message returns to the appropriate domain queue.

## Publishing a Retry

When a consumer wants to retry a message, it should publish the original payload
back to `freeflow.events.retry` with the routing key matching the desired delay:

- Example: `user.30s` or `document.5m`

Recommended headers:

- `x-retry-count`: incremented counter
- `x-original-routing-key`: the original routing key
- `x-original-exchange`: `freeflow.events`

## Retry Flow

1. Consumer fails to process a message.
2. Consumer publishes message to `freeflow.events.retry` using a delay key.
3. Message sits in retry queue until TTL expires.
4. RabbitMQ dead-letters message to `freeflow.events` with routing key `<domain>.retry`.
5. Message is reconsumed by the domain queue.
6. If it fails again, repeat or send to DLQ.

## Sending to DLQ

If a message exceeds the retry policy or is non-recoverable:

- Reject the message with `requeue=false` to send it to `freeflow.events.dlq`.

The DLQ is the final holding area for manual inspection.

## Example Routing Keys

- User/auth: `user.30s`, `auth.5m`
- Documents: `document.30m`
- Workflow: `workflow.5m`
- Notifications: `notification.30s`

## Notes

- The retry queues are **not** bound to the main exchange.
- The retry exchange is **direct** to avoid wildcard ambiguity.
- The main exchange bindings already match `<domain>.retry` via `domain.*`.
