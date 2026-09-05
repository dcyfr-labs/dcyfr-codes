# Playwright tests (e2e/)

Two suites, and they fail for different reasons on purpose.

| Suite | What it asserts | Needs a baseline |
|---|---|---|
| `snapshots.spec.ts` | Whole-page pixels against committed PNGs | Yes |
| `contrast.spec.ts` | Every text run clears WCAG AA against its composited ground | No |

`contrast.spec.ts` exists because pixels cannot see invisible text: a
white-on-white heading measured 0.01 of the image against a 0.05
`maxDiffPixelRatio`, so the screenshot gate certified it for four months. A
computed-style walk needs no baseline and cannot go stale that way.

## Setup (one-time)

```bash
npx playwright install chromium
```

## Regular runs

```bash
npm run test:snapshots   # visual regression, chromium
npm run test:contrast    # contrast gate, chromium
npm run test:e2e         # both
```

## Baselines

**Baselines are x86-only.** Text wraps differently on arm64, which shifts the
`fullPage` height into a hard size mismatch that the 5% tolerance cannot absorb,
because tolerance only applies once both images are the same size. It hits both
viewports; there is no safe local capture.

The procedure lives in [`../playwright.config.ts`](../playwright.config.ts) and
runs through CI: push the change, let `visual-regression.yml` fail, download the
failed run's `playwright-report` artifact, and commit each `<name>-actual.png`
as the new `<name>.png`. `npm run test:snapshots:update` is for local iteration
only; never commit what it produces.

## Snapshot coverage

- **Routes:** `/?spotlight=0` and `/snippets`
- **Viewports:** desktop `1440×900`, mobile `375×812`
- **Scheme:** dark only, forced with `emulateMedia({ colorScheme: 'dark' })`
- **Motion:** `prefers-reduced-motion: reduce` plus `animations: 'disabled'`
- **Fonts:** `document.fonts.ready` after a fixed 1500 ms floor

`/` carries `?spotlight=0` because the route is `force-dynamic` and its
featured-pattern slot draws a random snippet per request. `toHaveScreenshot`
treats a size mismatch as a hard failure regardless of `maxDiffPixelRatio`, so
`home @ mobile` flaked roughly one run in five before the param pinned the pick.

The font wait is not redundant with the timeout. Geist Mono is a self-hosted
woff2 and every glyph on this site is set in it, so a capture taken between the
fallback paint and the swap differs from one taken after by more than the
tolerance. The timeout is a floor for layout; the face is its own gate.

## Page structure the specs assume

Chrome v2 puts one `fixed h-18` header, one `<main id="main-content">` and one
one-row footer on the page, all direct flex children of `<body>`. Pages render
a `<div>` wrapper, never a second `<main>`. A page-level `<main>` would nest
inside the layout's and break `#main-content` as a unique target.

## Related

- [`../README.md`](../README.md): stack, commands, CI
- [`../playwright.config.ts`](../playwright.config.ts): projects, the `BASE_URL`
  default (production), Vercel protection-bypass headers, and the full baseline
  procedure
