import { test, expect } from '@playwright/test';

test.describe('Results Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="your@email.com"]', 'dev@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Login")');
    await page.waitForURL('/');
  });

  test('user should be able to search results', async ({ page }) => {
    await page.goto('/results/10000000-0000-0000-0000-000000000001');
    await expect(page.locator('text=Extraction Results')).toBeVisible();

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');

    await page.waitForTimeout(500);
    const results = page.locator('[class*="CodeItemCard"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('user should be able to filter by type', async ({ page }) => {
    await page.goto('/results/10000000-0000-0000-0000-000000000001');
    await page.click('button:has-text("Functions")');

    await page.waitForTimeout(500);
    await expect(page.locator('text=Function')).toBeVisible();
  });

  test('user should be able to copy code', async ({ page }) => {
    await page.goto('/results/10000000-0000-0000-0000-000000000001');
    await page.click('[class*="CodeItemCard"]');
    await page.click('button:has-text("Copy")');

    await expect(page.locator('text=Copied')).toBeVisible();
  });
});