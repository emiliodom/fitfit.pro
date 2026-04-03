import { test, expect } from '@playwright/test';

test.describe('mobile app feel', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('bottom nav and language toggle are accessible', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav.navbar');
    await expect(nav).toBeVisible();

    const navPosition = await nav.evaluate(el => getComputedStyle(el).position);
    const navBottom = await nav.evaluate(el => getComputedStyle(el).bottom);
    expect(navPosition).toBe('fixed');
    expect(navBottom).toBe('0px');

    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');

    const langToggle = page.locator('.lang-toggle');
    await expect(langToggle).toBeVisible();
    await langToggle.click();

    await expect(page.getByRole('button', { name: /Entrenamiento|Training/ })).toBeVisible();
  });

  test('tabs switch on mobile', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Running/i }).click();
    await expect(
      page.getByRole('heading', { name: /Running Lab|Laboratorio de Running/i })
    ).toBeVisible();

    await page.getByRole('button', { name: /Cataleya/i }).click();
    await expect(
      page.getByRole('heading', { name: /Cataleya/i })
    ).toBeVisible();
  });

  test('horizontal tables are scrollable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Nutrition|Nutricion|Nutrición/i }).click();

    const tableScroll = page.locator('.table-scroll');
    await expect(tableScroll.first()).toBeVisible();

    const scrollable = await tableScroll.first().evaluate(el => el.scrollWidth > el.clientWidth);
    expect(scrollable).toBeTruthy();
  });
});
