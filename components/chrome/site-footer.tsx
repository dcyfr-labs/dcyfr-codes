import { cn } from '@/lib/utils';

/**
 * Site footer with copyright line and inline links.
 *
 * Server-compatible (no client hooks). Links render as plain anchors so the
 * footer works in any layout without a router dependency.
 */
export interface FooterLink {
  href: string;
  label: string;
}

export interface SiteFooterProps {
  /** Brand name rendered after the copyright year */
  brand: string;
  /** Footer links */
  links: FooterLink[];
}

export function SiteFooter({ brand, links }: SiteFooterProps) {
  return (
    <footer className="border-t site-footer mt-8 md:mt-16">
      <div
        className={cn(
          'mx-auto',
          'max-w-[1536px]',
          'px-4',
          'md:px-8',
          'h-18',
          'flex',
          'flex-col',
          'lg:flex-row',
          'items-center',
          'justify-center',
          'md:justify-between',
          'gap-4',
          'lg:gap-0',
          'text-[clamp(0.875rem,1vw+0.75rem,1rem)]',
          'py-4',
          'lg:py-0'
        )}
      >
        <div className="flex items-center justify-center text-[clamp(0.875rem,1vw+0.75rem,1rem)] text-muted-foreground gap-2">
          &copy; {new Date().getFullYear()} {brand}
        </div>
        <div className="hidden md:flex flex-wrap items-center justify-center gap-2 lg:gap-4 pb-4 lg:pb-0">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:underline underline-offset-4 will-change-auto whitespace-nowrap px-1 sm:px-1.5 py-1 text-[clamp(0.75rem,0.9vw+0.625rem,0.875rem)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
