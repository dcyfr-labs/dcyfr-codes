import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // Drop {projectName} and {platform} from snapshot paths so baselines
  // captured on macOS match what CI renders on Linux. The 5% tolerance
  // (maxDiffPixelRatio: 0.05 in e2e/snapshots.spec.ts) absorbs the
  // per-OS font/anti-aliasing delta.
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL: process.env.BASE_URL ?? 'https://dcyfr.codes',
    trace: 'on-first-retry',
    // Vercel Protection Bypass for Automation. Without these headers, Playwright
    // hits the Vercel SSO login wall on protected preview deploys instead of the
    // site. Header bypass + cookie bypass together cover both fetch + navigation.
    // https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          'x-vercel-set-bypass-cookie': 'true',
        }
      : undefined,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
