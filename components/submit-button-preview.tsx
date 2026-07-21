'use client'

import { useState } from 'react'
import { AlignCenter, AlignLeft, AlignRight, StretchHorizontal } from 'lucide-react'
import type { ColorTheme } from '@/lib/brand-config'
import type { SubmitButtonAlignment } from '@/lib/subscription-centre'
import { getStylePreviews } from '@/lib/style-previews'
import { StylePicker } from '@/components/style-picker'
import { ColorRow } from '@/components/colour-row'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubmitButtonPreviewProps {
  theme: ColorTheme
  text: string
  styleIndex: number
  alignment: SubmitButtonAlignment
  bgColorOverride?: string
  textColorOverride?: string
  onTextChange: (text: string) => void
  onStyleIndexChange: (index: number) => void
  onAlignmentChange: (alignment: SubmitButtonAlignment) => void
  onBgColorChange?: (v?: string) => void
  onTextColorChange?: (v?: string) => void
  readOnly?: boolean
  onSubmit?: () => void
}

const ALIGNMENT_OPTIONS: { value: SubmitButtonAlignment; label: string; icon: typeof AlignLeft }[] = [
  { value: 'left', label: 'Left', icon: AlignLeft },
  { value: 'center', label: 'Centre', icon: AlignCenter },
  { value: 'right', label: 'Right', icon: AlignRight },
  { value: 'full', label: 'Full width', icon: StretchHorizontal },
]

const ALIGNMENT_CONTAINER_CLASS: Record<SubmitButtonAlignment, string> = {
  left: 'flex justify-start',
  center: 'flex justify-center',
  right: 'flex justify-end',
  full: 'flex',
}

// Full-width, builder-only live preview: the button text is edited directly on the button
// itself (no separate "Button Text" field), and alignment + style controls sit alongside it
// rather than in a separate editor card. In readOnly mode (Final Preview) those controls are
// hidden and the text renders as plain text, matching exactly what a subscriber would see.
export function SubmitButtonPreview({
  theme,
  text,
  styleIndex,
  alignment,
  bgColorOverride,
  textColorOverride,
  onTextChange,
  onStyleIndexChange,
  onAlignmentChange,
  onBgColorChange,
  onTextColorChange,
  readOnly,
  onSubmit,
}: SubmitButtonPreviewProps) {
  const [hovered, setHovered] = useState(false)
  const stylePreviews = getStylePreviews(theme)
  const style = stylePreviews[styleIndex] ?? stylePreviews[0]
  const isFullWidth = alignment === 'full'

  const finalBg = bgColorOverride ?? style.buttonBackground
  const finalText = textColorOverride ?? style.buttonText
  const hasOverride = !!(bgColorOverride || textColorOverride)

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {ALIGNMENT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={alignment === option.value ? 'default' : 'outline'}
                size="icon"
                className={cn('h-8 w-8', alignment === option.value && 'pointer-events-none')}
                title={option.label}
                onClick={() => onAlignmentChange(option.value)}
              >
                <option.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <StylePicker theme={theme} value={styleIndex} onChange={onStyleIndexChange} size="sm" className="w-[130px]" />
        </div>
      )}

      <div className={ALIGNMENT_CONTAINER_CLASS[alignment]}>
        <div
          onMouseEnter={() => { if (hasOverride) setHovered(true) }}
          onMouseLeave={() => setHovered(false)}
          className={cn('inline-flex h-11 items-center justify-center rounded-md px-8', isFullWidth && 'w-full')}
          style={{
            backgroundColor: finalBg,
            ...(style.buttonBorder ? { borderColor: style.buttonBorder, borderWidth: 1 } : {}),
            ...(hasOverride && hovered ? { filter: 'brightness(0.88)' } : {}),
          }}
        >
          {readOnly ? (
            <button
              type="button"
              className="text-base font-medium"
              style={{ color: finalText }}
              onClick={onSubmit}
            >
              {text || 'Submit'}
            </button>
          ) : (
            <input
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Submit"
              aria-label="Button text"
              className="min-w-0 bg-transparent text-center text-base font-medium outline-none placeholder:opacity-70"
              style={{ color: finalText, width: isFullWidth ? '100%' : `${Math.max((text || 'Submit').length, 4) + 2}ch` }}
            />
          )}
        </div>
      </div>

      {!readOnly && (
        <>
          <p className="text-xs text-muted-foreground/60">Click the button to edit its text.</p>
          {(onBgColorChange || onTextColorChange) && (
            <div className="space-y-0.5 border-t border-border/50 pt-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Button colours</p>
              {onBgColorChange && (
                <ColorRow label="Background" value={bgColorOverride} onChange={onBgColorChange} themeId={theme} />
              )}
              {onTextColorChange && (
                <ColorRow label="Text" value={textColorOverride} onChange={onTextColorChange} themeId={theme} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
