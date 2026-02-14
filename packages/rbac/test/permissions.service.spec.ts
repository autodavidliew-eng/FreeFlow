import { writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { clearPermissionsCache } from '../src/permissions-loader';
import { PermissionsService } from '../src/permissions.service';

describe('PermissionsService', () => {
  const tempDir = os.tmpdir();
  let tempFile = '';

  beforeEach(async () => {
    tempFile = path.join(tempDir, `permissions-${Date.now()}.json`);
    const payload = {
      roles: {
        Admin: { permissions: ['documents:*'] },
        Viewer: { permissions: ['documents:read'] },
      },
    };

    await writeFile(tempFile, JSON.stringify(payload), 'utf-8');
    process.env.FREEFLOW_PERMISSIONS_PATH = tempFile;
    clearPermissionsCache();
  });

  afterEach(async () => {
    delete process.env.FREEFLOW_PERMISSIONS_PATH;
    clearPermissionsCache();
    if (tempFile) {
      await unlink(tempFile);
    }
  });

  it('matches explicit permissions', async () => {
    const service = new PermissionsService();
    await expect(
      service.hasPermission(['Viewer'], ['documents:read']),
    ).resolves.toBe(true);
  });

  it('matches wildcard permissions', async () => {
    const service = new PermissionsService();
    await expect(
      service.hasPermission(['Admin'], ['documents:delete']),
    ).resolves.toBe(true);
  });

  it('rejects missing permissions', async () => {
    const service = new PermissionsService();
    await expect(
      service.hasPermission(['Viewer'], ['documents:delete']),
    ).resolves.toBe(false);
  });
});
