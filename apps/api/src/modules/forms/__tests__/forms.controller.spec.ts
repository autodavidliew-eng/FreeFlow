import { JwtAuthGuard } from '@freeflow/auth';
import type { AuthenticatedUser } from '@freeflow/auth';
import { checkAccess } from '@freeflow/authz-fga';
import type { CanActivate, INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Response as SupertestResponse } from 'supertest';

import { AppModule } from '../../../app.module';

jest.mock('@freeflow/authz-fga', () => {
  const actual = jest.requireActual('@freeflow/authz-fga');
  return {
    ...actual,
    checkAccess: jest.fn(),
  };
});

describe('FormsController (integration)', () => {
  let app: INestApplication;
  const mockUser: AuthenticatedUser = {
    sub: 'user-123',
    email: 'viewer@freeflow.dev',
    name: 'Viewer One',
    roles: ['Viewer'],
    freeflowRoles: ['Viewer'],
    token: 'mock-token',
    claims: {
      sub: 'user-123',
      iss: 'http://localhost:8080/realms/freeflow',
      aud: 'freeflow-web',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      email: 'viewer@freeflow.dev',
    },
  };

  const checkAccessMock = jest.mocked(checkAccess);
  const originalFetch = global.fetch;

  beforeEach(async () => {
    process.env.FORMIO_BASE_URL = 'https://formio.local/project';
    checkAccessMock.mockResolvedValue(true);
    global.fetch = jest.fn() as unknown as typeof fetch;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      } satisfies CanActivate)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    delete process.env.FORMIO_BASE_URL;
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('GET /forms/:formId/schema proxies Form.io schema', async () => {
    const fetchMock = jest.mocked(global.fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ title: 'Inspection Form' }),
    } as Response);

    await request(app.getHttpServer())
      .get('/forms/inspection/schema')
      .expect(200)
      .expect((res: SupertestResponse) => {
        expect(res.body).toMatchObject({ title: 'Inspection Form' });
      });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://formio.local/project/inspection',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          Accept: 'application/json',
        }),
      })
    );
  });

  it('returns 403 when OpenFGA denies submit access', async () => {
    checkAccessMock.mockResolvedValue(false);

    await request(app.getHttpServer())
      .post('/forms/inspection/submissions')
      .send({ data: { status: 'ok' } })
      .expect(403);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
