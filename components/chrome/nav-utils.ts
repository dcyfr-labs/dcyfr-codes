import type { ElementType } from "react";

/** Core navigation item consumed by the chrome components */
export interface ChromeNavItem {
  /** Link destination */
  href: string;
  /** Display label */
  label: string;
  /** Short label for compact views */
  shortLabel?: string;
  /** Icon component (e.g. a Lucide icon) */
  icon?: ElementType;
  /** Descriptive text for tooltips/aria labels */
  description?: string;
  /** Whether to prefetch this route */
  prefetch?: boolean;
  /** Whether to match exact path only (vs startsWith) */
  exactMatch?: boolean;
  /** Badge/count to display (for notifications) */
  badge?: number | string;
}

/** Grouped navigation section (mobile drawer) */
export interface ChromeNavSection {
  /** Section identifier */
  id: string;
  /** Section heading */
  label: string;
  /** Section description (for accessibility) */
  description?: string;
  /** Items in this section */
  items: ChromeNavItem[];
}

/**
 * Check if nav item should be active for given pathname
 */
export function isNavItemActive(item: ChromeNavItem, pathname: string): boolean {
  if (item.exactMatch) {
    return pathname === item.href;
  }

  // Handle query params - never highlight dropdown items when on parent page
  if (item.href.includes("?")) {
    return false; // Dropdown items with query params should only highlight when actually clicked
  }

  // For paths, ensure exact match or child route (not just prefix)
  if (pathname === item.href) {
    return true;
  }

  // Only mark as active if it's a true child route (has trailing path segment)
  return pathname.startsWith(item.href + "/");
}

/**
 * Get aria-current value for navigation link
 */
export function getAriaCurrent(
  href: string,
  pathname: string,
  exactMatch?: boolean
): "page" | undefined {
  const isActive = exactMatch
    ? pathname === href
    : pathname.startsWith(href);

  return isActive ? "page" : undefined;
}
