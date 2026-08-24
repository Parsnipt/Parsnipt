# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: upload.spec.ts >> File Upload Flow >> user should see file validation errors
- Location: e2e\upload.spec.ts:32:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.setInputFiles: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="file"]')

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
  3  | test.describe('File Upload Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.fill('input[placeholder="your@email.com"]', 'test@example.com');
  7  |     await page.fill('input[type="password"]', 'password123');
  8  |     await page.click('button:has-text("Login")');
  9  |     await page.waitForURL('/');
  10 |   });
  11 | 
  12 |   test('user should be able to upload a file', async ({ page }) => {
  13 |     await page.goto('/upload');
  14 |     expect(page.url()).toContain('/upload');
  15 | 
  16 |     await expect(page.locator('text=Upload Your Code')).toBeVisible();
  17 | 
  18 |     const fileContent = 'function test() { console.log("hello"); }';
  19 |     const fileName = 'test.js';
  20 | 
  21 |     const fileInput = page.locator('input[type="file"]');
  22 |     await fileInput.setInputFiles({
  23 |       name: fileName,
  24 |       mimeType: 'application/javascript',
  25 |       buffer: Buffer.from(fileContent),
  26 |     });
  27 | 
  28 |     await page.waitForTimeout(2000);
  29 |     await expect(page.locator(`text=${fileName}`)).toBeVisible();
  30 |   });
  31 | 
  32 |   test('user should see file validation errors', async ({ page }) => {
  33 |     await page.goto('/upload');
  34 | 
  35 |     const fileInput = page.locator('input[type="file"]');
> 36 |     await fileInput.setInputFiles({
     |     ^ Error: locator.setInputFiles: Test timeout of 30000ms exceeded.
  37 |       name: 'test.txt',
  38 |       mimeType: 'text/plain',
  39 |       buffer: Buffer.from('some text'),
  40 |     });
  41 | 
  42 |     await expect(page.locator('text=Invalid file type')).toBeVisible();
  43 |   });
  44 | 
  45 |   test('drag and drop should work', async ({ page }) => {
  46 |     await page.goto('/upload');
  47 | 
  48 |     const fileContent = 'function test() {}';
  49 |     const dataTransfer = await page.evaluateHandle((content) => {
  50 |       const dt = new DataTransfer();
  51 |       const file = new File([content], 'test.js', { type: 'application/javascript' });
  52 |       dt.items.add(file);
  53 |       return dt;
  54 |     }, fileContent);
  55 | 
  56 |     const dropArea = page.locator('text=Upload Your Code').first();
  57 |     await dropArea.dispatchEvent('drop', { dataTransfer });
  58 | 
  59 |     await page.waitForTimeout(2000);
  60 |     await expect(page.locator('text=test.js')).toBeVisible();
  61 |   });
  62 | });
```