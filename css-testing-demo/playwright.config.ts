import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/__snapshots__',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `file://${path.resolve(__dirname)}`,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
});
