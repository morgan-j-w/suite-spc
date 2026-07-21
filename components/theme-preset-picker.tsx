'use client'

import { colorThemes, type ColorTheme } from '@/lib/brand-config'
import { getThemeBrandColors } from '@/lib/style-previews'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ThemePresetPickerProps {
  value: ColorTheme
  onChange: (theme: ColorTheme) => void
}

// The four hue-carrying slots (light1, light2, warm, brand) plus the dark anchor.
// Grey and charcoal are skipped — they're near-identical across themes and would
// crowd out the accent colours that actually distinguish one palette from another.
function ThemeSwatches({ theme }: { theme: ColorTheme }) {
  const colors = getThemeBrandColors(theme)
  const picks = [1, 2, 3, 5, 7].map((i) => colors[i]).filter(Boolean)
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
