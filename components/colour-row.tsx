'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ColorTheme } from '@/lib/brand-config'
import { getThemeBrandColors } from '@/lib/style-previews'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Semantic CSS vars — ordered light → role → dark so they sit naturally next to brand hex values
export const SWATCHES = [
  { cssVar: 'var(--background)',         label: 'Background' },
  { cssVar: 'var(--card)',               label: 'Card' },
  { cssVar: 'var(--muted)',              label: 'Muted' },
  { cssVar: 'var(--muted-foreground)',   label: 'Muted text' },
  { cssVar: 'var(--secondary)',          label: 'Secondary' },
  { cssVar: 'var(--accent)',             label: 'Accent' },
  { cssVar: 'var(--accent-foreground)',  label: 'Accent text' },
  { cssVar: 'var(--primary)',            label: 'Primary' },
  { cssVar: 'var(--primary-foreground)', label: 'Primary text' },
  { cssVar: 'var(--foreground)',         label: 'Foreground' },
] as const

const DOT = (selected: boolean) =>
  cn(
    'h-5 w-5 flex-shrink-0 rounded-full border transition-all',
    selected
      ? 'border-foreground scale-110 ring-2 ring-foreground ring-offset-1 ring-offset-popover'
      : 'border-foreground/10 hover:border-foreground/40 hover:scale-110'
  )

function resolveLabel(value: string, brandColors: { hex: string; label: string }[]): string {
  const cssMatch = SWATCHES.find((s) => s.cssVar === value)
  if (cssMatch) return cssMatch.label
  const brandMatch = brandColors.find((c) => c.hex === value)
  if (brandMatch) return brandMatch.label
  return value
}

// Brand palette display order: lights first, then mids, brand colour, then darks
const BRAND_ROLE_DISPLAY_ORDER = ['white', 'light1', 'light2', 'warm', 'grey', 'brand', 'charcoal', 'dark'] as const

export function ColorRow({
  label,
  value,
  onChange,
  themeId,
}: {
  label: string
  value?: string
  onChange: (v?: string) => void
  themeId: ColorTheme
}) {
  const [hexDraft, setHexDraft] = useState('')
  const brandColors = getThemeBrandColors(themeId)
  const isCustom = typeof value === 'string' && !value.startsWith('var(--') && !brandColors.some(c => c.hex === value)
  const isBrandHex = typeof value === 'string' && brandColors.some(c => c.hex === value)
  const displayLabel = value == null ? 'Auto' : resolveLabel(value, brandColors)

  return (
    <div className="flex items-center gap-3">
      {label && <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">{label}</span>}

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-2 text-left shadow-xs transition-colors hover:border-muted-foreground/40"
          >
            <span data-color-theme={!isCustom ? themeId : undefined} className="flex-shrink-0">
              {value ? (
                <span
                  style={{ background: value }}
                  className="block h-4 w-4 rounded-sm border border-foreground/15"
                />
              ) : (
                <span className="block h-4 w-4 rounded-sm border border-dashed border-muted-foreground/40" />
              )}
            </span>
            <span className={cn('truncate font-mono text-xs', value ? 'text-foreground' : 'text-muted-foreground/50')}>
              {displayLabel}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto p-4 space-y-3.5">
          {/* Merged Theme section: brand palette hex values + semantic CSS vars, all in one row */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Theme</p>
            <div data-color-theme={themeId} className="flex flex-wrap gap-1.5">
              {/* Brand palette: light → dark */}
              {brandColors.map(({ hex, label: bLabel }) => (
                <button
                  key={hex}
                  type="button"
                  title={bLabel}
                  onClick={() => onChange(hex)}
                  style={{ background: hex }}
                  className={DOT(value === hex)}
                />
              ))}
              {/* Semantic CSS vars: backgrounds → muted → accent → primary → foreground */}
              {SWATCHES.map(({ cssVar, label: swLabel }) => (
                <button
                  key={cssVar}
                  type="button"
                  title={swLabel}
                  onClick={() => onChange(cssVar)}
                  style={{ background: cssVar }}
                  className={DOT(value === cssVar)}
                />
              ))}
            </div>
          </div>

          {/* Custom hex */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Custom</p>
            <div className="flex items-center gap-2">
              {isCustom && (
                <label className="flex-shrink-0 cursor-pointer">
                  <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="sr-only" />
                  <span
                    style={{ background: value }}
                    className="block h-6 w-6 rounded border border-foreground/20"
                  />
                </label>
              )}
              <input
                type="text"
                value={isCustom ? value : hexDraft}
                onChange={(e) => {
                  setHexDraft(e.target.value)
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value)
                }}
                placeholder="#000000"
                spellCheck={false}
                className="w-28 rounded border border-input bg-background px-2 py-1 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Reset */}
          {value !== undefined && (
            <button
              type="button"
              onClick={() => { onChange(undefined); setHexDraft('') }}
              className="text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              ← Reset to default
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
