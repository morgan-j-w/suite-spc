'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getStylePreviews } from '@/lib/style-previews'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubmitButtonProps {
  centre: SubscriptionCentre
  label?: string
  alignment?: SubscriptionCentre['submitButtonAlignment']
  type?: 'submit' | 'button'
  disabled?: boolean
  isSubmitting?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const ALIGNMENT_CONTAINER_CLASS: Record<SubscriptionCentre['submitButtonAlignment'], string> = {
  left: 'flex justify-start',
  center: 'flex justify-center',
  right: 'flex justify-end',
  full: 'flex',
}

export function SubmitButton({ centre, label, alignment, type = 'submit', disabled, isSubmitting, onClick }: SubmitButtonProps) {
  const [hovered, setHovered] = useState(false)
  const stylePreviews = getStylePreviews(centre.themePresetId)
  const style = stylePreviews[centre.submitButtonStyleIndex] ?? stylePreviews[0]
  const resolvedAlignment = alignment ?? centre.submitButtonAlignment
  const isFullWidth = resolvedAlignment === 'full'

  const finalBg = centre.submitButtonBgColor ?? style.buttonBackground
  const finalText = centre.submitButtonTextColor ?? style.buttonText
  const hasOverride = !!(centre.submitButtonBgColor || centre.submitButtonTextColor)

  return (
    <div className={ALIGNMENT_CONTAINER_CLASS[resolvedAlignment]}>
      <Button
        type={type}
        size="lg"
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={() => { if (hasOverride) setHovered(true) }}
        onMouseLeave={() => setHovered(false)}
        className={cn(isFullWidth && 'w-full')}
        style={{
          backgroundColor: finalBg,
          color: finalText,
          ...(style.buttonBorder ? { borderColor: style.buttonBorder, borderWidth: 1 } : {}),
          ...(hasOverride && hovered ? { filter: 'brightness(0.88)' } : {}),
        }}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label ?? centre.submitButtonText ?? 'Submit'}
      </Button>
    </div>
  )
}
