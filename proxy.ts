import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Canonical host redirect, and why it lives in middleware rather than config.
 *
 * The apex serves a redirect to www, and hstspreload.org reads the HSTS header
 * on the redirect response itself, not on the page it lands on. Two simpler
 * homes for that redirect were tried first and both fail to attach it:
 *
 * 1. A Vercel project-level domain redirect runs above the app entirely, so no
 *    code in this repo executes and Vercel emits its platform default for
 *    custom domains: `max-age=63072000`, with no `includeSubDomains` and no
 *    `preload`. That is what every dcyfr apex served before this change, and it
 *    is the whole reason none of them are preload-eligible.
 *
 * 2. A `redirects` entry in vercel.json does not inherit the `headers` block.
 *    Measured on a preview deployment of this repo: a 308 produced that way came
 *    back with no Content-Security-Policy and no X-Frame-Options, both present
 *    on a 200 from the same build. Route-table redirects short-circuit ahead of
 *    the headers block.
 *
 * A middleware response is an application response, so the vercel.json headers
 * do reach it. Measured the same way: the 308 below came back carrying the full
 * `/(.*)` set. The explicit list is kept anyway so the redirect cannot silently
 * lose the directive if that block is ever narrowed.
 *
 * This is inert until the project-level domain redirect for the apex is cleared
 * in the Vercel dashboard. While that redirect exists it wins and this code
 * never sees the request, which is what makes shipping it first the safe order.
 */
const APEX = 'dcyfr.codes';
const CANONICAL = `www.${APEX}`;

/** Mirrors the `/(.*)` headers block in vercel.json. */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();

  if (host !== APEX) {
    return NextResponse.next();
  }

  const target = new URL(request.nextUrl.toString());
  target.protocol = 'https:';
  target.host = CANONICAL;
  target.port = '';

  const response = NextResponse.redirect(target, 308);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
