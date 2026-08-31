import { test, expect } from '@playwright/test';

/**
 * Visual regression baseline per
 * openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md#51-screenshot-baseline
 *
 * dcyfr.codes is a snippet library — terminal aesthetic, dark-default. Two views:
 * - `/` home (hero + recent snippets + categories)
 * - `/snippets` full index
 */

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 375, height: 812, name: 'mobile' },
] as const;

/*
 * `/` carries `?spotlight=0` on purpose.
 *
 * The home route is `force-dynamic` and its featured-pattern slot draws a
 * random snippet per request, so the page's height depends on which one it
 * lands on. `toHaveScreenshot` treats a size mismatch as a hard failure
 * regardless of maxDiffPixelRatio, so `home @ mobile` failed on roughly one
 * run in five with a bare `Expected an image 375px by 2803px, received
 * 375px by 2823px` and no pixel diff to look at.
 *
 * Measured against the production build over 20 loads per viewport: mobile
 * produces two distinct heights, desktop exactly one. That asymmetry is the
 * whole bug — at 375px one snippet's description wraps an extra line, and at
 * 1440px they all fit on one, which is why only the mobile snapshot flaked.
 *
 * The param pins the pick without changing what a real visitor sees. Prefer
 * it over masking the region: a mask paints over pixels but leaves the page
 * the same amount taller, so the size check still fails.
 */
const ROUTES = [
  { path: '/?spotlight=0', name: 'home' },
  { path: '/snippets', name: 'snippets-index' },
] as const;

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`${route.name} @ ${vp.name}`, async ({ page }) => {
      // colorScheme lock — pre-migration hardcoded palette was effectively
      // dark-only; baselines preserved against dark-mode render. See
      // openspec/changes/dcyfr-palette-class-migration spec §2.2.
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
      });
    });
  }
}
