import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import snippets from '@/data/snippets.json';
import type { Snippet, SnippetCategory } from '@/lib/types';
import { SnippetCard } from '@/components/SnippetCard';

interface Props {
  params: Promise<{ category: string }>;
}

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

function slugToCategory(slug: string): SnippetCategory | null {
  return CATEGORIES.find((c) => c.toLowerCase().replace(/\s+/g, '-') === slug) ?? null;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.toLowerCase().replace(/\s+/g, '-') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = slugToCategory(slug);
  if (!category) return {};
  const count = (snippets as Snippet[]).filter((s) => s.category === category && !s.deprecated).length;
  return {
    title: `${category} snippets`,
    description: `${count} code patterns for ${category} — DCYFR Codes`,
  };
}

export default async function CategoryPage({ params }: Readonly<Props>) {
  const { category: slug } = await params;
  const category = slugToCategory(slug);
  if (!category) notFound();

  const categorySnippets = (snippets as Snippet[]).filter(
    (s) => s.category === category && !s.deprecated,
  );

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors">dcyfr.codes</Link>
          <span aria-hidden="true">/</span>
          <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
          <span aria-hidden="true">/</span>
          <span className="text-muted-foreground" aria-current="page">{category}</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground mb-2">{category}</h1>
        <p className="text-muted-foreground mb-10">
          {categorySnippets.length} {categorySnippets.length === 1 ? 'snippet' : 'snippets'}
        </p>

        {categorySnippets.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-card/40 p-10 text-center">
            <p className="text-muted-foreground">No snippets in this category yet.</p>
            <Link href="/snippets" className="mt-3 block text-sm text-accent-600 hover:text-foreground transition-colors">Browse all snippets →</Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {categorySnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
