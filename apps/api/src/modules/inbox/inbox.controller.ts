import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@freeflow/auth';
import { PermissionGuard, RequirePermission } from '@freeflow/rbac';
import type { InboxTasksResponseDto } from './dto/inbox-task.dto';
import { InboxService } from './inbox.service';

@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('notifications:read')
  @Get('tasks')
  getTasks(): InboxTasksResponseDto {
    return this.inboxService.getTasks();
  }
}
