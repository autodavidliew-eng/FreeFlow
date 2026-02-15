import type { AuthenticatedUser } from '@freeflow/auth';
import { checkAccess } from '@freeflow/authz-fga';

import { AlarmsService } from '../alarms.service';

jest.mock('@freeflow/authz-fga', () => ({
  checkAccess: jest.fn(),
}));

describe('AlarmsService', () => {
  const user: AuthenticatedUser = {
    sub: 'user-123',
    roles: ['Viewer'],
    freeflowRoles: ['Viewer'],
    token: 'token',
    claims: {
      sub: 'user-123',
      iss: 'http://localhost:8080/realms/freeflow',
      aud: 'freeflow-api',
      exp: 0,
      iat: 0,
      email: 'viewer@freeflow.dev',
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('filters alarms by OpenFGA site access', async () => {
    const checkMock = jest.mocked(checkAccess);
    checkMock.mockImplementation(
      async ({ object }) => object === 'site:site-a'
    );

    const service = new AlarmsService();
    const result = await service.getAlarms(user);

    expect(result.items.every((item) => item.siteId === 'site-a')).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
    expect(checkMock).toHaveBeenCalledWith({
      user: `user:${user.sub}`,
      relation: 'view',
      object: 'site:site-a',
    });
    expect(checkMock).toHaveBeenCalledWith({
      user: `user:${user.sub}`,
      relation: 'view',
      object: 'site:site-b',
    });
  });
});
