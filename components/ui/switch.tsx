'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  // Lets callers rendering onto an arbitrary, runtime-chosen card background (e.g. the
  // subscription centre widget's style presets) make the unchecked state -- a pale track with
  // a near-white thumb by default -- visible against that specific background. The checked
  // state (dark filled track + light thumb) is already a fixed-contrast pair, so it's left as-is.
  controlColor?: string
}

function Switch({
  className,
  controlColor,
  style,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-foreground data-[state=unchecked]:bg-input focus-visible:ring-ring/30 dark:data-[state=unchecked]:bg-input/80 dark:data-[state=checked]:bg-foreground inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 data-[state=checked]:border-transparent data-[state=unchecked]:border-[var(--control-color,transparent)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={controlColor ? ({ '--control-color': controlColor, ...style } as React.CSSProperties) : style}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-background data-[state=unchecked]:bg-[var(--control-color,var(--background))]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
