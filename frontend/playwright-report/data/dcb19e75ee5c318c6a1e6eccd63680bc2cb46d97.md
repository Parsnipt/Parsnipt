# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> user should see validation errors on login
- Location: e2e\auth.spec.ts:27:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Login")')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test('user should be able to register, login, and logout', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     expect(page.url()).toContain('/login');
  7  | 
  8  |     await page.click('a:has-text("Create one now")');
  9  |     expect(page.url()).toContain('/register');
  10 | 
  11 |     const uniqueEmail = `test-${Date.now()}@example.com`;
  12 |     await page.fill('input[placeholder="John Doe"]', 'Test User');
  13 |     await page.fill('input[placeholder="your@email.com"]', uniqueEmail);
  14 |     await page.fill('input[type="password"]:first-of-type', 'TestPassword123!');
  15 |     await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', 'TestPassword123!');
  16 |     await page.check('input[type="checkbox"]');
  17 | 
  18 |     await page.click('button:has-text("Create Account")');
  19 | 
  20 |     await expect(page).toHaveURL('/');
  21 |     await expect(page.locator('text=Test User')).toBeVisible();
  22 | 
  23 |     await page.click('button:has-text("Logout")');
  24 |     await expect(page).toHaveURL('/login');
  25 |   });
  26 | 
  27 |   test('user should see validation errors on login', async ({ page }) => {
  28 |     await page.goto('/login');
  29 | 
> 30 |     await page.click('button:has-text("Login")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  31 |     await expect(page.locator('text=Email is required')).toBeVisible();
  32 | 
  33 |     await page.fill('input[placeholder="your@email.com"]', 'notanemail');
  34 |     await page.click('button:has-text("Login")');
  35 |     await expect(page.locator('text=valid email')).toBeVisible();
  36 |   });
  37 | 
  38 |   test('password strength indicator should work', async ({ page }) => {
  39 |     await page.goto('/register');
  40 | 
  41 |     await page.fill('input[type="password"]:first-of-type', 'weak');
  42 |     await expect(page.locator('text=Weak')).toBeVisible();
  43 | 
  44 |     await page.fill('input[type="password"]:first-of-type', 'StrongPass123!');
  45 |     await expect(page.locator('text=Strong')).toBeVisible();
  46 |   });
  47 | });
```