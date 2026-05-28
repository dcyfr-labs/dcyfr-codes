"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Pattern source: gameshark-labs/sharkvault/components/animated-counter.tsx
//
// Counts up from 0 to `value` over `durationMs` using requestAnimationFrame.
// Only fires once (on first mount). Cheap, library-free polish that signals
// "this number is live — the page just loaded it." Used inside
// DcyfrStatusMarquee for numeric stats; also useful standalone on dashboard
// tiles, hero stat counters, etc.
//
// Respects `prefers-reduced-motion: reduce` by default — when the user has
// opted out of motion, we render the final value immediately and skip the
// rAF loop entirely. Pass `respectReducedMotion={false}` only if the
// animation is critical to the experience (e.g., a deliberate countdown).
//
// `tabular-nums` is applied unconditionally so the digit columns don't dance
// during the count, even when the wrapping element isn't a mono font.
export interface DcyfrAnimatedCounterProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Final value to count up to. */
  value: number
  /** Animation duration in milliseconds. Defaults to 900. */
  durationMs?: number
  /** Skip animation when reduced-motion is set. Defaults to true. */
  respectReducedMotion?: boolean
  /**
   * Optional formatter applied to the displayed number. Defaults to
   * `n.toLocaleString()`. Useful for compact (`1.2K`) or currency formats.
   */
  format?: (n: number) => string
}

const DcyfrAnimatedCounter = React.forwardRef<
  HTMLSpanElement,
  DcyfrAnimatedCounterProps
>(
  (
    {
      className,
      value,
      durationMs = 900,
      respectReducedMotion = true,
      format,
      ...props
    },
    ref
  ) => {
    const [display, setDisplay] = React.useState(value)
    const startedRef = React.useRef(false)

    React.useEffect(() => {
      if (startedRef.current) return
      startedRef.current = true

      // Animation effect — setDisplay calls below are intentional. The
      // entire purpose of this component is to drive a counter via rAF,
      // which is precisely the "synchronize React state with an external
      // system" pattern useEffect is for. Newer eslint-plugin-react-hooks
      // versions ship a `set-state-in-effect` rule that flags this; this
      // primitive intentionally does not include a disable comment for it
      // because not every consumer's plugin version recognizes the rule
      // (an unknown-rule disable is itself a lint error). Consumers on
      // strict configs should add their own `// eslint-disable-next-line`
      // here or scope an override in their eslint.config.
      if (
        respectReducedMotion &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setDisplay(value)
        return
      }

      if (value <= 0) {
        setDisplay(0)
        return
      }

      let raf = 0
      const start = performance.now()
      setDisplay(0)

      function tick(now: number) {
        const elapsed = now - start
        const t = Math.min(1, elapsed / durationMs)
        // easeOutCubic — fast at first, settles at the target.
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplay(Math.round(value * eased))
        if (t < 1) {
          raf = requestAnimationFrame(tick)
        }
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }, [value, durationMs, respectReducedMotion])

    const formatted = format ? format(display) : display.toLocaleString()

    return (
      <span
        ref={ref}
        data-slot="animated-counter"
        className={cn("tabular-nums", className)}
        {...props}
      >
        {formatted}
      </span>
    )
  }
)
DcyfrAnimatedCounter.displayName = "DcyfrAnimatedCounter"

export { DcyfrAnimatedCounter }
