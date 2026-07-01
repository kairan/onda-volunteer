import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5175';
const withApi = Boolean(process.env.CI || process.env.PLAYWRIGHT_WITH_API === 'true');

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/onda?schema=public';

const demoEnv = {
  VITE_SUPABASE_URL: '',
  VITE_SUPABASE_ANON_KEY: '',
  VITE_API_URL: process.env.VITE_API_URL ?? 'http://localhost:3000',
  VITE_AUTH_USE_DEV_HEADERS: 'true',
  VITE_DEMO_VOLUNTEER_ID:
    process.env.VITE_DEMO_VOLUNTEER_ID ?? 'seed-volunteer-demo',
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI || withApi ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: withApi
    ? [
        {
          command: 'bash scripts/e2e-api-server.sh',
          cwd: repoRoot,
          url: 'http://127.0.0.1:3000/organization/context',
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
            AUTH_ALLOW_DEV_HEADERS: 'true',
            WEB_ORIGIN: 'http://localhost:5175',
            SUPABASE_JWT_SECRET:
              process.env.SUPABASE_JWT_SECRET ?? 'playwright-ci-placeholder',
          },
        },
        {
          command: 'pnpm dev',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            ...demoEnv,
          },
        },
      ]
    : {
        command: 'pnpm dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          ...demoEnv,
        },
      },
});
