import type { Metadata } from 'next';
import snippets from '@/data/snippets.json';
import type { Snippet, SnippetCategory } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse DCYFR code patterns by category — delegation, RAG, context engineering, and more.',
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

const CATEGORY_DESCRIPTIONS: Record<SnippetCategory, string> = {
  'Agent Patterns': 'General patterns for building reliable, composable AI agents.',
  'Delegation': 'Contract-based task delegation between agents with tracing and security middleware.',
  'RAG': 'Retrieval-augmented generation — vector search, reranking, and hybrid approaches.',
  'Code Generation': 'Patterns for generating, validating, and testing code with LLMs.',
  'Context Engineering': 'Managing context windows, checkpoints, and signal density in long-running agents.',
  'CLI': 'Command-line patterns for the @dcyfr/ai-cli toolchain.',
  'Infrastructure': 'Docker, Kubernetes, and CI/CD patterns for AI workloads.',
  'Testing': 'Testing strategies for agent workflows, LLM outputs, and delegation contracts.',
};

export default function CategoriesPage() {
  const typed = (snippets as Snippet[]).filter((s) => !s.deprecated);

  const byCategory = CATEGORIES.map((cat) => ({
    category: cat,
    count: typed.filter((s) => s.category === cat).length,
    slug: cat.toLowerCase().replace(/\s+/g, '-'),
  })).filter((g) => g.count > 0);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Categories</h1>
        <p className="text-muted-foreground mb-10">Browse snippets by topic area.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {byCategory.map(({ category, count, slug }) => (
            <a
              key={category}
              href={`/categories/${slug}`}
              className="group rounded-xl border border-input/60 bg-card/60 p-5 hover:border-secure/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold text-foreground group-hover:text-accent-600 transition-colors">
                  {category}
                </h2>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {count} {count === 1 ? 'snippet' : 'snippets'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {CATEGORY_DESCRIPTIONS[category]}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
