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
  // IMPORTANT: baselines MUST be generated on the x86 CI runner, never
  // locally. Text wraps differently between arm64 (Apple Silicon) and the x86
  // GitHub runner, shifting the fullPage height — a hard size mismatch the 5%
  // tolerance cannot absorb, because tolerance only applies once both images
  // are the same size.
  //
  // Corrected 2026-07-31: this note previously exempted desktop (1440px) as
  // "wide enough that local arm64 captures match CI". That is false, and the
  // exemption is what broke the sibling sites — dcyfr-bot, dcyfr-build and
  // dcyfr-work followed it, captured desktop locally, and their gate failed
  // 12/12 runs. Measured desktop drift at 1440px: +60px (dcyfr-bot), +51px
  // (dcyfr-work), +20px (dcyfr-build). Locally dcyfr-bot's / rendered exactly
  // 1743px — matching its baseline — while CI rendered 1803px three times
  // running. Applies to BOTH viewports; there is no safe local capture.
  //
  // Procedure: push the change, let this gate fail, download the failed run's
  // `playwright-report` artifact, and commit its `<name>-actual.png` as the
  // new `<name>.png` baseline (the artifact is the exact x86 render). CI
  // output is deterministic — identical dimensions across retries, branches
  // and days — so baselines converge. `npm run test:snapshots:update` is for
  // local iteration only; never commit what it produces.
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
