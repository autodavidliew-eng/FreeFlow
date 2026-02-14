import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'freeflow.permissions';

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
