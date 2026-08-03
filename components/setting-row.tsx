'use client'

import { useState } from 'react'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
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
      <span className="w-32 flex-shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
    </div>
  )
}

interface SettingGroupProps {
  title: string
  // Shown in a tinted circle on the right of the header, matching the Status Pages cards —
  // lets a collapsed stack be recognised at a glance (Colours, Logo, Text, ...) instead of
  // read. Keep the icon-to-concept mapping consistent across every editor that uses
  // SettingGroup, or it stops being a shortcut.
  icon?: LucideIcon
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
  // Collapsible groups render a chevron and hide their content until opened. The rule of
  // thumb across editors: the first group starts open so a panel never reads as an inert
  // wall of closed rows, and everything below it starts collapsed.
  collapsible?: boolean
  defaultOpen?: boolean
}

// Each settings group is its own card — matching the Build tab's convention (Parent
// Mailgroup, Your Details, each mailgroup category) of one titled card per block, rather
// than several groups sharing one big card separated by dividers.
export function SettingGroup({ title, icon: Icon, action, children, className, collapsible, defaultOpen = false }: SettingGroupProps) {
  const [open, setOpen] = useState(!collapsible || defaultOpen)
  const iconCircle = Icon && (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
      <Icon className="h-4 w-4 text-primary" />
    </div>
  )
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded p-1 text-left transition-colors hover:bg-muted/60"
          >
            <ChevronRight className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90')} />
            <p className="truncate text-base font-semibold">{title}</p>
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <p className="truncate text-base font-semibold">{title}</p>
          </div>
        )}
        {action}
        {iconCircle}
      </div>
      {/* 0fr→1fr grid transition animates to the content's natural height; children stay
          mounted so open/close also preserves any in-progress input state */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          !collapsible || open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'space-y-2.5 px-6 pb-6 transition-opacity duration-200',
              collapsible && !open && 'opacity-0'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </Card>
  )
}
