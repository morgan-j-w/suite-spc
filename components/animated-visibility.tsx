'use client'

import { useState, useEffect, type ReactNode } from 'react'

interface AnimatedVisibilityProps {
  visible: boolean
  children: ReactNode
}

// Fades content in/out without overflow-hidden so focus rings and box-shadows on child
// controls (sliders, checkboxes) are never clipped. Unmounts fully when hidden so the
// element leaves the layout and takes no space -- no gaps where hidden fields used to be.
export function AnimatedVisibility({ visible, children }: AnimatedVisibilityProps) {
  const [mounted, setMounted] = useState(visible)

  useEffect(() => {
    if (visible) {
      setMounted(true)
    } else {
      const t = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(t)
    }
  }, [visible])

  if (!mounted) return null

  return (
    <div
      className="transition-opacity duration-300 ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
      inert={!visible}
    >
      {children}
    </div>
  )
}
