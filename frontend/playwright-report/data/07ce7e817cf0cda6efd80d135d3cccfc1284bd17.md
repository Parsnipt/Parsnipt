# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: results.spec.ts >> Results Display >> user should be able to search results
- Location: e2e\results.spec.ts:12:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - heading "Parsnipt" [level=1] [ref=e8]
      - paragraph [ref=e9]: Extract code smarter, faster, better
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email Address
        - textbox "Email address input" [disabled] [ref=e13]:
          - /placeholder: your@email.com
          - text: test@example.com
        - paragraph [ref=e14]: We'll never share your email with anyone else.
      - generic [ref=e15]:
        - generic [ref=e16]: Password
        - textbox "Password" [disabled] [ref=e17]:
          - /placeholder: ••••••••
          - text: password123
      - button "⟳ Logging in..." [disabled] [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: ⟳
          - text: Logging in...
    - generic [ref=e21]: OR
    - paragraph [ref=e25]:
      - text: Don't have an account?
      - link "Create one now" [ref=e26] [cursor=pointer]:
        - /url: /register
    - generic [ref=e27]:
      - paragraph [ref=e28]: "Demo Credentials:"
      - paragraph [ref=e29]:
        - text: "Email:"
        - code [ref=e30]: test@example.com
      - paragraph [ref=e31]:
        - text: "Password:"
        - code [ref=e32]: password123
  - link "Need help? Contact support" [ref=e34] [cursor=pointer]:
    - /url: "#"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Results Display', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.fill('input[placeholder="your@email.com"]', 'test@example.com');
  7  |     await page.fill('input[type="password"]', 'password123');
  8  |     await page.click('button:has-text("Login")');
> 9  |     await page.waitForURL('/');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
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