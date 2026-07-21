'use client'

import { cn } from '@/lib/utils'

interface UnitInputProps {
  value: number | undefined
  onChange: (v: number | undefined) => void
  min?: number
  max?: number
  placeholder?: string
  unit?: string
  // Tiny leading letter for paired dimension fields (e.g. "W" / "H")
  prefix?: string
  className?: string
}

// Compact inspector-style number field: unit rendered inside the input's right edge,
// browser spinners hidden (arrow keys still step), value clamped to min/max on change.
export function UnitInput({ value, onChange, min, max, placeholder, unit = 'px', prefix, className }: UnitInputProps) {
  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      {prefix && (
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground/70">
          {prefix}
        </span>
      )}
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value === '') return onChange(undefined)
          let v = parseInt(e.target.value, 10)
          if (!Number.isFinite(v)) return onChange(undefined)
          if (min !== undefined) v = Math.max(min, v)
          if (max !== undefined) v = Math.min(max, v)
          onChange(v)
        }}
        className={cn(
          'h-7 w-full rounded-md border border-input bg-background pr-7 font-mono text-xs tabular-nums text-foreground shadow-xs transition-colors',
          'placeholder:text-muted-foreground/50 hover:border-muted-foreground/40',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          prefix ? 'pl-6' : 'pl-2'
        )}
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/60">
        {unit}
      </span>
    </div>
  )
}
