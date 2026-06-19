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
  //
  // IMPORTANT: mobile (375px) baselines MUST be (re)generated on the x86 CI
  // runner, never locally. At narrow width, text wraps differently between
  // arm64 (Apple Silicon) and the x86 GitHub runner, shifting the fullPage
  // height by ~20px — a hard size-mismatch the 5% tolerance cannot absorb.
  // Procedure: push the change, let this gate fail, download the failed run's
  // `playwright-report` artifact, and commit its `<name>-actual.png` as the
  // new `<name>.png` baseline (the artifact is the exact x86 render). Desktop
  // (1440px) is wide enough that local arm64 captures match CI and may use
  // `npm run test:snapshots:update`.
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
