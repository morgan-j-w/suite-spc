import type { ReactNode } from 'react'

interface AnimatedVisibilityProps {
  visible: boolean
  children: ReactNode
}

// Animates a conditional field/category/section in or out instead of having it pop in
// instantly. Stays mounted (so it can transition) but uses `inert` to keep it out of the
// tab order and unclickable while collapsed. The grid-template-rows 0fr/1fr trick lets the
// height transition smoothly without measuring the content -- the inner overflow-hidden div
// is what allows the row track to actually shrink to 0 despite the content's intrinsic size.
export function AnimatedVisibility({ visible, children }: AnimatedVisibilityProps) {
  return (
    <div
      className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
      style={{ gridTemplateRows: visible ? '1fr' : '0fr', opacity: visible ? 1 : 0 }}
      inert={!visible}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
