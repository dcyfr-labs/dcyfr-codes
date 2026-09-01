"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Variants live on the TabsList + TabsTrigger pair; the Root + Content stay
// structural so consumers can switch visual variants without reparenting.
const dcyfrTabsListVariants = cva(
  "inline-flex w-fit items-center",
  {
    variants: {
      variant: {
        default:
          "h-9 justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
        pill:
          "h-10 justify-center gap-1 rounded-full bg-muted/60 p-1 text-muted-foreground",
        underline:
          "h-10 justify-start gap-4 border-b border-border bg-transparent px-0 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const dcyfrTabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-[color,box-shadow,background] duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "h-[calc(100%-1px)] flex-1 rounded-md border border-transparent px-2 py-1 text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30",
        pill:
          "h-8 rounded-full px-4 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
        underline:
          "relative h-10 rounded-none border-b-2 border-transparent px-1 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function DcyfrTabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

type DcyfrTabsListProps = React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof dcyfrTabsListVariants>

function DcyfrTabsList({ className, variant, ...props }: DcyfrTabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant ?? "default"}
      className={cn(dcyfrTabsListVariants({ variant, className }))}
      {...props}
    />
  )
}

type DcyfrTabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof dcyfrTabsTriggerVariants>

function DcyfrTabsTrigger({
  className,
  variant,
  ...props
}: DcyfrTabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={variant ?? "default"}
      className={cn(dcyfrTabsTriggerVariants({ variant, className }))}
      {...props}
    />
  )
}

function DcyfrTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-hidden", className)}
      {...props}
    />
  )
}

export {
  DcyfrTabs,
  DcyfrTabsList,
  DcyfrTabsTrigger,
  DcyfrTabsContent,
  dcyfrTabsListVariants,
  dcyfrTabsTriggerVariants,
}
