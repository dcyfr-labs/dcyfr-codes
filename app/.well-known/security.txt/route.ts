import { NextResponse } from 'next/server';

/**
 * RFC 9116 security.txt for dcyfr.codes.
 *
 * Vulnerability reports for the whole DCYFR estate go to the canonical
 * contact on dcyfr.ai; this file exists so a researcher who lands on
 * dcyfr.codes finds the route without guessing.
 */
export function GET(request: Request) {
  const { origin } = new URL(request.url);

  // RFC 9116 caps Expires at one year out. Six months keeps it honest.
  const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

  const body = [
    'Contact: https://dcyfr.ai/contact',
    `Expires: ${expires}`,
    'Preferred-Languages: en',
    'Policy: https://dcyfr.ai/security',
    `Canonical: ${origin}/.well-known/security.txt`,
  ].join('\n');

  return new NextResponse(body + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
