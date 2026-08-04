'use client'

import type { PaddingBox } from '@/lib/subscription-centre'
import { Segmented } from '@/components/ui/segmented'
import { SettingRow } from '@/components/setting-row'
import { PaddingBoxControl } from '@/components/ui/padding-box-control'

export type PaddingValue = number | 'compact' | 'spacious' | PaddingBox | undefined

interface PaddingControlProps {
  value: PaddingValue
  onChange: (v: PaddingValue) => void
  // What the four inputs should start from when someone first switches to Custom — pass
  // whatever "Normal" actually resolves to for this section, so the values don't jump.
  normalBox: PaddingBox
  idPrefix: string
  label?: string
  max?: number
}

// Presets plus a per-side Custom mode, shared by every section padding setting (Design
// banner/footer, Emails banner/footer, and the email container) so they all behave the
// same. Presets scale the layout's own defaults; Custom hands over all four sides.
export function PaddingControl({
  value,
  onChange,
  normalBox,
  idPrefix,
  label = 'Padding',
  max = 400,
}: PaddingControlProps) {
  const isPerSide = !!value && typeof value === 'object'
  const mode: 'compact' | 'normal' | 'spacious' | 'custom' =
    isPerSide || typeof value === 'number' ? 'custom' : (value ?? 'normal')
  const box = isPerSide ? (value as PaddingBox) : normalBox

  return (
    <div className="space-y-2.5">
      <SettingRow label={label}>
        <Segmented
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'normal', label: 'Normal' },
            { value: 'spacious', label: 'Spacious' },
            { value: 'custom', label: 'Custom' },
          ]}
          value={mode}
          onChange={(v) => {
            if (v === 'custom') onChange({ ...box })
            else if (v === 'normal') onChange(undefined)
            else onChange(v)
          }}
        />
      </SettingRow>

      {mode === 'custom' && (
        <div className="space-y-2.5 rounded-lg border bg-muted/30 p-3">
          <p className="text-sm text-muted-foreground">Set each side independently.</p>
          <PaddingBoxControl value={box} onChange={onChange} idPrefix={idPrefix} max={max} />
        </div>
      )}
    </div>
  )
}
