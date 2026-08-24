import { test, expect } from '@playwright/test';

test.describe('File Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="your@email.com"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL('/');
  });

  test('user should be able to upload a file', async ({ page }) => {
    await page.goto('/upload');
    expect(page.url()).toContain('/upload');

    await expect(page.locator('text=Upload Your Code')).toBeVisible();

    const fileContent = 'function test() { console.log("hello"); }';
    const fileName = 'test.js';

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'application/javascript',
      buffer: Buffer.from(fileContent),
    });

    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${fileName}`)).toBeVisible();
  });

  test('user should see file validation errors', async ({ page }) => {
    await page.goto('/upload');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('some text'),
    });

    await expect(page.locator('text=Invalid file type')).toBeVisible();
  });

  test('drag and drop should work', async ({ page }) => {
    await page.goto('/upload');

    const fileContent = 'function test() {}';
    const dataTransfer = await page.evaluateHandle((content) => {
      const dt = new DataTransfer();
      const file = new File([content], 'test.js', { type: 'application/javascript' });
      dt.items.add(file);
      return dt;
    }, fileContent);

    const dropArea = page.locator('text=Upload Your Code').first();
    await dropArea.dispatchEvent('drop', { dataTransfer });

    await page.waitForTimeout(2000);
    await expect(page.locator('text=test.js')).toBeVisible();
  });
});