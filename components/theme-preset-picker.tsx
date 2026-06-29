'use client'

import { colorThemes, type ColorTheme } from '@/lib/brand-config'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ThemePresetPickerProps {
  value: ColorTheme
  onChange: (theme: ColorTheme) => void
}

export function ThemePresetPicker({ value, onChange }: ThemePresetPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="theme-preset">Theme</Label>
      <Select value={value} onValueChange={(next: ColorTheme) => onChange(next)}>
        <SelectTrigger id="theme-preset" className="w-full sm:w-80">
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
      <p className="text-sm text-muted-foreground">{colorThemes[value].description}</p>
    </div>
  )
}
