'use client';

// Site-wide command palette wrapper. Lives in a client component so the
// lucide icon function references can be passed to DcyfrCommandPaletteProvider
// (a client component) without crossing the server-component boundary —
// Next.js disallows passing function values from server to client.
//
// Commands are bound to cmd+k / ctrl+k via the @dcyfr-labs primitive.
// All current commands navigate (href variant); the discriminated union
// in the primitive accepts either `run` or `href`, never both.

import type { ReactNode } from 'react';
import { Search, FolderTree, FilePlus } from 'lucide-react';
import { DcyfrCommandPaletteProvider } from '@/components/dcyfr-command-palette';
import type { DcyfrCommandPaletteCommand } from '@/components/dcyfr-command-palette';

const COMMANDS: DcyfrCommandPaletteCommand[] = [
  {
    id: 'search-snippets',
    label: 'Search snippets',
    hint: 'Browse the full library',
    icon: Search,
    href: '/snippets',
  },
  {
    id: 'jump-to-category',
    label: 'Jump to category',
    hint: 'Browse by topic',
    icon: FolderTree,
    href: '/categories',
  },
  {
    id: 'submit-snippet',
    label: 'Submit a snippet',
    hint: 'Opens a GitHub issue',
    icon: FilePlus,
    href: 'https://github.com/dcyfr-labs/dcyfr-codes/issues/new?template=submit-snippet.yml',
  },
];

export function SiteCommandPalette({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <DcyfrCommandPaletteProvider
      commands={COMMANDS}
      placeholder="Search snippets, jump to category…"
      emptyMessage="No matching commands."
    >
      {children}
    </DcyfrCommandPaletteProvider>
  );
}
