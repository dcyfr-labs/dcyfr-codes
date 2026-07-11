export const dynamic = 'force-dynamic';

export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return new Response('Not Found', { status: 404 });
  }
  return new Response(key, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
