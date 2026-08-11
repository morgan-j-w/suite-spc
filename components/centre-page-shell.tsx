'use client'

import { useEffect, useState } from 'react'
import { ensureSeedCentre } from '@/lib/subscription-centre-store'
import type { SubscriptionCentre, StatusPages } from '@/lib/subscription-centre'
import { getContentMaxWidth } from '@/lib/subscription-centre'
import { defaultTheme } from '@/lib/brand-config'
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
    // bg-background resolves against this element's own [data-color-theme], so the page
    // paints the centre's background rather than letting <body> (the builder's warm chrome)
    // show through. A centre's own pageBackgroundColor still wins via the inline style.
    //
    // themePresetId falls back to the default rather than leaving the attribute off: with no
    // scope the page would inherit :root — the builder's palette — outright. Every centre
    // created since themePresetId became required has one; this only guards legacy data.
    <div data-color-theme={centre?.themePresetId ?? defaultTheme} className="flex min-h-screen flex-col bg-background" style={{ background: centre?.pageBackgroundColor ?? undefined }}>
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
