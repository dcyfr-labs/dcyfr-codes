# dcyfr-codes

Searchable code patterns and recipes for the DCYFR ecosystem, live at **[dcyfr.codes](https://dcyfr.codes)**.

`dcyfr.codes` is a Next.js 15 / React 19 searchable library of code patterns and recipes. **Snippet content is machine-synced, not hand-authored** — an automated pipeline extracts it from workspace skills (see below), so edit the source skills, not the snippet data in this repo. It is part of the dcyfr-labs site family alongside [dcyfr-io](https://github.com/dcyfr-labs/dcyfr-io), [dcyfr-app](https://github.com/dcyfr-labs/dcyfr-app), [dcyfr-bot](https://github.com/dcyfr-labs/dcyfr-bot), [dcyfr-build](https://github.com/dcyfr-labs/dcyfr-build), [dcyfr-tech](https://github.com/dcyfr-labs/dcyfr-tech), and [dcyfr-work](https://github.com/dcyfr-labs/dcyfr-work).

## Content pipeline

- `extract-snippets.yml` runs the sync in CI, authenticating across orgs with GitHub App tokens.
- `npm run export:snippets` (`scripts/extract-skills-snippets.mjs`) pulls snippets from workspace skills into the site's data.
- `npm run lint:snippets` (`scripts/lint-snippets.mjs`) validates the synced content.

## Stack

- Next.js 15 (App Router) / React 19 / Tailwind CSS
- cmdk-powered search
- shadcn primitives from the `@dcyfr-labs` registry (`registry.dcyfr.ai`); shared chrome in [`components/chrome/`](components/chrome/README.md)
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
| `npm run test:snapshots` (`:update`) | Visual-regression snapshots (chromium) |

## Routes

- `/` — editorial homepage
- `/snippets`, `/snippets/[slug]` — snippet library and detail pages
- `/categories`, `/categories/[category]` — category browsing
- `POST /api/gist` — create a GitHub gist from a snippet (requires `GITHUB_TOKEN`)

## Environment variables

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Runtime — `/api/gist` (needs gist scope); route degrades without it |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Build time — Sentry source-map upload |

The content-pipeline auth in CI is handled by GitHub App tokens configured in `extract-snippets.yml`, not local env vars.

## Design-token & scaffold contract

This site follows the `dcyfr-site-scaffold` contract: colors, spacing, radii, and typography resolve via CSS variables — no hardcoded design tokens. Local ESLint rules in `eslint-local-rules/` enforce this and the `design-tokens.yml` workflow gates every PR. From the workspace root, `npm run audit:sites` checks scaffold compliance across the site family.

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
- [`components/chrome/README.md`](components/chrome/README.md) — shared chrome primitives
- [`e2e/README.md`](e2e/README.md) — test suite notes
