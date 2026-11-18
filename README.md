# dcyfr-codes

Searchable code patterns and recipes for the DCYFR ecosystem, live at **[dcyfr.codes](https://dcyfr.codes)**.

`dcyfr.codes` is a Next.js 16 / React 19 searchable library of code patterns and recipes. **Snippet content is machine-synced, not hand-authored** — an automated pipeline extracts it from workspace skills (see below), so edit the source skills, not the snippet data in this repo. It is part of the dcyfr-labs site family alongside [dcyfr-io](https://github.com/dcyfr-labs/dcyfr-io), [dcyfr-app](https://github.com/dcyfr-labs/dcyfr-app), [dcyfr-bot](https://github.com/dcyfr-labs/dcyfr-bot), [dcyfr-build](https://github.com/dcyfr-labs/dcyfr-build), [dcyfr-tech](https://github.com/dcyfr-labs/dcyfr-tech), and [dcyfr-work](https://github.com/dcyfr-labs/dcyfr-work).

## Content pipeline

- `extract-snippets.yml` runs the sync in CI every Tuesday at 06:00 UTC (or on manual dispatch, which accepts a `dry_run` input), authenticating across orgs with GitHub App tokens. It lints the snippets and opens a PR on the `snippets-sync` branch for `data/snippets.json`.
- `npm run export:snippets` (`scripts/extract-skills-snippets.mjs`) pulls snippets from workspace skills into the site's data. Run locally, pass the checkout location explicitly: `npm run export:snippets -- --workspace-root <path>`.
- `npm run lint:snippets` (`scripts/lint-snippets.mjs`) validates the synced content.

## Stack

- Next.js 16 (App Router) / React 19 / Tailwind CSS
- cmdk-powered search
- shadcn primitives from the `@dcyfr-labs` registry (`registry.dcyfr.ai`); shared chrome in `components/chrome/`, installed as the registry's `dcyfr-chrome-v2` block and updated by re-running the add command rather than by editing the files
- Sentry instrumentation (client, server, and edge configs)
- Playwright for e2e and visual-regression snapshots ([`e2e/`](e2e/README.md))

## Development

```sh
npm install
npm run dev        # http://localhost:3303
```

| Command | What it does |
|---|---|
| `npm run dev` / `npm run start` | Dev / production server on port **3303** |
| `npm run build` | Production build |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run lint:snippets` | Validate synced snippet content |
| `npm run export:snippets` | Re-run the skills → snippets extraction locally |
| `npm run test:e2e` (`:ui`) | Playwright e2e suite |
| `npm run test:contrast` | Contrast spec (chromium) |
| `npm run test:snapshots` (`:update`, `:rebaseline`) | Visual-regression snapshots (chromium) |
| `npm run check:theme-wiring` | Verifies the theme files, the `globals.css` imports and the `data-identity` stamp |

## Routes

- `/` — editorial homepage
- `/snippets`, `/snippets/[slug]` — snippet library and detail pages
- `/categories`, `/categories/[category]` — category browsing
- `POST /api/gist`: create a public GitHub gist from a snippet. The body is `{ "slug": "<snippet slug>" }`, resolved against `data/snippets.json` (deprecated snippets are excluded). The route returns 501 when `GITHUB_TOKEN` is unset, 403 unless the request's `Origin` or `Referer` is `dcyfr.codes`, `www.dcyfr.codes` or the request's own origin, and enforces 10 requests per hour per IP with an in-memory counter.
- `/privacy`: privacy notice
- `/robots.txt`, `/sitemap.xml`: generated from `app/robots.ts` and `app/sitemap.ts`
- `/indexnow.txt`: IndexNow key file; the route returns 404 when `INDEXNOW_KEY` is unset
- `/.well-known/security.txt`: RFC 9116 security contact

## Environment variables

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Runtime: `/api/gist` (needs gist scope); the route returns 501 without it |
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side Sentry reporting |
| `SENTRY_DSN` | Server and edge Sentry reporting; falls back to `NEXT_PUBLIC_SENTRY_DSN` |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Build time: Sentry source-map upload; default to `dcyfr-labs` / `dcyfr-codes` |
| `INDEXNOW_KEY` | Served at `/indexnow.txt` for IndexNow |

The content-pipeline auth in CI is handled by GitHub App tokens configured in `extract-snippets.yml`, not local env vars.

## Design-token & scaffold contract

This site follows the `dcyfr-site-scaffold` contract: colors, spacing, radii, and typography resolve via CSS variables. Local ESLint rules in `eslint-local-rules/` enforce part of this: `no-hardcoded-colors`, `no-deprecated-design-tokens` and `no-legacy-dcyfr-palette` are errors, while `no-hardcoded-spacing` and `no-hardcoded-typography` are switched off in `eslint.config.mjs`. The `design-tokens.yml` workflow gates every PR. From the workspace root, `npm run audit:sites` checks scaffold compliance across the site family.

## CI

- `ci.yml` — lint, typecheck, build
- `extract-snippets.yml` — automated snippet sync from workspace skills
- `codeql.yml` / `semgrep.yml` — static security analysis
- `design-tokens.yml` — design-token + scaffold gate
- `visual-regression.yml` — Playwright snapshots
- `dependabot-auto-merge.yml` — dependency hygiene

## Deployment

Deployed on Vercel from `main`, with hardened security headers via `vercel.json`.

## Further docs

- [`AGENTS.md`](AGENTS.md) — agent conventions and project structure
- [`e2e/README.md`](e2e/README.md) — test suite notes
