import { defineConfig } from '@playwright/test'

// E2E tests run against the REAL backend and REAL database.
// Playwright starts both servers automatically (or reuses already-running ones).
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5174',
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      // Backend API (needs backend/.env with DATABASE_URL - already present)
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:3000/metrics',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      // Student web app; VITE_API_URL points the app at the LOCAL backend
      command: 'npm run dev',
      url: 'http://localhost:5174',
      reuseExistingServer: true,
      env: { VITE_API_URL: 'http://localhost:3000' },
      timeout: 120000,
    },
  ],
})
