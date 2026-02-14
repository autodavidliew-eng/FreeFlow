import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AlarmHistory,
  AlarmHistorySchema,
} from './models/alarm-history.schema';
import { AuditLog, AuditLogSchema } from './models/audit-log.schema';
import { AlarmHistoryRepository } from './repositories/alarm-history.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: AlarmHistory.name, schema: AlarmHistorySchema },
    ]),
  ],
  providers: [AuditLogRepository, AlarmHistoryRepository],
  exports: [AuditLogRepository, AlarmHistoryRepository],
})
export class MongoModelsModule {}
