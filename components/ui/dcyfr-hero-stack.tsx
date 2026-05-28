import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Pattern source: gameshark-labs/sharkvault/components/hero-cover-deck.tsx
//
// Decorative fanned trio for a landing hero — three cards overlapping in a
// shallow fan, with a pure-CSS hover spread for an ambient "dynamic deck"
// cue. Server component, zero client JS.
//
// Generic over `children` — consumers pass exactly three React nodes
// (snippet preview cards, template thumbnails, agent cards, etc.). The
// primitive controls the fan geometry + hover transition only; visual
// styling of each card slot is the consumer's call.
//
// Accessibility default is decorative (aria-hidden). Real affordances
// should live alongside the deck (hero CTAs, list views). Pass
// `ariaLabel` only when the deck IS the meaningful content for AT.
const dcyfrHeroStackVariants = cva(
  "group relative mx-auto select-none",
  {
    variants: {
      size: {
        sm: "h-[300px] w-full max-w-[340px]",
        md: "h-[380px] w-full max-w-[420px]",
        lg: "h-[460px] w-full max-w-[500px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface DcyfrHeroStackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "aria-label">,
    VariantProps<typeof dcyfrHeroStackVariants> {
  /** Exactly three card slots — back-left, back-right, front-center. */
  cards: [React.ReactNode, React.ReactNode, React.ReactNode]
  /**
   * Accessible label when the deck is meaningful content. When omitted,
   * the deck is decorative (`aria-hidden`) — the default, since hero
   * CTAs usually carry the real affordances.
   */
  ariaLabel?: string
}

const DcyfrHeroStack = React.forwardRef<HTMLDivElement, DcyfrHeroStackProps>(
  ({ className, size, cards, ariaLabel, ...props }, ref) => {
    const [a, b, c] = cards
    const decorative = ariaLabel === undefined

    return (
      <div
        ref={ref}
        data-slot="hero-stack"
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : ariaLabel}
        role={decorative ? undefined : "group"}
        className={cn(dcyfrHeroStackVariants({ size, className }))}
        {...props}
      >
        {/* Back-left — rotated out, sits behind. */}
        <DeckSlot
          position="back-left"
          className="w-40 -translate-x-[4.5rem] translate-y-3 -rotate-[14deg] group-hover:-translate-x-[5.75rem] group-hover:-rotate-[18deg]"
        >
          {a}
        </DeckSlot>
        {/* Back-right — mirror of back-left. */}
        <DeckSlot
          position="back-right"
          className="w-40 translate-x-[4.5rem] translate-y-3 rotate-[14deg] group-hover:translate-x-[5.75rem] group-hover:rotate-[18deg]"
        >
          {b}
        </DeckSlot>
        {/* Front-center — upright, lifted, on top. */}
        <DeckSlot
          position="front-center"
          className="z-10 w-44 -translate-y-2 group-hover:-translate-y-3.5"
        >
          {c}
        </DeckSlot>
      </div>
    )
  }
)
DcyfrHeroStack.displayName = "DcyfrHeroStack"

function DeckSlot({
  position,
  className,
  children,
}: {
  position: "back-left" | "back-right" | "front-center"
  className: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="hero-stack-slot"
      data-position={position}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div
        className={cn(
          "rounded-md ring-1 ring-border/50 shadow-2xl shadow-foreground/20",
          "transition-transform duration-300 ease-out",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { DcyfrHeroStack, dcyfrHeroStackVariants }
