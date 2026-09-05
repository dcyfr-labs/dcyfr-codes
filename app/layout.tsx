import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/chrome/theme-provider';
import { SiteHeader, type HeaderNavItem } from '@/components/chrome/site-header';
import { SiteFooter, type FooterLink } from '@/components/chrome/site-footer';
import type { ChromeNavSection } from '@/components/chrome/nav-utils';
import { SiteCommandPalette } from '@/components/site-command-palette';
import './globals.css';

// dcyfr.codes reads mono end to end, and as of this commit it gets there from
// a real face rather than a system stack. globals.css points all three of the
// theme engine's type hooks (--font-display-loaded, --font-body-loaded,
// --font-mono-loaded) at --font-geist-mono, which is what adoption Decision 3
// means at this site: Geist Mono only, headings and body included.
//
// Something IS downloaded now, which the comment this replaces denied. geist
// is self-hosted through next/font/local, so there is no build-time fetch and
// no third-party request at runtime: the woff2 ships inside the geist package
// and Next serves it from this origin. Measured in node_modules,
// GeistMono-Variable.woff2 is 71,368 bytes.
//
// Geist SANS is deliberately not imported, which is where this site parts from
// the shared adoption recipe. Every other site in the wave binds both faces
// because it renders both. Here Decision 3 puts Geist Mono on display, body
// and code alike, so a GeistSans.variable on this element would render zero
// glyphs while still emitting a <link rel="preload" as="font"> for
// Geist-Variable.woff2 (69,652 bytes on disk) on every page. That was measured
// by building with both imports and reading the preload tags out of
// .next/server/app/*.html. Reversing it is two lines: import GeistSans, add
// its .variable below, and point --font-sans at --font-geist-sans in
// globals.css.
//
// The historical note is still worth keeping, because the baselines encode it.
// The pre-#37 comment had the old failure backwards: it claimed the identity
// block beat next/font and that Inter "resolved to zero elements". The
// opposite was true. `Inter({ variable: '--font-sans' })` set --font-sans on
// <html>, the same element carrying .theme-dcyfr-codes, and Inter won, so the
// site shipped sans and the mono identity was the half reaching nothing. PR
// #37 fixed it by deleting the Inter variable but did not re-baseline, so
// every committed PNG rendered sans until PR #43 regenerated them. No Inter
// loader and no --font-sans binding survived to this branch, so there was
// nothing here for this commit to remove.

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

// The v1 nav list minus the `external` flag: v2 nav items carry no such flag
// and every off-site link opens in the same tab (Decision 5). No `href="/"`
// entry to drop — v1 never had one, and the v2 header routes home through the
// logo regardless.
const NAV: HeaderNavItem[] = [
  { href: '/snippets', label: 'Browse' },
  { href: '/categories', label: 'Categories' },
  { href: 'https://dcyfr.io', label: 'dcyfr.io' },
];

// The drawer is the only place every link is reachable below `md`: the header
// link row and the footer link row are both `hidden md:flex`. Library and
// Ecosystem are the v1 footer's two columns, carried over unchanged — the
// recipe's separate "Ecosystem section for the external links" is already what
// the v1 Ecosystem column held here, so there is nothing to add beside it.
// Legal is the v1 footer's legal row, which the one-line v2 footer keeps on
// desktop and drops below `md`.
//
// No item may carry `icon`. This file is a Server Component and SiteHeader is
// 'use client', so an ElementType cannot cross the boundary.
const SECTIONS: ChromeNavSection[] = [
  {
    id: 'library',
    label: 'Library',
    items: [
      { href: '/snippets', label: 'Snippets' },
      { href: '/categories', label: 'Categories' },
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    items: [
      { href: 'https://dcyfr.tech', label: 'dcyfr.tech' },
      { href: 'https://dcyfr.io', label: 'dcyfr.io' },
      { href: 'https://dcyfr.app', label: 'dcyfr.app' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    items: [
      { href: '/privacy', label: 'Privacy' },
      { href: 'https://dcyfr.ai/terms', label: 'Terms' },
      { href: 'https://dcyfr.ai/security', label: 'Security' },
    ],
  },
];

// Flat, and short by design: the v2 footer link row sits on one line beside the
// copyright. The v1 footer's brand block, tagline and Ecosystem column live in
// the drawer above.
const FOOTER: FooterLink[] = [
  { href: '/snippets', label: 'Snippets' },
  { href: '/categories', label: 'Categories' },
  { href: '/privacy', label: 'Privacy' },
  { href: 'https://dcyfr.ai/terms', label: 'Terms' },
  { href: 'https://dcyfr.ai/security', label: 'Security' },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-identity selects the theme package; the .dark class (added by
    // ThemeProvider) selects the scheme. The engine's dark rules are the
    // compound [data-identity="slate"].dark, so both have to land on this same
    // element. Stamping data-identity on <body> instead would keep light
    // rendering correct and silently drop the dark scheme, which is this
    // site's default. The .theme-dcyfr-codes class stays as the
    // dcyfr-site-scaffold identity hook, intentionally empty.
    <html
      lang="en"
      suppressHydrationWarning
      data-identity="slate"
      className={`theme-dcyfr-codes ${GeistMono.variable}`}
    >
      {/* The ground colors move here from the deleted PageShell wrapper, which
          painted them on its own min-h-screen box. globals.css sets no body
          rule, so without these two utilities the site renders on Tailwind's
          default white. */}
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* focus:z-50 clears the fixed header, which is z-40. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
          >
            Skip to content
          </a>
          {/* The palette wraps header, main and footer so cmd+k works from any
              of the three. It renders no DOM box of its own (a context
              provider plus a portalled dialog), so the three stay direct flex
              children of <body>. */}
          <SiteCommandPalette>
            <SiteHeader
              logo={DcyfrCodesLogo}
              logoAriaLabel="dcyfr.codes home"
              links={NAV}
              mobileNavSections={SECTIONS}
            />
            {/* pt-18 clears the fixed h-18 header. */}
            <main id="main-content" className="flex-1 pt-18">
              {children}
            </main>
            <SiteFooter brand="DCYFR" links={FOOTER} />
          </SiteCommandPalette>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
