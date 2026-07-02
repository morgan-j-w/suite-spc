'use client'

import { colorThemes, type ColorTheme } from '@/lib/brand-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ThemePresetPickerProps {
  value: ColorTheme
  onChange: (theme: ColorTheme) => void
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
            {colorThemes[themeKey].name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
