import { Loader2 } from 'lucide-react'
import { getStylePreviews } from '@/lib/style-previews'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubmitButtonProps {
  centre: SubscriptionCentre
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

export function SubmitButton({ centre, type = 'submit', disabled, isSubmitting, onClick }: SubmitButtonProps) {
  const stylePreviews = getStylePreviews(centre.themePresetId)
  const style = stylePreviews[centre.submitButtonStyleIndex] ?? stylePreviews[0]
  const isFullWidth = centre.submitButtonAlignment === 'full'

  return (
    <div className={ALIGNMENT_CONTAINER_CLASS[centre.submitButtonAlignment]}>
      <Button
        type={type}
        size="lg"
        disabled={disabled}
        onClick={onClick}
        className={cn(isFullWidth && 'w-full')}
        style={{
          backgroundColor: style.buttonBackground,
          color: style.buttonText,
          ...(style.buttonBorder ? { borderColor: style.buttonBorder, borderWidth: 1 } : {}),
        }}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {centre.submitButtonText || 'Submit'}
      </Button>
    </div>
  )
}
