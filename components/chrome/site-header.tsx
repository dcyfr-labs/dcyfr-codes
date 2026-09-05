'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { ThemeToggle, type ThemeName } from './theme-toggle';
import { MobileNav } from './mobile-nav';
import { cn } from '@/lib/utils';
import {
  isNavItemActive,
  getAriaCurrent,
  type ChromeNavItem,
  type ChromeNavSection,
} from './nav-utils';
import { useDropdown } from '@/hooks/use-dropdown';
import { useMediaQuery } from '@/hooks/use-media-query';

/**
 * Site Header Component
 *
 * Main navigation header with responsive design and accessibility
 *
 * Features:
 * - Desktop: Horizontal nav with config-driven dropdown menus
 * - Mobile: Hamburger menu
 * - Sticky positioning with backdrop blur
 * - Hides when scrolling down, shows when scrolling up (maximizes content visibility)
 * - Always visible at top of page
 * - Keyboard navigation support
 * - SEO-optimized structure
 */
export interface HeaderDropdown {
  /** Accessible label for the trigger button (e.g. "Blog menu") */
  ariaLabel: string;
  /** Pathname prefix that marks the trigger active (e.g. "/blog") */
  activePrefix: string;
  /** Menu items */
  items: ChromeNavItem[];
  /** Render a divider after this item index */
  dividerAfterIndex?: number;
}

export interface HeaderNavItem extends ChromeNavItem {
  /** When set, the item renders as a dropdown menu instead of a link */
  dropdown?: HeaderDropdown;
}

export interface SiteHeaderProps {
  /** Site logo (wrapped in a home link) */
  logo: React.ReactNode;
  /** Accessible label for the home link */
  logoAriaLabel: string;
  /** Desktop navigation items ("/" is skipped — home is the logo) */
  links: HeaderNavItem[];
  /** Extra actions rendered before the theme toggle (e.g. a search button) */
  actions?: React.ReactNode;
  /** Sectioned navigation for the mobile drawer */
  mobileNavSections: ChromeNavSection[];
  /** Mobile drawer title */
  mobileNavTitle?: string;
  /** Optional callback fired after the theme changes (e.g. analytics) */
  onThemeChange?: (theme: ThemeName) => void;
}

function HeaderDropdownItem({
  item,
  config,
  pathname,
}: {
  item: HeaderNavItem;
  config: HeaderDropdown;
  pathname: string;
}) {
  const dropdown = useDropdown();

  return (
    <div ref={dropdown.ref} className="relative">
      <button
        {...dropdown.triggerProps}
        className={cn(
          'flex items-center justify-center h-full gap-1 px-1.5 sm:px-2 hover:underline underline-offset-4 will-change-auto touch-target',
          'transition-base',
          pathname.startsWith(config.activePrefix) && 'text-primary font-medium'
        )}
        aria-label={config.ariaLabel}
        aria-expanded={dropdown.isOpen}
        aria-haspopup="menu"
      >
        {item.label}
        <ChevronDown
          className={cn(
            'w-[clamp(0.875rem,1vw+0.75rem,1rem)] h-[clamp(0.875rem,1vw+0.75rem,1rem)]',
            'transition-fast',
            dropdown.isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      {dropdown.isOpen && (
        <div
          {...dropdown.contentProps}
          className="absolute top-full left-0 mt-2 w-52 rounded-lg border bg-card p-1.5 shadow-xl z-50"
          role="menu"
        >
          {config.items.map((menuItem, index) => {
            const isActive = isNavItemActive(menuItem, pathname);
            return (
              <div key={menuItem.href}>
                <Link
                  href={menuItem.href}
                  className={cn(
                    'block px-3 py-2.5 text-[clamp(0.875rem,1vw+0.75rem,1rem)] rounded-md',
                    'transition-base',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive && 'bg-accent/50 font-medium'
                  )}
                  onClick={dropdown.close}
                  role="menuitem"
                  aria-label={menuItem.description}
                  prefetch={false}
                >
                  <div className="font-medium">{menuItem.label}</div>
                  {menuItem.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {menuItem.description}
                    </div>
                  )}
                </Link>
                {index === config.dividerAfterIndex && <hr className="my-1.5" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SiteHeader({
  logo,
  logoAriaLabel,
  links,
  actions,
  mobileNavSections,
  mobileNavTitle,
  onThemeChange,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  // Toggle `inert` on responsive variants whose CSS hides them but leaves
  // their links/buttons in the DOM — keeps focus + AT consistent with what
  // the user actually sees, and stops focus tests from picking up phantoms.
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleLogoClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    },
    [pathname]
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100; // Minimum scroll distance to trigger hide/show

      // Always show when at the top of the page
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 site-header',
        'backdrop-blur supports-backdrop-filter:bg-background/95 border-b',
        'transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
      aria-hidden={!isVisible}
    >
      <div
        className={cn(
          'mx-auto',
          'max-w-[1536px]',
          'px-4 md:px-8',
          'h-18',
          'flex items-center gap-2 lg:relative'
        )}
      >
        {/* Logo - always visible */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className={cn('touch-target', 'shrink-0', '-ml-2', 'flex', 'items-center', 'lg:mr-auto')}
          aria-label={logoAriaLabel}
        >
          {logo}
        </Link>

        {/* Desktop Navigation - hidden on mobile, visible md and up */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center justify-center gap-1 sm:gap-3 md:gap-4 text-[clamp(0.875rem,1vw+0.75rem,1rem)] h-full lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2"
          inert={!isDesktop}
        >
          {links
            .filter((item) => item.href !== '/') // Home handled by logo
            .map((item) => {
              if (item.dropdown) {
                return (
                  <HeaderDropdownItem
                    key={item.href}
                    item={item}
                    config={item.dropdown}
                    pathname={pathname}
                  />
                );
              }
              const isActive = isNavItemActive(item, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-center h-full px-1.5 sm:px-2 hover:underline underline-offset-4 will-change-auto touch-target',
                    'transition-base',
                    isActive && 'text-primary font-medium'
                  )}
                  aria-current={getAriaCurrent(item.href, pathname, item.exactMatch)}
                  aria-label={item.description}
                  prefetch={item.prefetch}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Desktop Icon Links - visible md and up */}
        <div
          className="hidden md:flex items-center gap-2 shrink-0 ml-auto lg:ml-0"
          inert={!isDesktop}
        >
          {actions}
          <ThemeToggle onThemeChange={onThemeChange} />
        </div>

        {/* Mobile Navigation - visible on mobile, hidden md and up */}
        <div className="flex md:hidden items-center gap-2 ml-auto" inert={isDesktop}>
          {actions}
          <ThemeToggle onThemeChange={onThemeChange} />
          <MobileNav
            sections={mobileNavSections}
            title={mobileNavTitle}
            onThemeChange={onThemeChange}
          />
        </div>
      </div>
    </header>
  );
}
