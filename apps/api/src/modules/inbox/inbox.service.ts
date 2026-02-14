import { Injectable } from '@nestjs/common';
import type { InboxTasksResponseDto } from './dto/inbox-task.dto';

@Injectable()
export class InboxService {
  getTasks(): InboxTasksResponseDto {
    const items = [
      {
        id: 'task_001',
        title: 'Review incident report #1452',
        status: 'open',
        priority: 'high',
        dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'task_002',
        title: 'Approve maintenance window',
        status: 'in-progress',
        priority: 'medium',
        dueAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: 'task_003',
        title: 'Acknowledge safety checklist update',
        status: 'done',
        priority: 'low',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return {
      items,
      total: items.length,
    };
  }
}
