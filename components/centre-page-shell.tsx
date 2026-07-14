'use client'

import { useEffect, useState } from 'react'
import { ensureSeedCentre } from '@/lib/subscription-centre-store'
import type { BannerFooter, SubscriptionCentre } from '@/lib/subscription-centre'
import { richTextContentClass } from '@/components/rich-text-editor'
import { cn } from '@/lib/utils'

function BannerFooterBlock({ value }: { value: BannerFooter }) {
  if (!value.html) return null
  return (
    <div className={value.fullWidth ? 'w-full' : 'mx-auto max-w-2xl px-4'}>
      <div
        className={cn('py-4 text-sm', richTextContentClass)}
        dangerouslySetInnerHTML={{ __html: value.html }}
      />
    </div>
  )
}

// Wraps every subscriber-facing page with the active centre's banner and footer.
// Loads the centre client-side (localStorage) so server-component pages can still
// export `metadata` without becoming client components themselves.
export function CentrePageShell({ children }: { children: React.ReactNode }) {
  const [centre, setCentre] = useState<SubscriptionCentre | null>(null)

  useEffect(() => {
    setCentre(ensureSeedCentre())
  }, [])

  return (
    <div data-color-theme={centre?.themePresetId ?? undefined}>
      {centre?.banner && <BannerFooterBlock value={centre.banner} />}
      {children}
      {centre?.footer && <BannerFooterBlock value={centre.footer} />}
    </div>
  )
}
