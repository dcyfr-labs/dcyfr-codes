import type { Snippet } from '@/lib/types';
import { clsx } from 'clsx';

interface SnippetCardProps {
  snippet: Snippet;
}

const DIFFICULTY_COLORS = {
  beginner: 'border-dcyfr-success/30 bg-dcyfr-success/10 text-dcyfr-success',
  intermediate: 'border-dcyfr-warning/30 bg-dcyfr-warning/10 text-dcyfr-warning',
  advanced: 'border-dcyfr-error/30 bg-dcyfr-error/10 text-dcyfr-error',
} as const;

const LANGUAGE_LABELS: Record<string, string> = {
  typescript: 'TS',
  bash: 'SH',
  python: 'PY',
  json: 'JSON',
  yaml: 'YAML',
  markdown: 'MD',
};

export function SnippetCard({ snippet }: Readonly<SnippetCardProps>) {
  return (
    <a
      href={`/snippets/${snippet.slug}`}
      className="group flex flex-col rounded-xl border border-input/60 bg-card/60 p-4 hover:border-secure/40 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        {/*
          `dark:text-accent-400` is not decoration. The accent ramp was pointed
          at 600 for a near-white ground (see the note in app/globals.css); on
          this chip the ground is `bg-muted/60` over `bg-card/60`, which in dark
          lifts toward the text rather than away from it, and 600 measures
          3.94:1 there against AA's 4.5. 400 measures 7.89:1. Light is
          unaffected and stays on 600 at 4.9:1 — 400 would be 2.39:1 there.
        */}
        <span className="rounded border border-input/40 bg-muted/60 px-1.5 py-0.5 text-xs font-mono font-medium text-accent-600 dark:text-accent-400">
          {LANGUAGE_LABELS[snippet.language] ?? snippet.language.toUpperCase()}
        </span>
        <span className={clsx('rounded-full border px-2 py-0.5 text-xs font-medium', DIFFICULTY_COLORS[snippet.difficulty])}>
          {snippet.difficulty}
        </span>
        {snippet.deprecated && (
          <span className="rounded-full border border-input/40 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground line-through">
            deprecated
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-600 transition-colors mb-1">
        {snippet.title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
        {snippet.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-1">
        {snippet.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-input/40 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
