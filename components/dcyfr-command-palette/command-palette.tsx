"use client"

import * as React from "react"
import { Command } from "cmdk"
import { cva, type VariantProps } from "class-variance-authority"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Pattern source: gameshark-labs/sharkvault/components/command-palette.tsx
//
// Generic cmdk-backed command palette UI. The provider (see
// command-palette-provider.tsx) owns open/close state + the keyboard
// shortcut; this component owns the dialog chrome and rendering. Consumers
// pass a flat `Command[]` array of declarative entries; the palette
// dispatches `run()` for local actions or navigates via `href` for routes.
//
// cmdk's <Command.Dialog> handles:
//   - focus trap while open
//   - ESC to close (via onOpenChange)
//   - focus restoration to the trigger element on close
//   - arrow / enter keyboard nav across CommandItem children
//
// Click-outside is handled by the cmdk overlay (rendered via Radix Dialog
// under the hood). Filtering is built-in via the cmdk `CommandInput` —
// matches on `value` and the visible text of each `CommandItem`.
const dcyfrCommandPaletteContentVariants = cva(
  "fixed left-[50%] top-[20%] z-50 grid w-full max-w-xl translate-x-[-50%] overflow-hidden rounded-xl border shadow-2xl",
  {
    variants: {
      variant: {
        default: "bg-popover text-popover-foreground border-border",
        secure:
          "bg-popover text-popover-foreground ring-1 ring-secure/30 border-secure/20",
        glass:
          "bg-popover/80 backdrop-blur-md text-popover-foreground border-border/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type DcyfrCommandPaletteCommandBase = {
  /** Stable identifier. Also used as the cmdk value (governs filter match). */
  id: string
  /** Visible label rendered in the result row. */
  label: string
  /** Optional secondary text (e.g., "Go to dashboard"). */
  hint?: string
  /** Optional leading icon component (lucide-style: accepts `className`). */
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Command-palette entry. Discriminated union — exactly one of `run` XOR
 * `href` is required. Compile-time guarantee against action-less commands
 * that would silently no-op at click time.
 */
export type DcyfrCommandPaletteCommand = DcyfrCommandPaletteCommandBase &
  (
    | {
        /** Local action. Mutually exclusive with `href`. */
        run: () => void
        href?: never
      }
    | {
        /** Navigate to a URL. Mutually exclusive with `run`. */
        href: string
        run?: never
      }
  )

export interface DcyfrCommandPaletteProps
  extends VariantProps<typeof dcyfrCommandPaletteContentVariants> {
  /** Controlled open state. */
  open: boolean
  /** Open-state setter — also fires on ESC + click-outside. */
  onOpenChange: (open: boolean) => void
  /** Commands to render. */
  commands: DcyfrCommandPaletteCommand[]
  /** Input placeholder text. */
  placeholder?: string
  /** Empty-state message when filter yields no matches. */
  emptyMessage?: string
  /**
   * Optional className applied to the dialog content shell. Use sparingly —
   * the default chrome matches the dcyfr design tokens out of the box.
   */
  className?: string
}

function DcyfrCommandPalette({
  open,
  onOpenChange,
  commands,
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  variant,
  className,
}: DcyfrCommandPaletteProps) {
  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      data-slot="command-palette"
      className={cn(
        dcyfrCommandPaletteContentVariants({ variant, className })
      )}
      // cmdk renders an overlay automatically; style it to match the
      // dcyfr-dialog overlay so the palette feels part of the same family.
      overlayClassName="fixed inset-0 z-50 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    >
      <div
        data-slot="command-palette-input"
        className="flex items-center gap-3 border-b border-border px-4 py-3"
      >
        <SearchIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <Command.Input
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          esc
        </kbd>
      </div>

      <Command.List
        data-slot="command-palette-list"
        className="max-h-[60vh] overflow-y-auto p-1"
      >
        <Command.Empty
          data-slot="command-palette-empty"
          className="px-4 py-6 text-center text-sm text-muted-foreground"
        >
          {emptyMessage}
        </Command.Empty>
        {commands.map((cmd) => (
          <CommandRow
            key={cmd.id}
            command={cmd}
            onActivate={() => {
              // Close first — cmdk restores focus to the trigger on close,
              // and navigations want focus released cleanly before they fire.
              onOpenChange(false)
              if (cmd.run) {
                cmd.run()
              } else if (cmd.href) {
                // Use the platform navigation primitive — consumers can swap
                // in next/navigation's useRouter via a custom `run` if they
                // need client-side routing.
                if (typeof window !== "undefined") {
                  window.location.href = cmd.href
                }
              }
            }}
          />
        ))}
      </Command.List>
    </Command.Dialog>
  )
}
DcyfrCommandPalette.displayName = "DcyfrCommandPalette"

function CommandRow({
  command,
  onActivate,
}: {
  command: DcyfrCommandPaletteCommand
  onActivate: () => void
}) {
  const Icon = command.icon
  // Build a match string so cmdk's filter matches on label + hint without
  // forcing the user to remember exact id strings.
  const matchValue = [command.label, command.hint ?? ""]
    .join(" ")
    .toLowerCase()

  return (
    <Command.Item
      value={`${command.id} ${matchValue}`}
      onSelect={onActivate}
      data-slot="command-palette-item"
      className="flex cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:opacity-50"
    >
      {Icon && (
        <Icon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden={true}
        />
      )}
      <span className="min-w-0 flex-1 truncate font-medium">
        {command.label}
      </span>
      {command.hint && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {command.hint}
        </span>
      )}
    </Command.Item>
  )
}

export { DcyfrCommandPalette, dcyfrCommandPaletteContentVariants }
