# AGENTS.md - dcyfr-codes

## Project Overview

`dcyfr.codes` is a Next.js 16 / React 19 searchable library of code patterns and recipes for the DCYFR ecosystem.

## Architecture

- App Router pages: `app/`
- Shared UI: `components/`
- Utilities/search logic: `lib/`
- Snippet tooling: `scripts/`
- Content/data: `data/`

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run lint:snippets
npm run export:snippets
npm run test:e2e
```

## Working Rules

- Keep snippet data, export scripts, and UI behavior in sync.
- When changing snippet formats or extraction logic, validate with `lint:snippets` or `export:snippets` as appropriate.
