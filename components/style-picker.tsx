'use client'

import { getStylePreviews } from '@/lib/style-previews'
import type { ColorTheme } from '@/lib/brand-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface StylePickerProps {
  theme: ColorTheme
  value: number | undefined
  onChange: (index: number) => void
  className?: string
  size?: 'sm' | 'default'
  id?: string
}

export function StylePicker({ theme, value, onChange, className, size, id }: StylePickerProps) {
  const stylePreviews = getStylePreviews(theme)
  const selected = value !== undefined && value >= 0 && value < stylePreviews.length ? value : 0

  return (
    <Select value={String(selected)} onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger id={id} size={size} controlColor="var(--border)" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {stylePreviews.map((preview, index) => (
          <SelectItem key={preview.label} value={String(index)}>
            <span className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border"
                style={{ backgroundColor: preview.background }}
              />
              {preview.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
