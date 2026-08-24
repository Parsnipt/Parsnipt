# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> user should be able to register, login, and logout
- Location: e2e\auth.spec.ts:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="••••••••"]:nth-of-type(2)')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - heading "Parsnipt" [level=1] [ref=e8]
      - paragraph [ref=e9]: Join the code extraction revolution
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Full Name
        - textbox "Full Name" [ref=e13]:
          - /placeholder: John Doe
          - text: Test User
      - generic [ref=e14]:
        - generic [ref=e15]: Email Address
        - textbox "Email Address" [ref=e16]:
          - /placeholder: your@email.com
          - text: test-1787342401256@example.com
      - generic [ref=e17]:
        - generic [ref=e18]: Password
        - textbox "Password" [active] [ref=e19]:
          - /placeholder: ••••••••
          - text: TestPassword123!
        - generic [ref=e20]:
          - generic [ref=e21]:
            - generic [ref=e22]: "Password Strength:"
            - generic [ref=e23]: Strong
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: ✓
              - generic [ref=e29]: At least 8 characters
            - generic [ref=e30]:
              - generic [ref=e31]: ✓
              - generic [ref=e32]: One uppercase letter (A-Z)
            - generic [ref=e33]:
              - generic [ref=e34]: ✓
              - generic [ref=e35]: One lowercase letter (a-z)
            - generic [ref=e36]:
              - generic [ref=e37]: ✓
              - generic [ref=e38]: One number (0-9)
      - generic [ref=e39]:
        - generic [ref=e40]: Confirm Password
        - textbox "Confirm Password" [ref=e41]:
          - /placeholder: ••••••••
      - generic [ref=e42]:
        - checkbox "I agree to the Terms and Conditions and Privacy Policy" [ref=e43]
        - generic [ref=e44]:
          - text: I agree to the
          - link "Terms and Conditions" [ref=e45] [cursor=pointer]:
            - /url: "#"
          - text: and
          - link "Privacy Policy" [ref=e46] [cursor=pointer]:
            - /url: "#"
      - button "Create Account" [ref=e47] [cursor=pointer]
    - generic [ref=e48]: OR
    - paragraph [ref=e52]:
      - text: Already have an account?
      - link "Log in here" [ref=e53] [cursor=pointer]:
        - /url: /login
    - generic [ref=e54]:
      - generic [ref=e55]:
        - generic [ref=e56]: ✓
        - generic [ref=e57]: 50KB free file uploads
      - generic [ref=e58]:
        - generic [ref=e59]: ✓
        - generic [ref=e60]: 10 extractions per day
      - generic [ref=e61]:
        - generic [ref=e62]: ✓
        - generic [ref=e63]: Syntax-highlighted code preview
  - link "Read our Privacy Policy" [ref=e65] [cursor=pointer]:
    - /url: "#"
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
> 15 |     await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', 'TestPassword123!');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
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
  30 |     await page.click('button:has-text("Login")');
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