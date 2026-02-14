import {
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../types';

type UserField = keyof AuthenticatedUser;

export const CurrentUser = createParamDecorator(
  (data: UserField | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();

    if (!request.user) {
      return undefined;
    }

    if (!data) {
      return request.user;
    }

    return request.user[data];
  },
);
