import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import type { SessionData } from '../../src/lib/auth/session';
import { signValue } from '../../src/lib/auth/signing';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const sessionSecret = resolveSessionSecret();

test.describe('Applications', () => {
  test.skip(!sessionSecret, 'SESSION_SECRET not available for signing cookie');

  test('clicking an app triggers handoff request', async ({ page }) => {
    await setSessionCookie(page, ['Admin']);
    await page.addInitScript(() => {
      window.open = () => null;
    });

    await page.route('**/api/addons/apps', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              appKey: 'report',
              name: 'Report',
              icon: 'file-text',
              launchUrl: '/apps/report',
              integrationMode: 'embedded',
              enabled: true,
            },
          ],
          total: 1,
        }),
      })
    );

    await page.route('**/api/addons/handoff', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          appKey: 'report',
          status: 'allowed',
          launchUrl: 'https://addons.freeflow.dev/report',
          integrationMode: 'external',
          token: 'test-token',
          expiresAt: '2026-02-15T12:00:00.000Z',
          expiresIn: 120,
        }),
      })
    );

    const handoffRequest = page.waitForRequest('**/api/addons/handoff');

    await page.goto('/applications');
    await expect(page.getByText('Report')).toBeVisible();
    await expect(page.getByText('Rule Engine')).not.toBeVisible();
    await page.getByRole('button', { name: /report/i }).click();

    const request = await handoffRequest;
    expect(request.method()).toBe('POST');
    expect(request.postDataJSON()).toMatchObject({
      appKey: 'report',
    });
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
