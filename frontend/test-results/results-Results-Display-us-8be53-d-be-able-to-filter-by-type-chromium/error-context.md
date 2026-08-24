# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: results.spec.ts >> Results Display >> user should be able to filter by type
- Location: e2e\results.spec.ts:25:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Functions")')

```

# Page snapshot

```yaml
- generic [ref=f1e5]:
  - generic [ref=f1e6]:
    - generic [ref=f1e7]:
      - heading "Parsnipt" [level=1] [ref=f1e8]
      - paragraph [ref=f1e9]: Extract code smarter, faster, better
    - generic [ref=f1e10]:
      - generic [ref=f1e11]:
        - generic [ref=f1e12]: Email Address
        - textbox "Email address input" [ref=f1e13]:
          - /placeholder: your@email.com
        - paragraph [ref=f1e14]: We'll never share your email with anyone else.
      - generic [ref=f1e15]:
        - generic [ref=f1e16]: Password
        - textbox "Password" [ref=f1e17]:
          - /placeholder: ••••••••
      - button "Login" [ref=f1e18] [cursor=pointer]
    - generic [ref=f1e19]: OR
    - paragraph [ref=f1e23]:
      - text: Don't have an account?
      - link "Create one now" [ref=f1e24] [cursor=pointer]:
        - /url: /register
    - generic [ref=f1e25]:
      - paragraph [ref=f1e26]: "Demo Credentials:"
      - paragraph [ref=f1e27]:
        - text: "Email:"
        - code [ref=f1e28]: test@example.com
      - paragraph [ref=f1e29]:
        - text: "Password:"
        - code [ref=f1e30]: password123
  - link "Need help? Contact support" [ref=f1e32] [cursor=pointer]:
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
> 27 |     await page.click('button:has-text("Functions")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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