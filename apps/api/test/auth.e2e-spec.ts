import { INestApplication, type CanActivate } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard, type AuthenticatedUser } from '@freeflow/auth';
import { PermissionGuard } from '@freeflow/rbac';
import { AppModule } from '../src/app.module';

describe('Auth-protected endpoints (e2e)', () => {
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

  beforeEach(async () => {
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
      .overrideGuard(PermissionGuard)
      .useValue({
        canActivate: () => true,
      } satisfies CanActivate)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/me (GET) returns the current user profile', async () => {
    await request(app.getHttpServer())
      .get('/me')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: 'user-123',
          email: 'viewer@freeflow.dev',
          name: 'Viewer One',
          roles: ['Viewer'],
          freeflowRoles: ['Viewer'],
        });
      });
  });

  it('/dashboard/layout (GET) returns a layout payload', async () => {
    await request(app.getHttpServer())
      .get('/dashboard/layout')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('version', 1);
        expect(Array.isArray(res.body.sections)).toBe(true);
      });
  });
});
