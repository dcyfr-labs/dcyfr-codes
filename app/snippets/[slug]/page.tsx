import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import snippets from '@/data/snippets.json';
import type { Snippet } from '@/lib/types';
import { CopyButton } from '@/components/CopyButton';
import { GistButton } from '@/components/GistButton';
import { clsx } from 'clsx';

interface Props {
  params: Promise<{ slug: string }>;
}

const AGENT_NAMES: Record<string, string> = {
  'architecture-reviewer': 'Architecture Reviewer',
  'change-lifecycle-manager': 'Change Lifecycle Manager',
  'compliance-reviewer': 'Compliance Reviewer',
  'database-architect': 'Database Architect',
  'dependency-coordinator': 'Dependency Coordinator',
  'devops-engineer': 'DevOps Engineer',
  'documentation-expert': 'Documentation Expert',
  'frontend-developer': 'Frontend Developer',
  'fullstack-developer': 'Fullstack Developer',
  'governance-reviewer': 'Governance Reviewer',
  'knowledge-governance-specialist': 'Knowledge Governance Specialist',
  'performance-profiler': 'Performance Profiler',
  'security-engineer': 'Security Engineer',
  'test-engineer': 'Test Engineer',
  'typescript-pro': 'TypeScript Pro',
  'worktree-coordinator': 'Worktree Coordinator',
};

const DIFFICULTY_COLORS = {
  beginner: 'border-dcyfr-success/30 bg-dcyfr-success/10 text-dcyfr-success',
  intermediate: 'border-dcyfr-warning/30 bg-dcyfr-warning/10 text-dcyfr-warning',
  advanced: 'border-dcyfr-error/30 bg-dcyfr-error/10 text-dcyfr-error',
} as const;

export async function generateStaticParams() {
  return (snippets as Snippet[]).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const snippet = (snippets as Snippet[]).find((s) => s.slug === slug);
  if (!snippet) return {};
  return {
    title: snippet.title,
    description: snippet.description,
    openGraph: {
      title: `${snippet.title} — DCYFR Codes`,
      description: snippet.description,
      url: `https://dcyfr.codes/snippets/${snippet.slug}`,
    },
  };
}

export default async function SnippetPage({ params }: Readonly<Props>) {
  const { slug } = await params;
  const snippet = (snippets as Snippet[]).find((s) => s.slug === slug);
  if (!snippet) notFound();

  const related = (snippets as Snippet[]).filter(
    (s) => snippet.relatedSnippets.includes(s.id) && !s.deprecated,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: snippet.title,
            description: snippet.description,
            programmingLanguage: snippet.language,
            url: `https://dcyfr.codes/snippets/${snippet.slug}`,
            publisher: { '@type': 'Organization', name: 'DCYFR', url: 'https://dcyfr.codes' },
          }),
        }}
      />

      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">dcyfr.codes</Link>
            <span aria-hidden="true">/</span>
            <Link href="/snippets" className="hover:text-foreground transition-colors">Snippets</Link>
            <span aria-hidden="true">/</span>
            <span className="text-muted-foreground" aria-current="page">{snippet.title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={clsx('rounded-full border px-2.5 py-0.5 text-xs font-medium', DIFFICULTY_COLORS[snippet.difficulty])}>
                    {snippet.difficulty}
                  </span>
                  {/* Same chip as components/SnippetCard.tsx — see the note
                      there for why the dark half of the accent ramp is
                      explicit rather than inherited. */}
                  <span className="rounded border border-input/40 bg-muted/60 px-1.5 py-0.5 text-xs font-mono text-accent-600 dark:text-accent-400">
                    {snippet.language}
                  </span>
                  {snippet.deprecated && (
                    <span className="rounded-full border border-input/40 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                      deprecated
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{snippet.title}</h1>
                <p className="text-muted-foreground leading-relaxed">{snippet.description}</p>
              </div>

              {/* Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-foreground">Code</h2>
                  <div className="flex items-center gap-2">
                    <CopyButton code={snippet.code} />
                    <GistButton snippet={snippet} />
                  </div>
                </div>
                <div className="code-block">
                  <pre><code>{snippet.code}</code></pre>
                </div>
              </div>

              {/* Explanation */}
              {snippet.explanation && (
                <div>
                  <h2 className="text-sm font-medium text-foreground mb-2">How it works</h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">{snippet.explanation}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              {/* Meta */}
              <div className="rounded-xl border border-input/60 bg-card/60 p-4">
                <h2 className="font-semibold text-foreground mb-3 text-sm">Details</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="text-foreground">{snippet.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Difficulty</dt>
                    <dd className="text-foreground capitalize">{snippet.difficulty}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Language</dt>
                    <dd className="text-foreground">{snippet.language}</dd>
                  </div>
                  {snippet.dcyfrAiVersion && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">@dcyfr/ai</dt>
                      <dd className="font-mono text-xs text-accent-600">{snippet.dcyfrAiVersion}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Tags */}
              {snippet.tags.length > 0 && (
                <div className="rounded-xl border border-input/60 bg-card/60 p-4">
                  <h2 className="font-semibold text-foreground mb-3 text-sm">Tags</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-input/40 bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Snippets */}
              {related.length > 0 && (
                <div className="rounded-xl border border-input/60 bg-card/60 p-4">
                  <h2 className="font-semibold text-foreground mb-3 text-sm">Related Snippets</h2>
                  <ul className="space-y-2">
                    {related.map((r) => (
                      <li key={r.id}>
                        <a
                          href={`/snippets/${r.slug}`}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {r.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Agents */}
              {snippet.relatedAgents && snippet.relatedAgents.length > 0 && (
                <div className="rounded-xl border border-secure/40 bg-secure/5 p-4">
                  <h2 className="font-semibold text-foreground mb-1 text-sm">Try in Agent Marketplace</h2>
                  <p className="text-xs text-muted-foreground mb-3">
                    These agents can run the patterns from this snippet.
                  </p>
                  <ul className="space-y-2">
                    {snippet.relatedAgents.map((agentId) => (
                      <li key={agentId}>
                        <a
                          href={`https://dcyfr.bot/agents/${agentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-sm text-accent-600 hover:text-foreground transition-colors group"
                        >
                          <span>{AGENT_NAMES[agentId] ?? agentId}</span>
                          <span className="text-muted-foreground group-hover:text-primary transition-colors text-xs">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-secure/30">
                    <a
                      href="https://dcyfr.bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-accent-600/70 transition-colors"
                    >
                      Browse all agents →
                    </a>
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Back */}
          <div className="mt-10">
            <Link href="/snippets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← All snippets
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
