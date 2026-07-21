'use client'

import { Segmented } from '@/components/ui/segmented'
import { UnitInput } from '@/components/ui/unit-input'

// Shared by every "padding/spacing" setting in the app (Design > Style card padding/
// spacing, Design > Banner/Footer section padding, Emails > Banner/Footer section
// padding): undefined means "normal" (the layout's own built-in default), so existing
// saved centres with no value set keep looking the same. The literal 'normal' is also
// accepted on read (CardStyle's padding/spacing used to store it explicitly) but this
// control always writes undefined for it going forward.
export type SizeValue = 'compact' | 'normal' | 'spacious' | number | undefined

interface SizeControlProps {
  value: SizeValue
  onChange: (v: SizeValue) => void
  // Pre-filled in the number field the moment someone switches to Custom, so the value
  // doesn't jump to 0px — pass whatever px "Normal" actually resolves to here.
  defaultCustomValue: number
  min?: number
  max?: number
  unit?: string
}

const OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'spacious', label: 'Spacious' },
  { value: 'custom', label: 'Custom' },
] as const

export function SizeControl({ value, onChange, defaultCustomValue, min = 0, max = 200, unit }: SizeControlProps) {
  const isCustom = typeof value === 'number'
  const segValue: 'compact' | 'normal' | 'spacious' | 'custom' = isCustom ? 'custom' : (value ?? 'normal')

  return (
    <div className="w-full space-y-2">
      <Segmented
        options={OPTIONS}
        value={segValue}
        onChange={(v) => {
          if (v === 'custom') onChange(defaultCustomValue)
          else if (v === 'normal') onChange(undefined)
          else onChange(v)
        }}
      />
      {isCustom && (
        <UnitInput min={min} max={max} unit={unit} value={value} onChange={(v) => onChange(v ?? 0)} />
      )}
    </div>
  )
}
