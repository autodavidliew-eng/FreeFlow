import { expect, test } from '@playwright/test';

test.describe('Auth smoke', () => {
  test('login page renders the Keycloak CTA', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    const cta = page.getByRole('link', { name: /continue to keycloak/i });
    await expect(cta).toHaveAttribute('href', '/auth/login/start');
  });

  test('callback reports missing code', async ({ page }) => {
    await page.goto('/auth/callback');

    await expect(page.getByText('Missing authorization code.')).toBeVisible();
  });
});
