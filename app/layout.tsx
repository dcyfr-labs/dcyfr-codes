import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider';
import { PageShell, SiteNav, SiteFooter } from '@/components/chrome';
import { SiteCommandPalette } from '@/components/site-command-palette';
import './globals.css';

// No next/font import here on purpose. dcyfr.codes reads mono end to end, and
// it gets there from system stacks: globals.css fills the theme engine's
// --font-display-loaded / --font-body-loaded hooks with ui-monospace, and the
// engine's own --font-mono covers code. Nothing is downloaded.
//
// The comment this replaces had the old failure backwards, and it is worth
// stating correctly because the baselines encode it. It claimed the identity
// block beat next/font and that Inter "resolved to zero elements". The
// opposite was true: `Inter({ variable: '--font-sans' })` set --font-sans on
// <html>, the same element carrying .theme-dcyfr-codes, and Inter won — so
// the site shipped sans and the mono identity was the half reaching nothing.
// PR #37 fixed it by deleting the Inter variable, but did not re-baseline, so
// every committed PNG rendered sans until this branch regenerated them.

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
    dcyfr<span className="text-accent-600">.codes</span>
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

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: 'https://dcyfr.ai/terms', label: 'Terms', external: true },
  { href: 'https://dcyfr.ai/security', label: 'Security', external: true },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-identity selects the theme package; the .theme-dcyfr-codes class is
    // kept as the dcyfr-site-scaffold identity hook, now intentionally empty.
    <html
      lang="en"
      suppressHydrationWarning
      className="theme-dcyfr-codes"
      data-identity="slate"
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteCommandPalette>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-accent-600 focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:outline-none"
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
                  legal={LEGAL_LINKS}
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
