"use client"

import * as React from "react"

import {
  DcyfrCommandPalette,
  type DcyfrCommandPaletteCommand,
} from "@/components/dcyfr-command-palette/command-palette"

// Pattern source: gameshark-labs/sharkvault/components/command-palette.tsx
//
// Provider component — mounts the palette dialog once and owns the
// global cmd+k / ctrl+k keyboard binding. Wrap your app root with this to
// expose the palette site-wide; pass the command set declaratively.
//
// The provider also exposes an imperative `useDcyfrCommandPalette()` hook
// so nested components can open the palette programmatically (e.g., a
// "Open command palette" button in the nav).
//
// Platform detection for the trigger:
//   - macOS: ⌘+K
//   - everywhere else: Ctrl+K
// This matches the OS-native expectation and avoids the awkward double-
// bind where the wrong shortcut intercepts a browser default.

export interface DcyfrCommandPaletteContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const DcyfrCommandPaletteContext =
  React.createContext<DcyfrCommandPaletteContextValue | null>(null)

export interface DcyfrCommandPaletteProviderProps {
  /** Commands the palette will render. */
  commands: DcyfrCommandPaletteCommand[]
  /** Input placeholder text. */
  placeholder?: string
  /** Empty-state message when the filter yields no matches. */
  emptyMessage?: string
  /**
   * Disable the global cmd+k / ctrl+k binding. Useful when the consuming
   * app already owns the shortcut and only wants the imperative API.
   * Defaults to false.
   */
  disableShortcut?: boolean
  /** App content rendered alongside the palette. */
  children: React.ReactNode
}

function DcyfrCommandPaletteProvider({
  commands,
  placeholder,
  emptyMessage,
  disableShortcut = false,
  children,
}: DcyfrCommandPaletteProviderProps) {
  const [open, setOpen] = React.useState(false)

  const toggle = React.useCallback(() => {
    setOpen((v) => !v)
  }, [])

  // Bind the global shortcut. cmdk's <Command.Dialog> handles ESC and
  // click-outside internally, so the only binding we own here is the
  // open/toggle key.
  React.useEffect(() => {
    if (disableShortcut) return

    function onKey(e: KeyboardEvent) {
      // Only the bare cmd/ctrl + k combo opens the palette — modifier
      // pile-ups like ⌘⇧K (browser DevTools toggle) should pass through
      // to the browser untouched.
      const isToggle =
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k" &&
        !e.shiftKey &&
        !e.altKey
      if (isToggle) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle, disableShortcut])

  const value = React.useMemo<DcyfrCommandPaletteContextValue>(
    () => ({ open, setOpen, toggle }),
    [open, toggle]
  )

  return (
    <DcyfrCommandPaletteContext.Provider value={value}>
      {children}
      <DcyfrCommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={commands}
        placeholder={placeholder}
        emptyMessage={emptyMessage}
      />
    </DcyfrCommandPaletteContext.Provider>
  )
}
DcyfrCommandPaletteProvider.displayName = "DcyfrCommandPaletteProvider"

/**
 * Access the palette's imperative open/close API from within the
 * provider's tree. Throws if used outside a DcyfrCommandPaletteProvider —
 * matching the shadcn dialog / context-hook convention.
 */
function useDcyfrCommandPalette(): DcyfrCommandPaletteContextValue {
  const ctx = React.useContext(DcyfrCommandPaletteContext)
  if (!ctx) {
    throw new Error(
      "useDcyfrCommandPalette must be used within a DcyfrCommandPaletteProvider"
    )
  }
  return ctx
}

export {
  DcyfrCommandPaletteProvider,
  DcyfrCommandPaletteContext,
  useDcyfrCommandPalette,
}
