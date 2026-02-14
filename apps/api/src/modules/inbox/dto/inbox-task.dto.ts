export type InboxTaskDto = {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueAt?: string;
  createdAt: string;
};

export type InboxTasksResponseDto = {
  items: InboxTaskDto[];
  total: number;
};
