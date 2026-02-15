import { expect, test } from '@playwright/test';

test('portal shell navigation and menu toggle', async ({ page }) => {
  await page.goto('/applications');

  const sideNav = page.getByTestId('side-nav');
  await expect(sideNav).toBeVisible();

  const toggle = page.getByTestId('topbar-menu');
  await toggle.click();
  await expect(sideNav).toHaveClass(/is-collapsed/);

  await toggle.click();
  await expect(sideNav).not.toHaveClass(/is-collapsed/);

  await page.getByRole('link', { name: 'Alarm / Alert' }).click();
  await expect(page).toHaveURL(/\/alarms/);
});
