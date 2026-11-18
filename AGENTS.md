# AGENTS.md - dcyfr-codes

## What this is

Searchable library of code patterns and recipes for the DCYFR ecosystem. Production URL is https://dcyfr.codes (package name `dcyfr-codes-snippets`, dev port 3303). It is one of seven sibling sites built from the `dcyfr-site-scaffold` contract, so layout, tooling and CI match the other `dcyfr-*` site repos. Snippet content is machine-synced from workspace skills, so edit the source skills and let the pipeline update `data/snippets.json`.

## Stack

- Next.js `^16.4.3` (App Router) with React `^19.0.0`, TypeScript `^5`
- Tailwind CSS `^4.3.3` through `@tailwindcss/postcss`; there is no Tailwind config file
- shadcn (`new-york` style) with the `@dcyfr-labs` registry (`https://registry.dcyfr.ai/r/{name}.json`, see `components.json`); `cmdk` powers the command palette
- `@sentry/nextjs` `^10`, `@vercel/analytics`, `@vercel/speed-insights`, `next-themes`
- Playwright `^1.58.2`; ESLint `^9` flat config (`eslint.config.mjs`)

## Directory map

- `app/` : routes `/`, `/snippets`, `/snippets/[slug]`, `/categories`, `/categories/[category]`, `/privacy`; `robots.ts`, `sitemap.ts`, `indexnow.txt`, `.well-known/security.txt`, icons, OG image, theme CSS files
- `app/api/gist` : `POST` route that creates a public GitHub gist (see Gotchas)
- `components/` : `CopyButton`, `GistButton`, `SnippetCard`, `site-command-palette.tsx`, and `dcyfr-command-palette/`
- `components/chrome/` : shared nav, footer, theme provider and toggle (registry-owned)
- `components/ui/` : `button`, `sheet`, `dcyfr-animated-counter`, `dcyfr-badge`, `dcyfr-button`, `dcyfr-card`, `dcyfr-hero-stack`, `dcyfr-spotlight`, `dcyfr-status-marquee`, `dcyfr-tabs`
- `data/snippets.json` : synced content, rewritten by the extraction pipeline
- `scripts/` : `extract-skills-snippets.mjs`, `lint-snippets.mjs`, `check-theme-wiring.mjs`
- `hooks/` : `use-dropdown`, `use-media-query`; `lib/` : `types.ts`, `utils.ts`
- `e2e/` : Playwright specs (`contrast`, `snapshots`) and their README
- `eslint-local-rules/` : the five local ESLint rules
- `proxy.ts` : apex to `www` redirect (Next 16 middleware)

## Content pipeline

- `.github/workflows/extract-snippets.yml` runs every Tuesday at 06:00 UTC, or on dispatch with a `dry_run` input. It runs `extract-skills-snippets.mjs --workspace-root ./dcyfr-workspace` against a checkout of the workspace repository, runs `lint-snippets.mjs`, and opens a PR on the `snippets-sync` branch for `data/snippets.json`.
- Locally, `npm run export:snippets` defaults the workspace root to four directories above `scripts/`. Pass the location explicitly: `npm run export:snippets -- --workspace-root <path>`.
- `npm run lint:snippets` validates the content in `data/snippets.json`.

## Scripts

- `dev` and `start` run `next dev --port 3303` and `next start --port 3303`. `build` runs `next build`, `lint` runs `eslint .`, `typecheck` runs `tsc --noEmit`.
- `lint:snippets` runs `node scripts/lint-snippets.mjs`; `export:snippets` runs `node scripts/extract-skills-snippets.mjs`.
- `test:e2e` runs every Playwright spec in `e2e/`; `test:e2e:ui` opens Playwright UI mode.
- `test:contrast` and `test:snapshots` run one spec each (`e2e/contrast.spec.ts`, `e2e/snapshots.spec.ts`) on chromium. `test:snapshots:update` and `test:snapshots:rebaseline` add `--update-snapshots` and `--update-snapshots=all`.
- `check:theme-wiring` runs `node scripts/check-theme-wiring.mjs`.

## Environment variables

There is no `.env.example`. These are the names the code reads.

- `GITHUB_TOKEN` : used by `/api/gist` (needs gist scope); the route returns 501 when it is unset
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` (falls back to `NEXT_PUBLIC_SENTRY_DSN`)
- `SENTRY_ORG`, `SENTRY_PROJECT` (build-time source maps; default to `dcyfr-labs` and `dcyfr-codes`)
- `INDEXNOW_KEY` : served at `/indexnow.txt`; the route returns 404 when it is unset
- `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `NEXT_RUNTIME`, `CI` : set by the platform or CI
- `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET` : Playwright only

## Testing

- Playwright has no `webServer` block. `playwright.config.ts` reads `BASE_URL` and falls back to the production site, so start the app yourself and set `BASE_URL=http://localhost:3303` to test local changes.
- There is no smoke spec. `contrast.spec.ts` covers `/`, `/snippets`, `/categories` and `/privacy`. `snapshots.spec.ts` covers `/?spotlight=0` and `/snippets` with a 5% `maxDiffPixelRatio`.
- Mobile snapshot baselines must be generated on x86 CI. Use the `visual-regression.yml` dispatch with `update_baselines` instead of a local run.
- Use `npm run lint:snippets` to validate snippet data. There is no unit-test runner.

## CI

- `ci.yml`: `typecheck`, `lint` and `build` matrix on Node 20.
- `design-tokens.yml`: palette and primitive-color guards, identity-clobber and theme-wiring checks.
- `visual-regression.yml`: runs on Vercel preview `deployment_status` or dispatch (`base_url`, `update_baselines`); contrast spec, then snapshots (Node 22).
- `extract-snippets.yml`: the weekly snippet sync described above.
- `codeql.yml`, `semgrep.yml`: weekly (Monday 09:00 UTC), PRs and pushes to `main`; Semgrep needs `SEMGREP_APP_TOKEN`. The Dependabot auto-merge workflows handle dependency PRs.

The `main protection` ruleset requires the `lint`, `typecheck` and `build` checks.

## Design system rules

- Colors, spacing, radii and type come from CSS variables and the vendored `app/dcyfr-theme-*.css` and `app/dcyfr-chrome.css` files. `app/layout.tsx` sets `data-identity="slate"` on `<html>`, and `npm run check:theme-wiring` verifies that wiring.
- ESLint errors: `no-hardcoded-colors`, `no-deprecated-design-tokens`, `no-legacy-dcyfr-palette`. `no-hardcoded-spacing` and `no-hardcoded-typography` are `off` in `eslint.config.mjs`.
- Add primitives with the shadcn CLI and the `@dcyfr-labs` registry instead of writing parallel copies.

## Conventions and gotchas

- `components/chrome/` is owned by the registry bundle. Update it by re-running the registry add command instead of editing the files.
- `proxy.ts` redirects `dcyfr.codes` to `www.dcyfr.codes` with a 308 and security headers. It stays inert while the Vercel project-level apex redirect exists. `metadataBase` is the apex URL.
- `POST /api/gist` takes a body of `{ "slug": "<snippet slug>" }` and resolves it against `data/snippets.json`, skipping deprecated entries. It returns 403 unless the `Origin` or `Referer` is `dcyfr.codes`, `www.dcyfr.codes` or the request's own origin, and 429 after 10 requests per hour per IP (an in-memory counter, so it resets per server instance).
- A legacy `.eslintrc.json` sits next to the flat config. ESLint 9 reads `eslint.config.mjs`.
- When snippet formats or the extraction logic change, run `npm run lint:snippets` and keep the scripts, the data shape in `lib/types.ts` and the UI in sync.
