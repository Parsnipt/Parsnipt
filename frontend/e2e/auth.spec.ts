import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user should be able to register, login, and logout', async ({ page }) => {
    await page.goto('/login');
    expect(page.url()).toContain('/login');

    await page.click('a:has-text("Create one now")');
    expect(page.url()).toContain('/register');

    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[placeholder="John Doe"]', 'Test User');
    await page.fill('input[placeholder="your@email.com"]', uniqueEmail);
    await page.fill('input[type="password"]:first-of-type', 'TestPassword123!');
    await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', 'TestPassword123!');
    await page.check('input[type="checkbox"]');

    await page.click('button:has-text("Create Account")');

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Test User')).toBeVisible();

    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');
  });

  test('user should see validation errors on login', async ({ page }) => {
    await page.goto('/login');

    await page.click('button:has-text("Login")');
    await expect(page.locator('text=Email is required')).toBeVisible();

    await page.fill('input[placeholder="your@email.com"]', 'notanemail');
    await page.click('button:has-text("Login")');
    await expect(page.locator('text=valid email')).toBeVisible();
  });

  test('password strength indicator should work', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[type="password"]:first-of-type', 'weak');
    await expect(page.locator('text=Weak')).toBeVisible();

    await page.fill('input[type="password"]:first-of-type', 'StrongPass123!');
    await expect(page.locator('text=Strong')).toBeVisible();
  });
});