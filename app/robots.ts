import type { MetadataRoute } from 'next';

const BASE = 'https://dcyfr.codes';

const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: AI_SEARCH_BOTS, allow: '/' },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
