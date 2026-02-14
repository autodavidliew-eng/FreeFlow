import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../src/guards/jwt.guard';
import { verifyAccessToken } from '../src/jwks';

jest.mock('../src/jwks', () => ({
  verifyAccessToken: jest.fn(),
}));

const mockVerifyAccessToken = verifyAccessToken as jest.MockedFunction<
  typeof verifyAccessToken
>;

type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  user?: unknown;
};

function createContext(request: RequestLike): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  beforeEach(() => {
    mockVerifyAccessToken.mockReset();
  });

  it('rejects requests without a bearer token', async () => {
    const guard = new JwtAuthGuard();
    const request: RequestLike = { headers: {} };
    const context = createContext(request);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches user details when token is valid', async () => {
    const guard = new JwtAuthGuard();
    const request: RequestLike = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const context = createContext(request);

    mockVerifyAccessToken.mockResolvedValue({
      payload: {
        sub: 'user-123',
        email: 'operator@freeflow.dev',
        name: 'Operator One',
      },
      roles: ['Operator'],
      freeflowRoles: ['Operator'],
    } as any);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(request.user).toEqual(
      expect.objectContaining({
        sub: 'user-123',
        email: 'operator@freeflow.dev',
        roles: ['Operator'],
        freeflowRoles: ['Operator'],
      }),
    );
  });
});
