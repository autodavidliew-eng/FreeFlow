# Event Contracts

This folder defines the JSON Schemas for FreeFlow asynchronous events. All services
must publish events that conform to these schemas.

## Naming & Versioning

- Event type format: `domain.action` (lowercase, dot-separated).
- `version` is an integer that increments on breaking changes.
- Non-breaking changes can be applied without a version bump (additive fields).

## Envelope

All events use a common envelope (see `schemas/event-base.json`).
Required fields:

- `eventId`: UUID for the event.
- `type`: event type string (e.g., `alarm.raised`).
- `version`: schema version.
- `occurredAt`: ISO-8601 timestamp.
- `correlationId`: UUID that ties a workflow across services.
- `idempotencyKey`: stable string used to deduplicate consumers.
- `source`: emitting service name (e.g., `alarm-service`).
- `data`: event-specific payload.

Optional fields:

- `subject`: `{ type, id }` describing the primary entity.
- `actor`: `{ id, type, email }` describing the user/system that triggered the event.

## Schemas

- `schemas/alarm.raised.v1.json`
- `schemas/alarm.acknowledged.v1.json`
- `schemas/task.created.v1.json`
- `schemas/task.completed.v1.json`

## Example

```json
{
  "eventId": "8d9b8234-2f7a-4f52-88f3-0e3a3d4a2a7c",
  "type": "alarm.raised",
  "version": 1,
  "occurredAt": "2026-02-14T18:05:00.000Z",
  "correlationId": "7c1d6b4a-6b63-4f3f-9f3d-0b5f2c0a5b78",
  "idempotencyKey": "alarm.raised:alarm-123",
  "source": "alarm-service",
  "subject": { "type": "alarm", "id": "alarm-123" },
  "actor": { "id": "user-admin", "type": "user", "email": "admin@freeflow.dev" },
  "data": {
    "alarmId": "alarm-123",
    "severity": "high",
    "message": "Temperature exceeded threshold",
    "assetId": "asset-77"
  }
}
```
