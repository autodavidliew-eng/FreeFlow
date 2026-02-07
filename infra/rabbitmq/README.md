# FreeFlow RabbitMQ Topology

Pre-configured RabbitMQ topology with Dead Letter Exchange (DLX) and Dead Letter Queue (DLQ) for FreeFlow development.

## Overview

This configuration provides a complete RabbitMQ topology with:

- **Main Topic Exchange**: `freeflow.events` - Central event bus
- **Dead Letter Exchange**: `freeflow.events.dlx` - Handles failed messages
- **Dead Letter Queue**: `freeflow.events.dlq` - Stores undeliverable messages
- **Domain Queues**: Pre-configured queues for different domains
- **Automatic DLX Routing**: Failed messages automatically route to DLQ

## Topology Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    freeflow.events (topic)                  │
│                  Main Event Exchange                        │
└───────┬─────────┬─────────┬──────────┬─────────┬──────────┘
        │         │         │          │         │
        │ user.*  │doc.*   │workflow.*│notif.*  │ # (all)
        ▼         ▼         ▼          ▼         ▼
    ┌───────┐ ┌────────┐ ┌──────┐ ┌────────┐ ┌──────┐
    │users  │ │documents│ │workflow│ │notif.  │ │audit │
    │queue  │ │ queue  │ │ queue │ │ queue  │ │queue │
    └───┬───┘ └────┬───┘ └───┬──┘ └────┬───┘ └───┬──┘
        │          │         │          │         │
        │  (on failure / reject / TTL / max-length)
        │          │         │          │         │
        └──────────┴─────────┴──────────┴─────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ freeflow.events.dlx    │
              │  (Dead Letter Exchange)│
              └────────────┬───────────┘
                           │ dlq
                           ▼
                  ┌────────────────┐
                  │ freeflow.events│
                  │     .dlq       │
                  │ (Dead Letter   │
                  │     Queue)     │
                  └────────────────┘
```

## Topology Components

### Exchanges

| Exchange | Type | Purpose | Durable |
|----------|------|---------|---------|
| `freeflow.events` | topic | Main event distribution | ✅ |
| `freeflow.events.dlx` | direct | Dead letter handling | ✅ |

### Queues

| Queue | Routing Keys | DLX Enabled | Purpose |
|-------|--------------|-------------|---------|
| `freeflow.users.queue` | `user.*`, `auth.*` | ✅ | User & auth events |
| `freeflow.documents.queue` | `document.*` | ✅ | Document events |
| `freeflow.workflows.queue` | `workflow.*` | ✅ | Workflow events |
| `freeflow.notifications.queue` | `notification.*` | ✅ | Notification events |
| `freeflow.audit.queue` | `#` (all) | ✅ | Audit trail (all events) |
| `freeflow.events.dlq` | `dlq` | ❌ | Dead letter storage |

### Policies

| Policy | Pattern | Purpose |
|--------|---------|---------|
| `ha-all` | `.*` | High availability (all queues) |
| `dlx-policy` | `^freeflow\\..*\\.queue$` | Auto-configure DLX on queues |

## Installation & Import

### Method 1: Automatic Import (Docker Compose)

Update `infra/compose/docker-compose.yml`:

```yaml
rabbitmq:
  volumes:
    - ../../rabbitmq/definitions.json:/etc/rabbitmq/definitions.json:ro
  environment:
    RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS: -rabbitmq_management load_definitions "/etc/rabbitmq/definitions.json"
```

Then restart RabbitMQ:

```bash
cd infra/compose
docker compose restart rabbitmq
docker compose logs -f rabbitmq
```

### Method 2: Manual Import via Management UI

1. **Access Management UI**:
   ```bash
   open http://localhost:15672
   # Login: freeflow / freeflow_dev_password
   ```

2. **Import Definitions**:
   - Go to **Overview** tab
   - Scroll to **Import definitions**
   - Click **Choose File** → Select `definitions.json`
   - Click **Upload broker definitions**

### Method 3: Import via API

```bash
# Copy definitions to container
docker compose cp ../../rabbitmq/definitions.json rabbitmq:/tmp/definitions.json

# Import using management API
docker compose exec rabbitmq rabbitmqadmin import /tmp/definitions.json
```

### Method 4: Using rabbitmqadmin CLI

```bash
# Install rabbitmqadmin
curl -O http://localhost:15672/cli/rabbitmqadmin
chmod +x rabbitmqadmin
sudo mv rabbitmqadmin /usr/local/bin/

# Import definitions
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  import definitions.json
```

## Manual Creation (Alternative to Import)

If you prefer to create the topology manually:

### Create Exchanges

```bash
# Main topic exchange
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare exchange name=freeflow.events type=topic durable=true

# Dead letter exchange
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare exchange name=freeflow.events.dlx type=direct durable=true
```

### Create Dead Letter Queue

```bash
# DLQ (no DLX on this queue to prevent infinite loops)
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare queue name=freeflow.events.dlq durable=true \
  arguments='{"x-message-ttl":604800000,"x-max-length":100000}'
```

### Create Domain Queues with DLX

```bash
# Users queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare queue name=freeflow.users.queue durable=true \
  arguments='{"x-dead-letter-exchange":"freeflow.events.dlx","x-dead-letter-routing-key":"dlq"}'

# Documents queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare queue name=freeflow.documents.queue durable=true \
  arguments='{"x-dead-letter-exchange":"freeflow.events.dlx","x-dead-letter-routing-key":"dlq"}'

# Workflows queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare queue name=freeflow.workflows.queue durable=true \
  arguments='{"x-dead-letter-exchange":"freeflow.events.dlx","x-dead-letter-routing-key":"dlq"}'

# Notifications queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare queue name=freeflow.notifications.queue durable=true \
  arguments='{"x-dead-letter-exchange":"freeflow.events.dlx","x-dead-letter-routing-key":"dlq"}'

# Audit queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare queue name=freeflow.audit.queue durable=true \
  arguments='{"x-dead-letter-exchange":"freeflow.events.dlx","x-dead-letter-routing-key":"dlq"}'
```

### Create Bindings

```bash
# Bind DLQ to DLX
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare binding source=freeflow.events.dlx destination=freeflow.events.dlq \
  routing_key=dlq

# Bind users queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare binding source=freeflow.events destination=freeflow.users.queue \
  routing_key="user.*"

rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare binding source=freeflow.events destination=freeflow.users.queue \
  routing_key="auth.*"

# Bind documents queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare binding source=freeflow.events destination=freeflow.documents.queue \
  routing_key="document.*"

# Bind workflows queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare binding source=freeflow.events destination=freeflow.workflows.queue \
  routing_key="workflow.*"

# Bind notifications queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare binding source=freeflow.events destination=freeflow.notifications.queue \
  routing_key="notification.*"

# Bind audit queue (receives ALL events)
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  declare binding source=freeflow.events destination=freeflow.audit.queue \
  routing_key="#"
```

## How Dead Letter Exchange (DLX) Works

Messages are sent to the DLX when:

1. **Message is rejected** with `requeue=false`
2. **Message TTL expires** (24 hours by default)
3. **Queue length limit is exceeded** (10,000 messages by default)
4. **Consumer explicitly rejects** the message

### DLX Configuration

Each queue has these arguments:

```json
{
  "x-dead-letter-exchange": "freeflow.events.dlx",
  "x-dead-letter-routing-key": "dlq"
}
```

When a message is dead-lettered:
1. Original headers are preserved in `x-death` header
2. Message is republished to `freeflow.events.dlx`
3. DLX routes to `freeflow.events.dlq` with routing key `dlq`
4. Message sits in DLQ for manual inspection/reprocessing

### DLQ Configuration

The DLQ has:
- **TTL**: 7 days (604800000ms) - messages auto-expire after a week
- **Max Length**: 100,000 messages - oldest messages are dropped
- **No DLX**: Prevents infinite loops

## Verification

### Via Management UI

```bash
open http://localhost:15672
```

Navigate to:
- **Exchanges** → Verify `freeflow.events` and `freeflow.events.dlx` exist
- **Queues** → Verify all queues exist and show DLX in arguments
- **Admin** → **Policies** → Verify `dlx-policy` is applied

### Via rabbitmqadmin

```bash
# List exchanges
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow list exchanges

# List queues
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow list queues

# List bindings
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow list bindings

# Check specific queue details
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  show queue name=freeflow.users.queue
```

### Via API

```bash
# List exchanges
curl -u freeflow:freeflow_dev_password http://localhost:15672/api/exchanges/%2Ffreeflow | jq

# List queues
curl -u freeflow:freeflow_dev_password http://localhost:15672/api/queues/%2Ffreeflow | jq

# Check specific queue
curl -u freeflow:freeflow_dev_password \
  http://localhost:15672/api/queues/%2Ffreeflow/freeflow.events.dlq | jq
```

## Testing the Topology

### Test 1: Publish and Consume

```bash
# Publish a user event
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=user.created \
  payload='{"userId":"123","email":"test@example.com"}'

# Check if message arrived in users queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  get queue=freeflow.users.queue count=1

# Publish a document event
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=document.uploaded \
  payload='{"documentId":"doc-456","title":"Test Doc"}'

# Check documents queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  get queue=freeflow.documents.queue count=1
```

### Test 2: Dead Letter Routing

```bash
# Publish a message that will be rejected
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=user.test \
  payload='{"test":"dlx"}' properties='{"expiration":"1000"}'

# Wait 2 seconds for TTL expiration
sleep 2

# Check if message moved to DLQ
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  get queue=freeflow.events.dlq count=1
```

### Test 3: Verify Audit Queue Receives All

```bash
# Publish various events
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=user.login payload='{"user":"123"}'

rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=document.viewed payload='{"doc":"456"}'

rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=workflow.started payload='{"workflow":"789"}'

# Check audit queue (should have all 3 messages due to '#' binding)
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  list queues name messages | grep audit
```

## Application Integration

### NestJS Example

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://freeflow:freeflow_dev_password@localhost:5672/freeflow'],
          queue: 'freeflow.users.queue',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'freeflow.events.dlx',
              'x-dead-letter-routing-key': 'dlq',
            },
          },
        },
      },
    ]),
  ],
})
export class AppModule {}

// publisher.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EventPublisher {
  constructor(
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
  ) {}

  async publishUserEvent(event: string, data: any) {
    return this.client.emit(`user.${event}`, data).toPromise();
  }

  async publishDocumentEvent(event: string, data: any) {
    return this.client.emit(`document.${event}`, data).toPromise();
  }
}

// consumer.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class EventConsumer {
  @EventPattern('user.*')
  async handleUserEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Process message
      console.log('Received user event:', data);

      // Acknowledge message
      channel.ack(originalMsg);
    } catch (error) {
      console.error('Error processing message:', error);

      // Reject and send to DLX
      channel.reject(originalMsg, false);
    }
  }
}
```

### Node.js (amqplib) Example

```javascript
const amqp = require('amqplib');

async function publishEvent() {
  const connection = await amqp.connect(
    'amqp://freeflow:freeflow_dev_password@localhost:5672/freeflow'
  );
  const channel = await connection.createChannel();

  // Publish to topic exchange
  await channel.publish(
    'freeflow.events',
    'user.created',
    Buffer.from(JSON.stringify({ userId: '123', email: 'test@example.com' })),
    {
      persistent: true,
      contentType: 'application/json',
    }
  );

  console.log('Event published');
  await channel.close();
  await connection.close();
}

async function consumeEvents() {
  const connection = await amqp.connect(
    'amqp://freeflow:freeflow_dev_password@localhost:5672/freeflow'
  );
  const channel = await connection.createChannel();

  await channel.consume('freeflow.users.queue', (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log('Received:', data);

        // Process message
        // ...

        // Acknowledge
        channel.ack(msg);
      } catch (error) {
        console.error('Error:', error);

        // Reject and send to DLX
        channel.reject(msg, false);
      }
    }
  });
}
```

## Routing Key Patterns

Use these routing key patterns when publishing events:

| Pattern | Example | Queues |
|---------|---------|--------|
| `user.*` | `user.created`, `user.updated`, `user.deleted` | users, audit |
| `auth.*` | `auth.login`, `auth.logout`, `auth.failed` | users, audit |
| `document.*` | `document.uploaded`, `document.viewed` | documents, audit |
| `workflow.*` | `workflow.started`, `workflow.completed` | workflows, audit |
| `notification.*` | `notification.sent`, `notification.failed` | notifications, audit |

The audit queue receives **ALL** events due to `#` wildcard binding.

## Monitoring & Management

### Check Queue Depths

```bash
# Via rabbitmqadmin
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  list queues name messages messages_ready messages_unacknowledged

# Via API
curl -u freeflow:freeflow_dev_password \
  http://localhost:15672/api/queues/%2Ffreeflow | jq '.[] | {name, messages}'
```

### Monitor DLQ

```bash
# Check DLQ depth
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  show queue name=freeflow.events.dlq

# Get messages from DLQ (without removing)
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  get queue=freeflow.events.dlq count=10 ackmode=reject_requeue_false
```

### Inspect Dead-Lettered Messages

When you retrieve a message from the DLQ, check the `x-death` header:

```bash
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  get queue=freeflow.events.dlq count=1 ackmode=reject_requeue_false
```

The `x-death` header contains:
- `queue`: Original queue name
- `reason`: Why it was dead-lettered (rejected, expired, maxlen)
- `count`: How many times it was dead-lettered
- `exchange`: Original exchange
- `routing-keys`: Original routing keys
- `time`: When it was dead-lettered

## Reprocessing Dead-Lettered Messages

### Option 1: Move Back to Original Queue

```bash
# Get message from DLQ
MESSAGE=$(rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  get queue=freeflow.events.dlq count=1 ackmode=ack_requeue_false)

# Republish to original exchange
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=user.created \
  payload="$MESSAGE"
```

### Option 2: Shovel Plugin

Configure a shovel to automatically move messages:

```bash
rabbitmqctl set_parameter shovel dlq-reprocess \
  '{"src-uri":"amqp://freeflow:freeflow_dev_password@localhost:5672/%2Ffreeflow","src-queue":"freeflow.events.dlq","dest-uri":"amqp://freeflow:freeflow_dev_password@localhost:5672/%2Ffreeflow","dest-exchange":"freeflow.events"}'
```

## Backup and Export

### Export Current Definitions

```bash
# Export via API
curl -u freeflow:freeflow_dev_password \
  http://localhost:15672/api/definitions/%2Ffreeflow > backup.json

# Export via rabbitmqadmin
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  export backup.json
```

### Import Definitions

```bash
# Import via API
curl -u freeflow:freeflow_dev_password -H "Content-Type: application/json" \
  -X POST --data @backup.json \
  http://localhost:15672/api/definitions/%2Ffreeflow

# Import via rabbitmqadmin
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  import backup.json
```

## Troubleshooting

### Topology Not Loading

**Problem**: Definitions don't import automatically.

**Solution**: Check RabbitMQ logs and ensure the file is mounted correctly.

```bash
docker compose logs rabbitmq | grep -i definition
docker compose exec rabbitmq ls -la /etc/rabbitmq/definitions.json
```

### Messages Not Reaching Queue

**Problem**: Published messages don't appear in queues.

**Solution**: Check routing key matches binding pattern.

```bash
# Verify bindings
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  list bindings source destination routing_key | grep freeflow.events
```

### DLX Not Working

**Problem**: Messages aren't going to DLQ when rejected.

**Solution**: Verify queue has DLX arguments.

```bash
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  show queue name=freeflow.users.queue | grep -i "x-dead"
```

### DLQ Filling Up

**Problem**: DLQ has too many messages.

**Solution**: Investigate why messages are being rejected.

1. Check consumer logs for errors
2. Inspect messages in DLQ for patterns
3. Fix consumer code
4. Purge or reprocess DLQ messages

```bash
# Purge DLQ (⚠️ destructive)
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  purge queue name=freeflow.events.dlq
```

## Production Considerations

⚠️ **This topology is optimized for development**. For production:

1. **Enable TLS**: Use secure connections
2. **Adjust TTL**: Tune message and DLQ TTL based on requirements
3. **Set Resource Limits**: Configure max-length and memory limits
4. **Enable Clustering**: Use multiple RabbitMQ nodes
5. **Monitor Metrics**: Set up alerts for queue depths
6. **Implement Retry Logic**: Add retry queues with delayed redelivery
7. **Use Quorum Queues**: For better data safety (requires RabbitMQ 3.8+)
8. **Tune Prefetch**: Set appropriate QoS prefetch count
9. **Regular Backups**: Export definitions regularly
10. **Secure Credentials**: Don't use default passwords

## References

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Dead Letter Exchanges](https://www.rabbitmq.com/dlx.html)
- [Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
- [Management HTTP API](https://www.rabbitmq.com/management.html)

## Quick Reference

```bash
# Access Management UI
open http://localhost:15672

# List topology
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow list exchanges
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow list queues
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow list bindings

# Publish test event
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=user.test payload='{"test":true}'

# Get message from queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  get queue=freeflow.users.queue count=1

# Check DLQ
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  show queue name=freeflow.events.dlq

# Export definitions
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow export backup.json

# Import definitions
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow import definitions.json
```
