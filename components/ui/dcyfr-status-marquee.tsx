import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { DcyfrAnimatedCounter } from "@/components/ui/dcyfr-animated-counter"

// Pattern source: gameshark-labs/sharkvault/components/system-status.tsx
// (+ animated-counter.tsx extracted to its own primitive).
//
// Single-line live-stats marquee for site chrome — a horizontal row of
// `{ value, label }` stats with optional per-item counter animation on
// numeric values. Replaces the templated "3-card stat block" with a
// chrome-cohort heartbeat that reads as ambient motion rather than
// content.
//
// Server-rendered shell. Numeric stats with `animate: true` defer to the
// client `DcyfrAnimatedCounter` sub-component (which itself respects
// prefers-reduced-motion). Non-numeric values render as plain text.
//
// Divider variants control the inter-stat seam: `border` (default — a thin
// border-left rule), `dot` (a centered bullet), or `none` (whitespace only).
const dcyfrStatusMarqueeVariants = cva(
  "flex w-full items-center gap-x-4 px-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground overflow-x-auto whitespace-nowrap",
  {
    variants: {
      density: {
        compact: "gap-x-3 py-1.5",
        default: "gap-x-4 py-3",
      },
    },
    defaultVariants: {
      density: "default",
    },
  }
)

export type DcyfrStatusMarqueeStat = {
  /** Display value — number for animated counters, string for literals. */
  value: number | string
  /** Label rendered after the value. */
  label: string
  /**
   * Animate the value with DcyfrAnimatedCounter. Only honored when `value`
   * is a number. Defaults to false.
   */
  animate?: boolean
  /**
   * Optional formatter for the value. Applied to both animated counters
   * and static numeric values. Ignored for string values.
   */
  format?: (n: number) => string
  /**
   * Highlight the value with the brand `--secure` token (the "live signal"
   * accent — same affordance SharkVault uses for the in-pipeline counter).
   */
  highlight?: boolean
}

export interface DcyfrStatusMarqueeProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children">,
    VariantProps<typeof dcyfrStatusMarqueeVariants> {
  /** Ordered list of stats to render. */
  stats: DcyfrStatusMarqueeStat[]
  /** Inter-stat divider style. Defaults to "border". */
  divider?: "border" | "dot" | "none"
  /**
   * ARIA label for the status landmark. Defaults to "Operational status".
   * Override when the marquee surfaces a domain-specific metric set.
   */
  ariaLabel?: string
}

const DcyfrStatusMarquee = React.forwardRef<
  HTMLElement,
  DcyfrStatusMarqueeProps
>(
  (
    {
      className,
      density,
      stats,
      divider = "border",
      ariaLabel = "Operational status",
      ...props
    },
    ref
  ) => {
    if (stats.length === 0) return null

    return (
      <section
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        data-slot="status-marquee"
        className={cn(
          "border-t border-border/60 bg-muted/40",
          className
        )}
        {...props}
      >
        <div className={cn(dcyfrStatusMarqueeVariants({ density }))}>
          {stats.map((stat, i) => (
            <React.Fragment key={`${stat.label}-${i}`}>
              {i > 0 && divider !== "none" && (
                <Divider variant={divider} />
              )}
              <Stat stat={stat} />
            </React.Fragment>
          ))}
        </div>
      </section>
    )
  }
)
DcyfrStatusMarquee.displayName = "DcyfrStatusMarquee"

function Stat({ stat }: { stat: DcyfrStatusMarqueeStat }) {
  const isNumeric = typeof stat.value === "number"
  const valueClass = cn(
    "tabular-nums",
    stat.highlight ? "text-secure" : "text-foreground"
  )

  return (
    <span
      data-slot="status-marquee-stat"
      data-highlight={stat.highlight || undefined}
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
    >
      {isNumeric && stat.animate ? (
        <DcyfrAnimatedCounter
          value={stat.value as number}
          format={stat.format}
          className={valueClass}
        />
      ) : (
        <span className={valueClass}>
          {isNumeric && stat.format
            ? stat.format(stat.value as number)
            : isNumeric
              ? (stat.value as number).toLocaleString()
              : (stat.value as string)}
        </span>
      )}
      <span>{stat.label}</span>
    </span>
  )
}

function Divider({ variant }: { variant: "border" | "dot" }) {
  if (variant === "dot") {
    return (
      <span
        aria-hidden
        data-slot="status-marquee-divider"
        data-variant="dot"
        className="inline-block size-1 rounded-full bg-border"
      />
    )
  }
  return (
    <span
      aria-hidden
      data-slot="status-marquee-divider"
      data-variant="border"
      className="inline-block h-3 w-px bg-border"
    />
  )
}

export { DcyfrStatusMarquee, dcyfrStatusMarqueeVariants }
