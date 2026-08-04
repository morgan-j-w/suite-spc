'use client'

import { useState } from 'react'
import { ChevronRight, Lock, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
  // Marks a group as internal-only (e.g. raw HTML/CSS overrides). This is presentation
  // ONLY -- it labels and visually separates the group, it does not gate access. Actually
  // restricting it needs a real role check, which this tool has no concept of yet.
  staffOnly?: boolean
}

// Each settings group is its own card — matching the Build tab's convention (Parent
// Mailgroup, Your Details, each mailgroup category) of one titled card per block, rather
// than several groups sharing one big card separated by dividers.
export function SettingGroup({ title, icon: Icon, action, children, className, collapsible, defaultOpen = false, staffOnly = false }: SettingGroupProps) {
  const [open, setOpen] = useState(!collapsible || defaultOpen)
  const iconCircle = Icon && (
    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', staffOnly ? 'bg-amber-100 dark:bg-amber-950' : 'bg-icon-accent-bg')}>
      <Icon className={cn('h-4 w-4', staffOnly ? 'text-amber-600 dark:text-amber-400' : 'text-icon-accent')} />
    </div>
  )
  const staffBadge = staffOnly && (
    <Badge
      variant="outline"
      className="shrink-0 gap-1 border-amber-300 bg-amber-50 font-normal text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
    >
      <Lock className="h-3 w-3" />
      Staff only
    </Badge>
  )
  return (
    // overflow-hidden so the header's hover fill is clipped to the card's rounded corners
    <Card
      className={cn(
        'gap-0 overflow-hidden py-0',
        // Dashed amber edge so an internal-only card is obviously not part of the normal
        // client-facing set, even before reading the badge.
        staffOnly && 'border-dashed border-amber-300 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10',
        className
      )}
    >
      <div className="flex items-stretch">
        {collapsible ? (
          // The whole header row is the hit target (chevron, title and icon alike), so the
          // hover fill covers the full card the way the Status Pages cards do -- not just
          // the text. Keeps `action` outside the button, since nesting an interactive
          // element inside a button would be invalid.
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/40"
          >
            <ChevronRight className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90')} />
            <p className="min-w-0 truncate text-base font-semibold">{title}</p>
            {staffBadge}
            <span className="flex-1" />
            {iconCircle}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3 px-6 py-4">
            <p className="min-w-0 truncate text-base font-semibold">{title}</p>
            {staffBadge}
            <span className="flex-1" />
            {iconCircle}
          </div>
        )}
        {action && <div className="flex items-center pr-6">{action}</div>}
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
