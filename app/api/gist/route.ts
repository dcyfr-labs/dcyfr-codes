import type { NextRequest } from 'next/server';

import snippets from '@/data/snippets.json';
import type { Snippet } from '@/lib/types';

interface GistRequest {
  slug?: unknown;
}

const EXTENSIONS: Record<string, string> = {
  typescript: 'ts',
  bash: 'sh',
  python: 'py',
  json: 'json',
  yaml: 'yaml',
  markdown: 'md',
};

const ALLOWED_ORIGINS = [
  'https://dcyfr.codes',
  'https://www.dcyfr.codes',
];

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

// Best-effort throttle. Serverless instances are per-region and short-lived, so
// this bounds one instance rather than the fleet — it is a brake on casual
// hammering, not an access control. The slug allowlist below is what actually
// stops the route being used to publish arbitrary content under our token.
const ipWindows = new Map<string, { count: number; windowStart: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const win = ipWindows.get(ip);

  if (!win || now - win.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipWindows.set(ip, { count: 1, windowStart: now });
    return false;
  }
  win.count += 1;
  return win.count > RATE_LIMIT_MAX;
}

function sameOrigin(req: NextRequest): boolean {
  // In preview/dev the deployment origin is not in the allowlist, so fall back
  // to comparing against the request's own host rather than blocking outright.
  const stated = req.headers.get('origin') ?? req.headers.get('referer');
  if (!stated) return false;

  let host: string;
  try {
    host = new URL(stated).origin;
  } catch {
    return false;
  }
  return ALLOWED_ORIGINS.includes(host) || host === new URL(req.url).origin;
}

/**
 * POST /api/gist
 * Publishes one of our own snippets as a GitHub Gist and returns its URL.
 *
 * The body carries a slug, never file content: the route resolves the snippet
 * from the site's own library, so a caller cannot use our token to publish
 * content of their choosing.
 *
 * Required env var: GITHUB_TOKEN (with gist scope)
 */
export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'Gist creation not configured' }, { status: 501 });
  }

  if (!sameOrigin(req)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  let body: GistRequest;
  try {
    body = (await req.json()) as GistRequest;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.slug !== 'string' || body.slug.length === 0) {
    return Response.json({ error: 'slug required' }, { status: 400 });
  }

  const snippet = (snippets as Snippet[]).find((s) => s.slug === body.slug && !s.deprecated);
  if (!snippet) {
    return Response.json({ error: 'Unknown snippet' }, { status: 404 });
  }

  const ext = EXTENSIONS[snippet.language] ?? 'txt';
  const filename = `${snippet.slug}.${ext}`;

  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      description: `${snippet.title} — dcyfr.codes`,
      public: true,
      files: { [filename]: { content: snippet.code } },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('GitHub Gist API error:', res.status, error);
    return Response.json({ error: 'GitHub API error' }, { status: 502 });
  }

  const gist = (await res.json()) as { html_url: string; id: string };
  return Response.json({ url: gist.html_url, id: gist.id });
}
