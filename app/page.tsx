// signature-surface: home-hero
//
// Per openspec/specs/dcyfr-site-scaffold §Requirement: Sites MAY
// designate ONE signature surface. This file deviates from chrome-
// cohort layout-rhythm in service of the dcyfr-codes identity: a
// snippet library reads as a deck + spotlight + browsable index,
// not as a generic hero + stat-row + grid template.
//
// All other scaffold guards still apply (ThemeProvider wrap, identity
// class, no theme-blind primitives, no legacy palette refs). The
// signature-surface marker only exempts chrome-uniformity drift checks.
//
// `dynamic = "force-dynamic"` is required by DcyfrSpotlight to actually
// pick a different featured snippet per request. Without it, the route
// is statically generated and the "random pick" becomes "build-time pick."

import type { Metadata } from 'next';
import Link from 'next/link';
import snippets from '@/data/snippets.json';
import type { Snippet, SnippetCategory } from '@/lib/types';
import { SnippetCard } from '@/components/SnippetCard';
import { DcyfrButton } from '@/components/ui/dcyfr-button';
import { DcyfrBadge } from '@/components/ui/dcyfr-badge';
import { DcyfrHeroStack } from '@/components/ui/dcyfr-hero-stack';
import { DcyfrSpotlight } from '@/components/ui/dcyfr-spotlight';
import { DcyfrStatusMarquee } from '@/components/ui/dcyfr-status-marquee';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'DCYFR Codes — Agent patterns, delegation recipes, and RAG pipelines',
};

const CATEGORIES: SnippetCategory[] = [
  'Agent Patterns',
  'Delegation',
  'RAG',
  'Code Generation',
  'Context Engineering',
  'CLI',
  'Infrastructure',
  'Testing',
];

export default function HomePage() {
  const typed = snippets as Snippet[];
  const active = typed.filter((s) => !s.deprecated);

  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    snippets: active.filter((s) => s.category === cat),
  })).filter((g) => g.snippets.length > 0);

  // Three most-recent snippets feed the hero deck. The deck is decorative
  // (DcyfrHeroStack defaults to aria-hidden) — real affordances live in
  // the CTA below it and the snippet/category grids further down.
  const deckSnippets = active.slice(0, 3);
  const recent = active.slice(0, 6);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Hero — text left, fanned snippet deck right (lg+) */}
        <header className="mb-12 grid items-center gap-10 lg:grid-cols-[1.05fr_minmax(0,440px)] lg:gap-12">
          <div className="flex flex-col gap-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span aria-hidden="true">▌</span> DCYFR ecosystem
            </p>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              dcyfr<span className="text-accent">.codes</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Production-ready code patterns and recipes for the DCYFR
              ecosystem. Agent delegation, RAG pipelines, context
              engineering — copy, adapt, ship.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <DcyfrButton asChild variant="brand" size="lg">
                <Link href="/snippets">Browse all snippets →</Link>
              </DcyfrButton>
              <DcyfrButton asChild variant="ghostly" size="lg">
                <Link href="#categories">By category</Link>
              </DcyfrButton>
            </div>
          </div>

          {/* Deck fills the hero's right half on wide screens; hidden
              below lg where the hero collapses to one column. */}
          <div className="hidden lg:block">
            {deckSnippets.length === 3 ? (
              <DcyfrHeroStack
                cards={[
                  <SnippetCard key={deckSnippets[0].id} snippet={deckSnippets[0]} />,
                  <SnippetCard key={deckSnippets[1].id} snippet={deckSnippets[1]} />,
                  <SnippetCard key={deckSnippets[2].id} snippet={deckSnippets[2]} />,
                ]}
              />
            ) : null}
          </div>
        </header>

        {/* Live stats marquee — replaces the prior 3-card stat block.
            Animated counters give the page a heartbeat without
            stealing above-the-fold real estate. */}
        <DcyfrStatusMarquee
          stats={[
            { value: active.length, label: 'Snippets', animate: true },
            { value: byCategory.length, label: 'Categories', animate: true },
            { value: new Set(active.map((s) => s.language)).size, label: 'Languages', animate: true },
          ]}
          divider="border"
          className="mb-12"
        />

        {/* Spotlight — per-render random featured snippet. The
            `force-dynamic` route directive above is what makes this
            re-randomize per request; without it the pick is cached
            at build time. */}
        <section className="mb-12" aria-label="Featured pattern">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span aria-hidden="true">▌</span> Featured pattern
            </p>
            <DcyfrBadge variant="info" size="sm" className="border-0 bg-transparent text-muted-foreground">
              Random pick
            </DcyfrBadge>
          </div>
          <DcyfrSpotlight items={active} empty={<p className="text-sm text-muted-foreground">No snippets yet.</p>}>
            {(snippet) => (
              <div className="rounded-2xl border border-input/60 bg-card/40 p-6 sm:p-8">
                <SnippetCard snippet={snippet} />
              </div>
            )}
          </DcyfrSpotlight>
        </section>

        {/* Recent */}
        <section className="mb-12" aria-label="Recent snippets">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Recent</h2>
            <DcyfrButton asChild variant="ghostly" size="sm">
              <Link href="/snippets" className="text-muted-foreground">
                All snippets →
              </Link>
            </DcyfrButton>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section id="categories" aria-label="Browse by category">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">Categories</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {byCategory.map(({ category, snippets: cats }) => (
              <a
                key={category}
                href={`/categories/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                className="group rounded-xl border border-input/60 bg-card/60 p-4 transition-colors hover:border-secure/40"
              >
                <p className="font-medium text-foreground transition-colors group-hover:text-accent">
                  {category}
                </p>
                <DcyfrBadge
                  variant="info"
                  size="sm"
                  className="mt-1 border-0 bg-transparent px-0 text-muted-foreground"
                >
                  {cats.length} {cats.length === 1 ? 'snippet' : 'snippets'}
                </DcyfrBadge>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
