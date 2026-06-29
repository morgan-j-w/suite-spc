'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  // Lets callers rendering onto an arbitrary, runtime-chosen card background (e.g. the
  // subscription centre widget's style presets) override the border/fill/check color so it
  // stays legible against that specific background, instead of the fixed theme --input/--primary.
  controlColor?: string
  // Color of the checkmark + box fill once checked -- needs to contrast against controlColor
  // itself (which becomes the fill), not against the card background.
  indicatorColor?: string
}

function Checkbox({
  className,
  controlColor,
  indicatorColor,
  style,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer border-[var(--control-color,var(--input))] dark:bg-input/30 data-[state=checked]:bg-[var(--control-color,var(--primary))] data-[state=checked]:text-[var(--indicator-color,var(--primary-foreground))] dark:data-[state=checked]:bg-[var(--control-color,var(--primary))] data-[state=checked]:border-[var(--control-color,var(--primary))] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={
        controlColor
          ? ({ '--control-color': controlColor, '--indicator-color': indicatorColor, ...style } as React.CSSProperties)
          : style
      }
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
