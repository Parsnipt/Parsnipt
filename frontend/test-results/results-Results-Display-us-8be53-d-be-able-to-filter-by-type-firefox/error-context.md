# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: results.spec.ts >> Results Display >> user should be able to filter by type
- Location: e2e\results.spec.ts:25:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Results Display', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/login');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  6  |     await page.fill('input[placeholder="your@email.com"]', 'test@example.com');
  7  |     await page.fill('input[type="password"]', 'password123');
  8  |     await page.click('button:has-text("Login")');
  9  |     await page.waitForURL('/');
  10 |   });
  11 | 
  12 |   test('user should be able to search results', async ({ page }) => {
  13 |     await page.goto('/results/test-extraction-123');
  14 |     await expect(page.locator('text=Extraction Results')).toBeVisible();
  15 | 
  16 |     const searchInput = page.locator('input[placeholder*="Search"]');
  17 |     await searchInput.fill('test');
  18 | 
  19 |     await page.waitForTimeout(500);
  20 |     const results = page.locator('[class*="CodeItemCard"]');
  21 |     const count = await results.count();
  22 |     expect(count).toBeGreaterThan(0);
  23 |   });
  24 | 
  25 |   test('user should be able to filter by type', async ({ page }) => {
  26 |     await page.goto('/results/test-extraction-123');
  27 |     await page.click('button:has-text("Functions")');
  28 | 
  29 |     await page.waitForTimeout(500);
  30 |     await expect(page.locator('text=Function')).toBeVisible();
  31 |   });
  32 | 
  33 |   test('user should be able to copy code', async ({ page }) => {
  34 |     await page.goto('/results/test-extraction-123');
  35 |     await page.click('[class*="CodeItemCard"]');
  36 |     await page.click('button:has-text("Copy")');
  37 | 
  38 |     await expect(page.locator('text=Copied')).toBeVisible();
  39 |   });
  40 | });
```