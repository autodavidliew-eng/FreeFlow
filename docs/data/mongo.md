# MongoDB Data Layer (Mongoose)

## Overview

This package provides the shared MongoDB integration for FreeFlow using Mongoose.
It includes example models for audit logs and alarm history.

## Package

- `packages/db-mongo`

## Connection

Set `MONGODB_URI` in your service `.env.local` file. For the local docker-compose
stack, the default is:

```bash
MONGODB_URI=mongodb://freeflow:freeflow_dev_password@localhost:27017/freeflow?authSource=admin
```

## Usage

```ts
import { Module } from '@nestjs/common';
import { MongoDatabaseModule, MongoModelsModule } from '@freeflow/db-mongo';

@Module({
  imports: [
    MongoDatabaseModule.forRoot(),
    MongoModelsModule,
  ],
})
export class AppModule {}
```

## Repositories

- `AuditLogRepository` for audit trail entries
- `AlarmHistoryRepository` for alarm timeline events

## Notes

- MongoDB is stateful; use StatefulSets or managed services for production.
- Replace example models with domain-specific schemas as needed.
