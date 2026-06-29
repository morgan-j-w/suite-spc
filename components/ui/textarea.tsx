import * as React from 'react'

import { cn } from '@/lib/utils'

interface TextareaProps extends React.ComponentProps<'textarea'> {
  // See Input's controlColor -- same adaptive border/focus override for arbitrary card backgrounds.
  controlColor?: string
}

function Textarea({ className, controlColor, style, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-[var(--control-color,var(--input))] placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        // See Input -- thickening the border itself can't misalign with itself, unlike a
        // second concentric stroke (ring/outline), when adapting the focus color to a card.
        controlColor
          ? 'focus-visible:border-2 focus-visible:border-[var(--control-color)] focus-visible:shadow-none'
          : 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        className,
      )}
      style={controlColor ? ({ '--control-color': controlColor, ...style } as React.CSSProperties) : style}
      {...props}
    />
  )
}

export { Textarea }
