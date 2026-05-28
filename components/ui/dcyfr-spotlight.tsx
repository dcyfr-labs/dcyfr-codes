import * as React from "react"

// Pattern source: gameshark-labs/sharkvault/app/page.tsx (spotlight pattern,
// lines 89–138)
//
// Per-render-random featured-item slot. Server-rendered with a Fisher-Yates
// shuffle, accepts a typed item array + a render-prop. Each request lands
// on a different item — combined with `export const dynamic =
// "force-dynamic"` on the consuming route, this gives the page a freshness
// signal: refresh twice, see different content. Zero client JS, zero
// hydration mismatch (server-only).
//
// Math.random() is intentional here. We're in a server component, called
// per-request, with no hydration concern. The eslint disable below is the
// same one SharkVault uses for the same reason.
//
// Returns null when items is empty (and renders `empty` if provided),
// matching the SharkVault `spot ?? null` pattern.
//
// IMPORTANT: To actually re-randomize per request, the consuming route
// MUST set `export const dynamic = "force-dynamic"` (or otherwise opt out
// of static rendering — e.g., a dynamic data fetch on the same route).
// Without that, Next.js will statically render this once at build time and
// cache the result; the "random pick per visit" property is lost.
export interface DcyfrSpotlightProps<T> {
  /** Items to pick from. When empty, renders `empty` (or null). */
  items: readonly T[]
  /** Render-prop for the chosen item. */
  children: (item: T) => React.ReactNode
  /** Optional fallback when `items` is empty. Defaults to null. */
  empty?: React.ReactNode
}

function DcyfrSpotlight<T>({
  items,
  children,
  empty,
}: DcyfrSpotlightProps<T>): React.ReactElement | null {
  if (items.length === 0) {
    return empty ? <>{empty}</> : null
  }

  // Server-render time, per-request. Math.random is OK here — no hydration
  // concern. Mirrors the SharkVault spotlight pick. Newer
  // eslint-plugin-react-hooks versions ship a `purity` rule that flags
  // this; this primitive intentionally does not include a disable comment
  // for it because not every consumer's plugin version recognizes the
  // rule (an unknown-rule disable is itself a lint error). Consumers on
  // strict configs should add their own disable or override.
  const pick = items[Math.floor(Math.random() * items.length)]

  return (
    <div data-slot="spotlight" data-spotlight-empty={false}>
      {children(pick)}
    </div>
  )
}

export { DcyfrSpotlight }
