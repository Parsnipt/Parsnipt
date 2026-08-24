# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: upload.spec.ts >> File Upload Flow >> user should be able to upload a file
- Location: e2e\upload.spec.ts:12:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/upload", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - link "Parsnipt" [ref=e7] [cursor=pointer]:
        - /url: /
      - navigation [ref=e8]:
        - link "Upload" [ref=e9] [cursor=pointer]:
          - /url: /upload
        - link "Docs" [ref=e10] [cursor=pointer]:
          - /url: https://github.com/parsnipt/parsnipt
        - generic [ref=e11]:
          - generic [ref=e12]:
            - paragraph [ref=e13]: Test User
            - paragraph [ref=e14]: free tier
          - button "Logout" [ref=e15] [cursor=pointer]
  - main [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]:
        - heading "Welcome to Parsnipt, Test" [level=1] [ref=e19]
        - paragraph [ref=e20]: Drag and drop a React, JavaScript, or TypeScript file below to instantly extract its architecture.
      - generic [ref=e23] [cursor=pointer]:
        - heading "Upload Your Code" [level=3] [ref=e27]
        - paragraph [ref=e28]: Drag and drop your file here, or click to browse
        - button "Choose File" [ref=e29]
        - generic [ref=e30]:
          - paragraph [ref=e31]:
            - strong [ref=e32]: "Supported formats:"
            - text: .js, .jsx, .ts, .tsx
          - paragraph [ref=e33]:
            - strong [ref=e34]: "Max file size:"
            - text: 50 KB (free tier)
          - paragraph [ref=e35]: Your code is processed locally and never stored without your consent.
  - contentinfo [ref=e36]:
    - generic [ref=e38]:
      - img "Parsnipt Logo"
      - paragraph [ref=e39]: © 2026 Parsnipt. All rights reserved.
      - paragraph [ref=e40]: MIT Licensed
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
> 13 |     await page.goto('/upload');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
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