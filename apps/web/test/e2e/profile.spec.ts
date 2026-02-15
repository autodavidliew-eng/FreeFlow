import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import type { SessionData } from '../../src/lib/auth/session';
import { signValue } from '../../src/lib/auth/signing';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const sessionSecret = resolveSessionSecret();

test.describe('Profile page', () => {
  test.skip(!sessionSecret, 'SESSION_SECRET not available for signing cookie');

  test('loads account details', async ({ page }) => {
    await setSessionCookie(page, ['Viewer']);
    await page.goto('/profile');

    await expect(page.getByText('Account Details')).toBeVisible();
  });
});

async function setSessionCookie(page: Page, roles: string[]) {
  if (!sessionSecret) {
    throw new Error('Missing SESSION_SECRET for cookie signing.');
  }

  const session: SessionData = {
    accessToken: 'test-token',
    roles,
  };

  const value = signValue(JSON.stringify(session), sessionSecret);
  await page.context().addCookies([
    {
      name: 'ff_session',
      value,
      url: baseURL,
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
    },
  ]);
}

function resolveSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  const envPath = path.resolve(__dirname, '..', '..', '.env.local');
  if (!existsSync(envPath)) {
    return null;
  }

  const contents = readFileSync(envPath, 'utf-8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const [key, ...rest] = trimmed.split('=');
    if (key === 'SESSION_SECRET') {
      return rest.join('=').trim();
    }
  }

  return null;
}
