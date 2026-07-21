'use client'

import { colorThemes, type ColorTheme } from '@/lib/brand-config'
import { getThemeBrandColors } from '@/lib/style-previews'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ThemePresetPickerProps {
  value: ColorTheme
  onChange: (theme: ColorTheme) => void
}

// A light, a mid, and the three strongest colours — enough to tell themes apart at a
// glance without rendering the full 8-swatch palette in every row.
function ThemeSwatches({ theme }: { theme: ColorTheme }) {
  const colors = getThemeBrandColors(theme)
  const picks = [1, 4, 5, 6, 7].map((i) => colors[i]).filter(Boolean)
  return (
    <span className="flex shrink-0 items-center gap-1">
      {picks.map(({ hex, label }) => (
        <span
          key={label}
          title={label}
          className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
          style={{ background: hex }}
        />
      ))}
    </span>
  )
}

export function ThemePresetPicker({ value, onChange }: ThemePresetPickerProps) {
  return (
    <Select value={value} onValueChange={(next: ColorTheme) => onChange(next)}>
      <SelectTrigger id="theme-preset" aria-label="Theme" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(colorThemes) as ColorTheme[]).map((themeKey) => (
          <SelectItem key={themeKey} value={themeKey}>
            <ThemeSwatches theme={themeKey} />
            {colorThemes[themeKey].name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
