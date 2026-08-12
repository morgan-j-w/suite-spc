'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface UnitInputProps {
  id?: string
  'aria-label'?: string
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
// browser spinners hidden (arrow keys still step).
//
// While you're typing, the raw text is held locally and passed straight through — min/max
// are only applied when the field is committed (blur or Enter). Clamping on every keystroke
// made most values impossible to enter: in a field with min 20, typing "1" as the first
// digit of "150" was immediately rewritten to "20", so you could never get past it. The same
// went for max: the first digit of a large number would snap to the ceiling.
export function UnitInput({ id, 'aria-label': ariaLabel, value, onChange, min, max, placeholder, unit = 'px', prefix, className }: UnitInputProps) {
  // null = not being edited, show whatever the parent holds
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return
    const raw = draft.trim()
    setDraft(null)
    if (raw === '') return onChange(undefined)
    let v = parseInt(raw, 10)
    if (!Number.isFinite(v)) return onChange(undefined)
    if (min !== undefined) v = Math.max(min, v)
    if (max !== undefined) v = Math.min(max, v)
    onChange(v)
  }

  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      {prefix && (
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground/70">
          {prefix}
        </span>
      )}
      <input
        id={id}
        aria-label={ariaLabel}
        type="number"
        min={min}
        max={max}
        value={draft ?? value ?? ''}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value
          setDraft(raw)
          // Still report each keystroke so the live preview keeps up — just unclamped.
          if (raw === '') return onChange(undefined)
          const v = parseInt(raw, 10)
          if (Number.isFinite(v)) onChange(v)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit()
            e.currentTarget.blur()
          }
        }}
        className={cn(
          'h-9 w-full rounded-md border border-input bg-field pr-7 font-mono text-sm tabular-nums text-foreground shadow-xs transition-colors',
          'placeholder:text-muted-foreground/50 hover:border-muted-foreground/40',
          'focus:outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/25',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          prefix ? 'pl-6' : 'pl-2'
        )}
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60">
        {unit}
      </span>
    </div>
  )
}
