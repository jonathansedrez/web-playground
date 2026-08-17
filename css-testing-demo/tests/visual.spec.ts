import { test, expect } from '@playwright/test';
import path from 'path';

const pageUrl = `file://${path.resolve(__dirname, '../index.html')}`;

test.beforeEach(async ({ page }) => {
  await page.goto(pageUrl);
  // Wait for fonts and layout to settle
  await page.waitForLoadState('networkidle');
});

// Demo 2: catches layout regressions — badges stacking, overlapping, clipping
test('badge row — full layout', async ({ page }) => {
  await expect(page.locator('.badge-row')).toHaveScreenshot('badge-row.png');
});

// Demo 3: catches broken conditional branches — one bad color token swap
test('low priority badge', async ({ page }) => {
  await expect(page.locator('.badge-wrapper').nth(0)).toHaveScreenshot('badge-low.png');
});

test('medium priority badge', async ({ page }) => {
  await expect(page.locator('.badge-wrapper').nth(1)).toHaveScreenshot('badge-medium.png');
});

test('high priority badge', async ({ page }) => {
  await expect(page.locator('.badge-wrapper').nth(2)).toHaveScreenshot('badge-high.png');
});
