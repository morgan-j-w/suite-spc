import * as React from 'react'

import { cn } from '@/lib/utils'

interface InputProps extends React.ComponentProps<'input'> {
  // Lets callers rendering onto an arbitrary, runtime-chosen card background (e.g. the
  // subscription centre widget's style presets) override the border/focus color so it stays
  // legible against that specific background, instead of the fixed theme --input/--ring.
  controlColor?: string
}

function Input({ className, type, controlColor, style, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-[var(--control-color,var(--input))] h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        // A second stroke (ring or outline) drawn concentric to the border can visibly
        // mismatch the border's own curve at small radii, in more than one browser/utility
        // combination tried here. Thickening the border itself can't ever misalign with
        // itself, so that's what indicates focus when adapting to a card color.
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

export { Input }
