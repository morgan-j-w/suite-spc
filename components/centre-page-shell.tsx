'use client'

import { useEffect, useState } from 'react'
import { ensureSeedCentre } from '@/lib/subscription-centre-store'
import type { SubscriptionCentre, StatusPages } from '@/lib/subscription-centre'
import { getContentMaxWidth } from '@/lib/subscription-centre'
import { RenderedBanner, RenderedFooter } from '@/components/rendered-banner-footer'

export type FlowKey = keyof StatusPages

interface CentrePageShellProps {
  children: React.ReactNode
  flowKey?: FlowKey
}

// Wraps every subscriber-facing page with the active centre's banner and footer.
// flowKey maps to the statusPages group so per-flow banner heading/blurb can be shown.
export function CentrePageShell({ children, flowKey }: CentrePageShellProps) {
  const [centre, setCentre] = useState<SubscriptionCentre | null>(null)

  useEffect(() => {
    setCentre(ensureSeedCentre())
  }, [])

  const flow = flowKey && centre ? centre.statusPages[flowKey] : undefined
  const bannerHeading = flow && 'bannerHeading' in flow ? (flow as { bannerHeading?: string }).bannerHeading : undefined
  const bannerBlurb   = flow && 'bannerBlurb'   in flow ? (flow as { bannerBlurb?: string }).bannerBlurb   : undefined

  return (
    <div data-color-theme={centre?.themePresetId ?? undefined} className="flex min-h-screen flex-col" style={{ background: centre?.pageBackgroundColor ?? undefined }}>
      {centre?.banner && (
        <div className={centre.banner.sticky ? 'sticky top-0 z-50' : undefined}>
          <RenderedBanner
            config={centre.banner}
            brand={centre.brand}
            heading={bannerHeading}
            blurb={bannerBlurb}
            contentMaxWidth={getContentMaxWidth(centre.formWidth)}
          />
        </div>
      )}
      <div className="flex-1">
        <div style={{ maxWidth: getContentMaxWidth(centre?.formWidth), margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </div>
      {centre?.footer && (
        <RenderedFooter config={centre.footer} brand={centre.brand} contentMaxWidth={getContentMaxWidth(centre.formWidth)} />
      )}
    </div>
  )
}
