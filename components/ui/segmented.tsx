'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label?: string
  icon?: LucideIcon
  title?: string
  disabled?: boolean
}

interface SegmentedProps<T extends string> {
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'xs' | 'sm'
  className?: string
}

// The one segmented control. Replaces the ~six hand-rolled `bg-muted p-1` button rows
// that had drifted apart in padding, radius, and selected-state styling.
export function Segmented<T extends string>({ options, value, onChange, size = 'xs', className }: SegmentedProps<T>) {
  return (
    <div className={cn('flex flex-1 gap-1 rounded-md bg-muted p-0.5', className)}>
      {options.map((opt) => {
        const Icon = opt.icon
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.title}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded font-medium transition-colors',
              'disabled:pointer-events-none disabled:opacity-50',
              size === 'xs' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              value === opt.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
