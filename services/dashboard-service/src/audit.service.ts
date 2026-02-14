import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '@freeflow/db-mongo';

@Injectable()
export class AuditService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async logLayoutAccess(userId: string) {
    await this.auditLogRepository.create({
      action: 'dashboard.layout.view',
      userId,
      resourceType: 'dashboard',
      resourceId: 'default',
      metadata: { source: 'dashboard-service' },
    });
  }
}
