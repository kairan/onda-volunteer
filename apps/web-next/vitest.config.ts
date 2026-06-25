import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Vite build + full router shell tests are memory-heavy; cap forks to avoid OOM.
    pool: 'forks',
    maxWorkers: 2,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        // Demo `/` landing auth panel — covered by Playwright smoke, not unit-tested.
        'src/AuthPanel.tsx',
        // Placeholder routes pending full port or redirect-only stubs.
        'src/routes/placeholderPage.tsx',
        'src/routes/schedulingCreateEvent.tsx',
        // Router prefetch hooks — exercised via route integration tests.
        'src/leader/prefetchLeaderScheduling.ts',
        'src/volunteer/prefetchVolunteerDashboard.ts',
        // Read-only operator detail — parity smoke deferred; list page covered.
        'src/system-admin/SystemAdminSchedulingEventDetailPage.tsx',
      ],
      thresholds: {
        lines: 61,
        statements: 60,
        branches: 49,
        functions: 60,
      },
    },
  },
});
