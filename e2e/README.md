# e2e/ — Playwright tests

## Setup (one-time)

```bash
npx playwright install chromium
```

## First-time baseline capture

```bash
BASE_URL=https://dcyfr.codes npm run test:snapshots:update
```

Commit the resulting PNGs.

## Regular runs

```bash
npm run test:snapshots
```

Fails if diff > 5% (`maxDiffPixelRatio: 0.05`).

## Coverage

- **Routes:** `/` + `/snippets`
- **Viewports:** desktop `1440×900`, mobile `375×812`
- **Motion:** `prefers-reduced-motion: reduce` + `animations: 'disabled'`

## Related

- [Polish loop architecture](../../../../docs/dcyfr-workspace/polish-loop.md)
- [`nexus/scout-prompts/dcyfr-codes.md`](../../../../nexus/scout-prompts/dcyfr-codes.md)

<!-- testing visual-regression bypass after VERCEL_AUTOMATION_BYPASS_SECRET added 2026-05-27 -->
