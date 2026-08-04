'use client'

import type { PaddingBox } from '@/lib/subscription-centre'
import { UnitInput } from '@/components/ui/unit-input'

interface PaddingBoxControlProps {
  value: PaddingBox
  onChange: (v: PaddingBox) => void
  idPrefix: string
  max?: number
}

// Lays the four sides out where they actually apply — top above, bottom below, left and
// right either side of a placeholder box — so you can see which field you're editing
// without reading the labels. Reads far quicker than a flat list of four numbers.
export function PaddingBoxControl({ value, onChange, idPrefix, max = 400 }: PaddingBoxControlProps) {
  const set = (side: keyof PaddingBox, v?: number) => onChange({ ...value, [side]: v ?? 0 })

  const field = (side: keyof PaddingBox) => (
    <UnitInput
      id={`${idPrefix}-${side}`}
      aria-label={side}
      min={0}
      max={max}
      value={value[side]}
      onChange={(v) => set(side, v)}
      className="w-20 flex-none"
    />
  )

  return (
    <div className="flex flex-col items-center gap-1.5">
      {field('top')}
      <div className="flex items-center gap-1.5">
        {field('left')}
        {/* Stand-in for the content the padding surrounds — gives the four fields
            something to sit around so their positions read as meaningful. */}
        <div className="flex h-9 w-16 items-center justify-center rounded-md border border-dashed bg-muted/40 text-xs text-muted-foreground">
          Content
        </div>
        {field('right')}
      </div>
      {field('bottom')}
    </div>
  )
}
