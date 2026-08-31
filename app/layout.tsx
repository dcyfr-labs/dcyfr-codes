import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { PageShell, SiteNav, SiteFooter } from '@/components/chrome';
import { SiteCommandPalette } from '@/components/site-command-palette';
import './globals.css';

// No next/font import here on purpose. dcyfr.codes declares a mono identity:
// `.theme-dcyfr-codes` sets BOTH --font-sans and --font-mono to the same
// ui-monospace stack, and that block wins over next/font's own --font-sans on
// source order. So the Inter face this file used to import resolved to zero
// elements on the page while still emitting a render-blocking
// `<link rel="preload" as="font">` and downloading the woff2 on every load.

export const metadata: Metadata = {
  title: {
    default: 'DCYFR Codes — Agent patterns, delegation recipes, and RAG pipelines',
    template: '%s | DCYFR Codes',
  },
  description:
    'Searchable code patterns and production-ready recipes for building with the DCYFR ecosystem — agent delegation, RAG pipelines, context engineering, and more.',
  openGraph: {
    type: 'website',
    siteName: 'DCYFR Codes',
    url: 'https://dcyfr.codes',
  },
  metadataBase: new URL('https://dcyfr.codes'),
};

const DcyfrCodesLogo = (
  <span className="font-mono text-lg font-semibold tracking-tight">
    dcyfr<span className="text-accent">.codes</span>
  </span>
);

const NAV_LINKS = [
  { href: '/snippets', label: 'Browse' },
  { href: '/categories', label: 'Categories' },
  { href: 'https://dcyfr.io', label: 'dcyfr.io', external: true },
];

const FOOTER_COLUMNS = [
  {
    title: 'Library',
    links: [
      { href: '/snippets', label: 'Snippets' },
      { href: '/categories', label: 'Categories' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { href: 'https://dcyfr.tech', label: 'dcyfr.tech', external: true },
      { href: 'https://dcyfr.io', label: 'dcyfr.io', external: true },
      { href: 'https://dcyfr.app', label: 'dcyfr.app', external: true },
    ],
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="theme-dcyfr-codes">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteCommandPalette>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-accent focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:outline-none"
            >
              Skip to main content
            </a>
            <PageShell
              nav={<SiteNav logo={DcyfrCodesLogo} links={NAV_LINKS} />}
              footer={
                <SiteFooter
                  brand={{
                    name: 'dcyfr.codes',
                    tagline: 'Production-ready code patterns for the DCYFR ecosystem.',
                  }}
                  columns={FOOTER_COLUMNS}
                />
              }
              padding="none"
              maxWidth="full"
            >
              <div id="main-content">{children}</div>
            </PageShell>
          </SiteCommandPalette>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
