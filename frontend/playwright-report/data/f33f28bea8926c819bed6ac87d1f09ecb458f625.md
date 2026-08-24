# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: upload.spec.ts >> File Upload Flow >> user should be able to upload a file
- Location: e2e\upload.spec.ts:12:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Upload Your Code')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Upload Your Code')

```

```yaml
- heading "Parsnipt" [level=1]
- paragraph: Extract code smarter, faster, better
- text: Email Address
- textbox "Email address input":
  - /placeholder: your@email.com
- paragraph: We'll never share your email with anyone else.
- text: Password
- textbox "Password":
  - /placeholder: ••••••••
- button "Login"
- text: OR
- paragraph:
  - text: Don't have an account?
  - link "Create one now":
    - /url: /register
- paragraph: "Demo Credentials:"
- paragraph:
  - text: "Email:"
  - code: test@example.com
- paragraph:
  - text: "Password:"
  - code: password123
- link "Need help? Contact support":
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
> 16 |     await expect(page.locator('text=Upload Your Code')).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
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
  36 |     await fileInput.setInputFiles({
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