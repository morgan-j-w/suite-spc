'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { getCentre } from '@/lib/subscription-centre-store'
import { generateEmailBannerHtml, generateEmailBodyHtml, generateEmailFooterHtml } from '@/lib/email-layouts'
import { getThemeBrandColors } from '@/lib/style-previews'
import { defaultTheme } from '@/lib/brand-config'
import type { SubscriptionCentre } from '@/lib/subscription-centre'

// WCAG relative luminance (sRGB, gamma-corrected) — the actual spec formula, not the
// quick 0.299/0.587/0.114 "perceived brightness" heuristic used elsewhere in this app
// for text-vs-background legibility. That heuristic is fine for picking readable text
// but doesn't track contrast RATIO closely enough to guarantee a pass/fail threshold.
function relativeLuminance(hex: string): number | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex)
  if (!match) return null
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(match[1].slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(l1: number, l2: number): number {
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2)
  return (hi + 0.05) / (lo + 0.05)
}

function grayHexFromLuminance(linear: number): string {
  const c = Math.min(1, Math.max(0, linear))
  const srgb = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
  const v = Math.round(Math.min(1, Math.max(0, srgb)) * 255)
  const hex = v.toString(16).padStart(2, '0')
  return `#${hex}${hex}${hex}`
}

// "View online" is conventionally a quiet, muted link — not a bold CTA — so rather than
// jumping to stark black/white we solve for the neutral grey that sits as close to `bg`
// as possible while still clearing WCAG AA (4.5:1, the threshold for normal-size text —
// this link is 12px, too small to qualify as "large text" at the relaxed 3:1 bar).
// emailBodyBgColor is user-configurable, so a fixed grey can't be trusted to pass against
// every background a user might pick; every background luminance admits a solution in at
// least one direction (darker or lighter), so this always returns a passing colour.
function accessibleMutedLinkColorFor(bg: string, minRatio = 4.5): string {
  const bgLum = relativeLuminance(bg) ?? 0.9 // unparsable input: assume a light bg, same as the old default
  const goDarker = contrastRatio(0, bgLum) >= contrastRatio(1, bgLum)
  // Solving exactly for minRatio and then rounding to the nearest 8-bit grey can round
  // back under the threshold (e.g. 4.50 -> 4.48), so solve for a hair more contrast to
  // absorb that quantization error.
  const solveRatio = minRatio * 1.02
  const targetLum = goDarker
    ? (bgLum + 0.05) / solveRatio - 0.05
    : solveRatio * (bgLum + 0.05) - 0.05
  return grayHexFromLuminance(targetLum)
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
  const linkColor = accessibleMutedLinkColorFor(wrapperBg)

  return (
    <div className="min-h-screen py-8" style={{ background: wrapperBg }}>
      <div className="mx-auto mb-4 px-4 text-center" style={{ maxWidth: 650 }}>
        <a href="#" style={{ fontSize: '12px', color: linkColor, textDecoration: 'underline' }}>
          View the email online
        </a>
      </div>

      <div className="mx-auto bg-white shadow-sm" style={{ maxWidth: 650 }}>
        {bannerHtml && <div dangerouslySetInnerHTML={{ __html: bannerHtml }} />}
        <div dangerouslySetInnerHTML={{ __html: generateEmailBodyHtml(tpl.bodyHtml, { linkColor: themeBrand }) }} />
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
