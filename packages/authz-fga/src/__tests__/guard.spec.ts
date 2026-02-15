import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { checkAccess } from '../client';
import { FGA_REQUIRE_KEY } from '../decorators/require-fga.decorator';
import { FgaGuard } from '../guards/fga.guard';

jest.mock('../client', () => ({
  checkAccess: jest.fn(),
}));

describe('FgaGuard', () => {
  const reflector = new Reflector();
  const guard = new FgaGuard(reflector);

  const makeContext = (request: Record<string, unknown>) => {
    const handler = () => undefined;
    Reflect.defineMetadata(
      FGA_REQUIRE_KEY,
      {
        objectType: 'app',
        objectId: 'body.appKey',
        relation: 'launch',
      },
      handler
    );

    return {
      getHandler: () => handler,
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    (checkAccess as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows when OpenFGA check passes', async () => {
    (checkAccess as jest.Mock).mockResolvedValueOnce(true);

    const context = makeContext({
      user: { sub: 'admin' },
      body: { appKey: 'rule-engine' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('denies when OpenFGA check fails', async () => {
    (checkAccess as jest.Mock).mockResolvedValueOnce(false);

    const context = makeContext({
      user: { sub: 'viewer' },
      body: { appKey: 'rule-engine' },
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });
});
