'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { getCentre } from '@/lib/subscription-centre-store'
import { generateEmailBannerHtml, generateEmailFooterHtml } from '@/lib/email-layouts'
import { getThemeBrandColors } from '@/lib/style-previews'
import { defaultTheme } from '@/lib/brand-config'
import { richTextContentClass } from '@/components/rich-text-editor'
import { cn } from '@/lib/utils'
import type { SubscriptionCentre } from '@/lib/subscription-centre'

// "View online" is conventionally a quiet, muted link — not a bold CTA — so rather than
// flipping to stark black/white we pick between two muted greys based on background
// luminance, same idea as getReadableTextColor but tuned to stay subtle either way.
// emailBodyBgColor is user-configurable and could be dark, so a hardcoded grey would
// risk becoming illegible.
function mutedLinkColorFor(bg: string): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(bg)
  if (!match) return '#6b7280'
  const r = parseInt(match[1].slice(0, 2), 16)
  const g = parseInt(match[1].slice(2, 4), 16)
  const b = parseInt(match[1].slice(4, 6), 16)
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  return luma > 150 ? '#6b7280' : '#9ca3af'
}

function EmailPreviewContent() {
  const searchParams = useSearchParams()
  const centreId = searchParams.get('centreId')
  const template = searchParams.get('template')
  const [centre, setCentre] = useState<SubscriptionCentre | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (centreId) setCentre(getCentre(centreId))
    setLoaded(true)
  }, [centreId])

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!centreId || !template || !['doubleOptIn', 'confirmation', 'unsubscribed'].includes(template)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4] p-8">
        <div className="rounded-lg bg-white p-8 text-center shadow-sm" style={{ maxWidth: 650 }}>
          <p className="font-medium text-gray-600">Invalid preview link</p>
          <p className="mt-1 text-sm text-gray-400">This link is missing required parameters.</p>
        </div>
      </div>
    )
  }

  if (!centre) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4] p-8">
        <div className="rounded-lg bg-white p-8 text-center shadow-sm" style={{ maxWidth: 650 }}>
          <p className="font-medium text-gray-600">Centre not found</p>
          <p className="mt-1 text-sm text-gray-400">This centre may have been deleted or the link is outdated.</p>
        </div>
      </div>
    )
  }

  const cfg = centre.emailConfig
  const tpl = cfg[template as 'doubleOptIn' | 'confirmation' | 'unsubscribed']
  const brand = centre.brand ?? {}

  const themeColors = getThemeBrandColors(centre.themePresetId ?? defaultTheme)
  const themeBrand = themeColors[5]?.hex ?? '#2F5FB3'
  const themeLight = themeColors[0]?.hex ?? '#FFFFFF'

  const bannerHtml = cfg.bannerHtml
    || generateEmailBannerHtml(cfg.bannerLayout ?? 'logo-centered', brand, {
        bgColor:    cfg.bannerBgColor   ?? themeBrand,
        textColor:  cfg.bannerTextColor ?? themeLight,
        linkColor:  cfg.bannerLinkColor,
        heading:    cfg.bannerHeading,
        subheading: cfg.bannerSubheading,
        logoMaxWidth:  cfg.bannerLogoMaxWidth,
        logoMaxHeight: cfg.bannerLogoMaxHeight,
        logoPosition:  cfg.bannerLogoPosition,
      })

  const footerHtml = cfg.footerHtml
    || generateEmailFooterHtml(cfg.footerLayout ?? 'minimal', brand, {
        bgColor:   cfg.footerBgColor,
        textColor: cfg.footerTextColor,
        linkColor: cfg.footerLinkColor,
        logoMaxWidth:  cfg.footerLogoMaxWidth,
        logoMaxHeight: cfg.footerLogoMaxHeight,
        logoPosition:  cfg.footerLogoPosition,
      })

  const wrapperBg = cfg.emailBodyBgColor ?? '#f4f4f4'
  const linkColor = mutedLinkColorFor(wrapperBg)

  return (
    <div className="min-h-screen py-8" style={{ background: wrapperBg }}>
      <div className="mx-auto mb-4 px-4 text-center" style={{ maxWidth: 650 }}>
        <a href="#" style={{ fontSize: '12px', color: linkColor, textDecoration: 'underline' }}>
          View the email online
        </a>
      </div>

      <div className="mx-auto bg-white shadow-sm" style={{ maxWidth: 650 }}>
        {bannerHtml && <div dangerouslySetInnerHTML={{ __html: bannerHtml }} />}
        <div
          className={cn('px-6 py-6 text-sm', richTextContentClass)}
          dangerouslySetInnerHTML={{
            __html: tpl.bodyHtml || '<p style="color:#9ca3af;font-style:italic">No body content yet.</p>',
          }}
        />
        {footerHtml && <div dangerouslySetInnerHTML={{ __html: footerHtml }} />}
      </div>
    </div>
  )
}

export default function EmailPreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    }>
      <EmailPreviewContent />
    </Suspense>
  )
}
