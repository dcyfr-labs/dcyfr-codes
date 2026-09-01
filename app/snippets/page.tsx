'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import snippetsData from '@/data/snippets.json';
import type { Snippet, SnippetCategory, SnippetDifficulty, SnippetLanguage } from '@/lib/types';
import { SnippetCard } from '@/components/SnippetCard';
import {
  DcyfrTabs,
  DcyfrTabsList,
  DcyfrTabsTrigger,
} from '@/components/ui/dcyfr-tabs';
import { DcyfrBadge } from '@/components/ui/dcyfr-badge';

const snippets = (snippetsData as Snippet[]).filter((s) => !s.deprecated);

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

const DIFFICULTIES: SnippetDifficulty[] = ['beginner', 'intermediate', 'advanced'];
const LANGUAGES: SnippetLanguage[] = ['typescript', 'bash', 'python', 'json', 'yaml'];

const CATEGORY_SLUGS: Record<string, SnippetCategory> = Object.fromEntries(
  CATEGORIES.map((c) => [c.toLowerCase().replace(/\s+/g, '-'), c])
);
const SLUG_OF = (c: SnippetCategory) => c.toLowerCase().replace(/\s+/g, '-');

function SnippetsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<SnippetCategory | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<SnippetDifficulty | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<SnippetLanguage | null>(null);

  // URL ↔ state sync: read ?category= on mount + tab change
  useEffect(() => {
    const slug = searchParams.get('category');
    if (slug && CATEGORY_SLUGS[slug]) {
      setActiveCategory(CATEGORY_SLUGS[slug]);
    } else if (!slug) {
      setActiveCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      setActiveCategory(null);
      router.replace('/snippets', { scroll: false });
    } else {
      const cat = CATEGORY_SLUGS[value];
      if (cat) {
        setActiveCategory(cat);
        router.replace(`/snippets?category=${value}`, { scroll: false });
      }
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return snippets.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false;
      if (activeDifficulty && s.difficulty !== activeDifficulty) return false;
      if (activeLanguage && s.language !== activeLanguage) return false;
      if (q) {
        return (
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, activeCategory, activeDifficulty, activeLanguage]);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">All Snippets</h1>
        <p className="text-muted-foreground mb-8">{snippets.length} production-ready code patterns.</p>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input/60 bg-card/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-secure/60 focus:outline-none focus:ring-1 focus:ring-secure/40"
            aria-label="Search snippets"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          {/* Category — tab-based per openspec/changes/dcyfr-skeleton-content-polish §2.2 */}
          <DcyfrTabs
            value={activeCategory === null ? 'all' : SLUG_OF(activeCategory)}
            onValueChange={handleCategoryChange}
          >
            <DcyfrTabsList
              variant="underline"
              className="h-auto flex-wrap gap-x-4 gap-y-1 border-border/40"
            >
              <DcyfrTabsTrigger value="all" variant="underline" className="gap-2">
                All
                <DcyfrBadge variant="info" size="sm" className="bg-transparent border-0 px-1.5">
                  {snippets.length}
                </DcyfrBadge>
              </DcyfrTabsTrigger>
              {CATEGORIES.filter((c) => snippets.some((s) => s.category === c)).map((cat) => {
                const count = snippets.filter((s) => s.category === cat).length;
                return (
                  <DcyfrTabsTrigger
                    key={cat}
                    value={SLUG_OF(cat)}
                    variant="underline"
                    className="gap-2"
                  >
                    {cat}
                    <DcyfrBadge variant="info" size="sm" className="bg-transparent border-0 px-1.5">
                      {count}
                    </DcyfrBadge>
                  </DcyfrTabsTrigger>
                );
              })}
            </DcyfrTabsList>
          </DcyfrTabs>

          {/* Difficulty + Language */}
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.filter((d) => snippets.some((s) => s.difficulty === d)).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setActiveDifficulty(activeDifficulty === diff ? null : diff)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${activeDifficulty === diff ? 'border-primary bg-primary text-primary-foreground' : 'border-input/60 bg-muted/40 text-muted-foreground hover:border-secure/40'}`}
              >
                {diff}
              </button>
            ))}
            {LANGUAGES.filter((l) => snippets.some((s) => s.language === l)).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLanguage(activeLanguage === lang ? null : lang)}
                className={`rounded-full border px-3 py-1 text-xs font-mono transition-colors ${activeLanguage === lang ? 'border-primary bg-primary text-primary-foreground' : 'border-input/60 bg-muted/40 text-muted-foreground hover:border-secure/40'}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-card/40 p-10 text-center">
            <p className="text-muted-foreground">No snippets match your filters.</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setActiveCategory(null); setActiveDifficulty(null); setActiveLanguage(null); }}
              className="mt-3 text-sm text-accent-600 hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4" aria-live="polite" aria-atomic="true">{filtered.length} snippet{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SnippetsPage() {
  return (
    <Suspense fallback={<div className="px-4 py-12 sm:px-6 lg:px-8" />}>
      <SnippetsPageContent />
    </Suspense>
  );
}
