'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingRowProps {
  label: string
  children: React.ReactNode
  dimmed?: boolean
  className?: string
}

// One settings row: fixed-width label on the left, control filling the rest.
// `dimmed` greys out and disables the row (e.g. border colour when border is off).
export function SettingRow({ label, children, dimmed, className }: SettingRowProps) {
  return (
    <div className={cn('flex items-center gap-3 transition-opacity', dimmed && 'pointer-events-none opacity-40', className)}>
      <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
    </div>
  )
}

interface SettingGroupProps {
  title: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
  // Collapsible groups render a chevron and hide their content until opened. The rule of
  // thumb across editors: the group you touch constantly (Layout) starts open, everything
  // else starts collapsed so a panel reads as ~6 titled rows instead of ~25 raw controls.
  collapsible?: boolean
  defaultOpen?: boolean
}

// Group header inside a flattened settings card — replaces the old nested
// `rounded-lg border p-3` sub-cards with a divider-and-title rhythm.
export function SettingGroup({ title, action, children, className, collapsible, defaultOpen = false }: SettingGroupProps) {
  const [open, setOpen] = useState(!collapsible || defaultOpen)
  return (
    <div className={cn('space-y-2.5 border-t border-border/70 pt-4 first:border-t-0 first:pt-0', className)}>
      <div className="flex items-center justify-between gap-2">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="-m-1 flex min-w-0 flex-1 items-center gap-1.5 rounded p-1 text-left transition-colors hover:bg-muted/60"
          >
            <ChevronRight className={cn('h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90')} />
            <p className="truncate text-[13px] font-semibold">{title}</p>
          </button>
        ) : (
          <p className="text-[13px] font-semibold">{title}</p>
        )}
        {action}
      </div>
      {(!collapsible || open) && children}
    </div>
  )
}
