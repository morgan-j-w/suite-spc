'use client'

import { useState } from 'react'
import type { Brand, BannerConfig, FooterConfig, SocialPlatform, SocialLink } from '@/lib/subscription-centre'

// ─── Social icons ─────────────────────────────────────────────────────────────

const SOCIAL_ICONS: Record<SocialPlatform, React.FC<{ className?: string }>> = {
  facebook: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  ),
  x: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  ),
  linkedin: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  youtube: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  tiktok: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  pinterest: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  ),
  threads: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.851 1.205 8.604.024 12.184 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 8.87c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.822.871 4.983-1.551 7.358C17.587 24.05 15.465 24 12.186 24z" />
    </svg>
  ),
}

function SocialIcons({ links, size = 'md', color }: { links: SocialLink[]; size?: 'sm' | 'md'; color?: string }) {
  if (!links.length) return null
  const sz = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <div className="flex items-center gap-3">
      {links.map((link) => {
        const Icon = SOCIAL_ICONS[link.platform]
        return Icon ? (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
            style={color ? { color } : undefined}
            className="transition-opacity hover:opacity-70">
            <Icon className={sz} />
            <span className="sr-only">{link.platform}</span>
          </a>
        ) : null
      })}
    </div>
  )
}

function HoverLink({ href, bg, text, children }: { href: string; bg: string; text: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      style={{
        fontSize: '0.875rem', fontWeight: 500, color: text, background: bg,
        padding: '0.5rem 1.25rem', borderRadius: '0.375rem', textDecoration: 'none',
        display: 'inline-block', transition: 'filter 0.15s',
        filter: hovered ? 'brightness(0.88)' : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  )
}

function wrap(fullWidth: boolean, maxWidth = 896): React.CSSProperties {
  return fullWidth ? {} : { maxWidth, margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }
}

// Computes section outer padding from the 'padding' config field.
// Each layout has its own "normal" default; a numeric value (px) overrides directly.
function sectionPad(padding: number | string | undefined, normalV: string, normalH: string): string {
  const v = parseFloat(normalV), h = parseFloat(normalH)
  if (typeof padding === 'number') return `${padding}px ${h}rem`
  if (padding === 'compact') return `${v * 0.55}rem ${h * 0.67}rem`
  if (padding === 'spacious') return `${v * 1.6}rem ${h * 1.25}rem`
  return `${v}rem ${h}rem`
}

// Logo size map — used by layouts that show a logo.
const LOGO_SIZES: Record<'sm' | 'md' | 'lg', { h: number; w: number }> = {
  sm: { h: 32, w: 110 },
  md: { h: 48, w: 160 },
  lg: { h: 72, w: 220 },
}

// Resolve logo dimensions: explicit px values take priority over the legacy size preset.
function logoSz(config: BannerConfig, defaultSize: 'sm' | 'md' | 'lg' = 'md'): { h: number; w: number } {
  if (config.logoMaxWidth != null || config.logoMaxHeight != null) {
    return { w: config.logoMaxWidth ?? 220, h: config.logoMaxHeight ?? 72 }
  }
  return LOGO_SIZES[config.logoSize ?? defaultSize]
}

// ─── Banner layouts B1–B6 ─────────────────────────────────────────────────────

interface BannerProps { config: BannerConfig; brand: Brand; heading?: string; blurb?: string; maxWidth?: number }

function BannerCentred({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const hasBg = !!config.backgroundColor
  const fg = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  return (
    <div style={{ background: bg, borderBottom: hasBg ? 'none' : '1px solid var(--border)', padding: sectionPad(config.padding, '2.5', '1.5'), textAlign: 'center' }}>
      <div style={wrap(config.fullWidth, maxWidth)}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 48, maxWidth: 160, marginBottom: '1rem', display: 'inline-block' }} />}
        {heading && <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: fg, margin: '0 0 0.5rem' }}>{heading}</h1>}
        {blurb && <p style={{ color: body, margin: '0 auto', maxWidth: 520 }}>{blurb}</p>}
      </div>
    </div>
  )
}

function BannerBarCta({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const fg = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--primary)'
  return (
    <div style={{ background: bg, borderBottom: '1px solid var(--border)', padding: sectionPad(config.padding, '1.5', '1.5') }}>
      <div style={wrap(config.fullWidth, maxWidth)}>
        <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: '0.5rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: heading || blurb ? '1.25rem' : 0 }}>
          {brand.logoUrl
            ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 40, maxWidth: 140 }} />
            : <span style={{ fontWeight: 600, color: fg }}>Your Brand</span>}
          {brand.backUrl && (
            <a href={brand.backUrl} style={{ fontSize: '0.875rem', color: link, textDecoration: 'none', fontWeight: 500 }}>
              ← Back to website
            </a>
          )}
        </div>
        {heading && <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: fg, margin: '0 0 0.375rem' }}>{heading}</h1>}
        {blurb && <p style={{ color: body, margin: 0 }}>{blurb}</p>}
      </div>
    </div>
  )
}

// Horizontal strip with a primary left accent bar — structurally distinct from the tall centred layout.
function BannerBrandBand({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const fg = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const accent = config.accentColor ?? 'var(--primary)'
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .spc-brand-band-inner { flex-direction: column !important; align-items: stretch !important; min-height: 0 !important; }
          .spc-brand-band-left { border-right: none !important; border-bottom: 1px solid var(--border) !important; margin-right: 0 !important; padding-right: 0 !important; }
          .spc-brand-band-right { flex: none !important; padding-right: 0 !important; padding-left: 0 !important; }
        }
      `}} />
      <div style={{ background: bg, borderBottom: '1px solid var(--border)' }}>
        <div className="spc-brand-band-inner" style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', alignItems: 'center', gap: 0, minHeight: 80 }}>
          {/* Left accent stripe + logo */}
          <div className="spc-brand-band-left" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingRight: '2rem', borderRight: '1px solid var(--border)', marginRight: '2rem', alignSelf: 'stretch', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
            <div style={{ width: 4, alignSelf: 'stretch', background: accent, borderRadius: 2, flexShrink: 0 }} />
            {brand.logoUrl
              ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 120, display: 'block' }} />
              : <span style={{ fontSize: '0.875rem', fontWeight: 700, color: fg, whiteSpace: 'nowrap' }}>Brand</span>
            }
          </div>
          {/* Right — heading + blurb */}
          <div className="spc-brand-band-right" style={{ flex: '1 1 0', padding: '1.5rem 1.5rem 1.5rem 0' }}>
            {heading && <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: fg, margin: '0 0 0.375rem', lineHeight: 1.3 }}>{heading}</h1>}
            {blurb && <p style={{ color: body, margin: 0, fontSize: '0.9rem' }}>{blurb}</p>}
          </div>
        </div>
      </div>
    </>
  )
}

function BannerSplitImage({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const fg = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .spc-split-image-inner { flex-direction: column !important; align-items: stretch !important; gap: 1.5rem !important; }
          .spc-split-image-media { width: 100% !important; max-width: 100% !important; }
        }
      `}} />
      <div style={{ background: bg, borderBottom: '1px solid var(--border)', padding: sectionPad(config.padding, '2.5', '1.5') }}>
        <div className="spc-split-image-inner" style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ flex: '1 1 0' }}>
            {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 40, maxWidth: 140, marginBottom: '1rem' }} />}
            {heading && <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: fg, margin: '0 0 0.5rem' }}>{heading}</h1>}
            {blurb && <p style={{ color: body, margin: 0 }}>{blurb}</p>}
          </div>
          {config.imageUrl
            ? <img src={config.imageUrl} alt="" className="spc-split-image-media" style={{ flex: '0 0 auto', width: '40%', maxWidth: 280, borderRadius: '0.5rem', objectFit: 'cover' }} />
            : <div className="spc-split-image-media" style={{ flex: '0 0 auto', width: '40%', maxWidth: 280, height: 160, borderRadius: '0.5rem', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>Illustration</span>
              </div>
          }
        </div>
      </div>
    </>
  )
}

function BannerMinimal({ config, brand, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const label = config.bodyColor ?? 'var(--muted-foreground)'
  return (
    <div style={{ background: bg, borderBottom: '1px solid var(--border)', padding: '1.25rem 1.5rem' }}>
      <div style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 120 }} />}
        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: label }}>
          Preference Centre
        </span>
      </div>
    </div>
  )
}

function BannerWithSocials({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const fg = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const icon = config.iconColor ?? config.linkColor ?? 'var(--muted-foreground)'
  return (
    <div style={{ background: bg, borderBottom: '1px solid var(--border)', padding: sectionPad(config.padding, '2.5', '1.5'), textAlign: 'center' }}>
      <div style={wrap(config.fullWidth, maxWidth)}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 48, maxWidth: 160, marginBottom: '1rem', display: 'inline-block' }} />}
        {heading && <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: fg, margin: '0 0 0.5rem' }}>{heading}</h1>}
        {blurb && <p style={{ color: body, margin: '0 auto 1.25rem', maxWidth: 480 }}>{blurb}</p>}
        {!!brand.socialLinks?.length && <div style={{ display: 'flex', justifyContent: 'center' }}><SocialIcons links={brand.socialLinks} color={icon} /></div>}
      </div>
    </div>
  )
}

// Two rows: slim nav bar (logo + back link) on top, coloured content band with heading/body below.
function BannerNavStrip({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const navBg = config.accentColor ?? 'var(--card)'
  const contentBg = config.backgroundColor ?? 'var(--muted)'
  const fg = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--primary)'
  return (
    <div>
      <div style={{ background: navBg, borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem' }}>
        <div style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', flexWrap: 'wrap', rowGap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
          {brand.logoUrl
            ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 32, maxWidth: 120 }} />
            : <span style={{ fontWeight: 700, fontSize: '0.9rem', color: fg }}>Brand</span>}
          {brand.backUrl && (
            <a href={brand.backUrl} style={{ fontSize: '0.875rem', color: link, textDecoration: 'none', fontWeight: 500 }}>← Back to website</a>
          )}
        </div>
      </div>
      {(heading || blurb) && (
        <div style={{ background: contentBg, padding: sectionPad(config.padding, '1.75', '1.5'), textAlign: 'center' }}>
          <div style={wrap(config.fullWidth, maxWidth)}>
            {heading && <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: fg, margin: '0 0 0.375rem' }}>{heading}</h1>}
            {blurb && <p style={{ color: body, margin: 0 }}>{blurb}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// Bold full-width hero — primary-coloured background, large heading, optional logo above.
function BannerFeatureHero({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--primary)'
  const fg = config.headingColor ?? 'var(--primary-foreground)'
  const body = config.bodyColor ?? 'var(--primary-foreground)'
  const sz = logoSz(config, 'sm')
  return (
    <div style={{ background: bg, padding: sectionPad(config.padding, '4', '1.5'), textAlign: 'center' }}>
      <div style={wrap(config.fullWidth, maxWidth)}>
        {brand.logoUrl && (
          <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: sz.h, maxWidth: sz.w, marginBottom: '1.5rem', display: 'inline-block', opacity: 0.9 }} />
        )}
        {heading && <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: fg, margin: '0 0 0.75rem', lineHeight: 1.1 }}>{heading}</h1>}
        {blurb && <p style={{ color: body, margin: '0 auto', maxWidth: 540, fontSize: '1.0625rem', lineHeight: 1.65, opacity: 0.85 }}>{blurb}</p>}
      </div>
    </div>
  )
}

// Just the logo — large and positioned. Heading/blurb are suppressed.
function BannerLogoOnly({ config, brand, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const pos = config.logoPosition ?? 'center'
  const sz = logoSz(config, 'lg')
  const justify = pos === 'left' ? 'flex-start' : pos === 'right' ? 'flex-end' : 'center'
  return (
    <div style={{ background: bg, borderBottom: '1px solid var(--border)', padding: sectionPad(config.padding, '2', '1.5') }}>
      <div style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', justifyContent: justify }}>
        {brand.logoUrl
          ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: sz.h, maxWidth: sz.w }} />
          : <div style={{ height: sz.h * 0.75, width: sz.w * 0.65, background: 'var(--muted)', borderRadius: '0.375rem' }} />}
      </div>
    </div>
  )
}

// ─── Banner layouts B10–B11 ──────────────────────────────────────────────────

// Editorial two-column: large display heading left, logo + back link right.
function BannerEditorialSplit({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const fg = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--primary)'
  const accent = config.accentColor ?? 'var(--primary)'
  const sz = logoSz(config, 'sm')
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .spc-editorial-inner { flex-direction: column !important; gap: 1.5rem !important; }
          .spc-editorial-side { align-items: flex-start !important; padding-top: 0 !important; }
        }
      `}} />
      <div style={{ background: bg, borderBottom: '1px solid var(--border)', padding: sectionPad(config.padding, '3', '1.5') }}>
        <div className="spc-editorial-inner" style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
          <div style={{ flex: '3 1 0' }}>
            <div style={{ width: '2.5rem', height: '3px', background: accent, marginBottom: '1rem', borderRadius: 2 }} />
            {heading && <h1 style={{ fontSize: '2rem', fontWeight: 700, color: fg, margin: '0 0 0.5rem', lineHeight: 1.15 }}>{heading}</h1>}
            {blurb && <p style={{ color: body, margin: 0, fontSize: '1rem', lineHeight: 1.6 }}>{blurb}</p>}
          </div>
          <div className="spc-editorial-side" style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', paddingTop: '0.25rem' }}>
            {brand.logoUrl
              ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: sz.h, maxWidth: sz.w }} />
              : <span style={{ fontSize: '0.875rem', fontWeight: 700, color: fg }}>Brand</span>}
            {brand.backUrl && <a href={brand.backUrl} style={{ fontSize: '0.8125rem', color: link, textDecoration: 'none' }}>← Back to website</a>}
          </div>
        </div>
      </div>
    </>
  )
}

// Three distinct horizontal bands: utility bar → logo → heading/blurb.
function BannerTripleRow({ config, brand, heading, blurb, maxWidth = 896 }: BannerProps) {
  const utilBg = config.accentColor ?? 'var(--muted)'
  const mainBg = config.backgroundColor ?? 'var(--card)'
  const fg = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--primary)'
  const sz = logoSz(config, 'md')
  return (
    <div>
      <div style={{ background: utilBg, padding: '0.375rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {brand.backUrl && <a href={brand.backUrl} style={{ fontSize: '0.75rem', color: link, textDecoration: 'none', fontWeight: 500 }}>← Back to website</a>}
        </div>
      </div>
      <div style={{ background: mainBg, padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={wrap(config.fullWidth, maxWidth)}>
          {brand.logoUrl
            ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: sz.h, maxWidth: sz.w, display: 'inline-block' }} />
            : <div style={{ display: 'inline-block', height: sz.h * 0.75, width: sz.w * 0.65, background: 'var(--muted)', borderRadius: '0.375rem' }} />}
        </div>
      </div>
      {(heading || blurb) && (
        <div style={{ background: mainBg, padding: sectionPad(config.padding, '1.5', '1.5'), textAlign: 'center' }}>
          <div style={wrap(config.fullWidth, maxWidth)}>
            {heading && <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: fg, margin: '0 0 0.375rem' }}>{heading}</h1>}
            {blurb && <p style={{ color: body, margin: 0 }}>{blurb}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// Logo centred between two horizontal rules — a clean horizontal band with rule/logo/rule.
function BannerLogoBand({ config, brand, maxWidth = 896 }: BannerProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const ruleColor = config.accentColor ?? 'var(--border)'
  const sz = logoSz(config, 'md')
  return (
    <div style={{ background: bg, padding: sectionPad(config.padding, '1.25', '1.5') }}>
      <div style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ flex: 1, height: 1, background: ruleColor }} />
        {brand.logoUrl
          ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: sz.h, maxWidth: sz.w, display: 'block', flexShrink: 0 }} />
          : <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap', flexShrink: 0 }}>Your Company</span>}
        <div style={{ flex: 1, height: 1, background: ruleColor }} />
      </div>
    </div>
  )
}

function ImageBackgroundWrapper({ config, children }: { config: { imageUrl?: string; imageOverlayColor?: string; imageOverlayOpacity?: number; backgroundSize?: string; backgroundRepeat?: string }; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${config.imageUrl})`,
        backgroundSize: config.backgroundSize ?? 'cover',
        backgroundRepeat: config.backgroundRepeat ?? 'no-repeat',
        backgroundPosition: 'center',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: config.imageOverlayColor ?? '#000000',
        opacity: (config.imageOverlayOpacity ?? 45) / 100,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

export function RenderedBanner({ config, brand, heading, blurb, contentMaxWidth }: { config: BannerConfig; brand: Brand; heading?: string; blurb?: string; contentMaxWidth?: number }) {
  const maxWidth = contentMaxWidth ?? 896
  const p = { config, brand, heading, blurb, maxWidth }
  const layout = config.customHtml
    ? <div dangerouslySetInnerHTML={{ __html: config.customHtml }} />
    : (() => { switch (config.layout) {
        case 'centred':            return <BannerCentred {...p} />
        case 'bar-cta':            return <BannerBarCta {...p} />
        case 'brand-band':         return <BannerBrandBand {...p} />
        case 'split-image':        return <BannerSplitImage {...p} />
        case 'minimal':            return <BannerMinimal {...p} />
        case 'with-socials':       return <BannerWithSocials {...p} />
        case 'nav-strip':          return <BannerNavStrip {...p} />
        case 'feature-hero':       return <BannerFeatureHero {...p} />
        case 'logo-only':          return <BannerLogoOnly {...p} />
        case 'editorial-split':    return <BannerEditorialSplit {...p} />
        case 'triple-row':         return <BannerTripleRow {...p} />
        case 'logo-band':          return <BannerLogoBand {...p} />
        default:                   return <BannerCentred {...p} />
      }})()
  const wrapped = config.imageBackground && config.imageUrl
    ? <ImageBackgroundWrapper config={config}>{layout}</ImageBackgroundWrapper>
    : layout
  return (
    <>
      {config.customCss && <style dangerouslySetInnerHTML={{ __html: config.customCss }} />}
      {wrapped}
      {config.bannerImageUrl && (
        <img src={config.bannerImageUrl} alt="" style={{ display: 'block', width: '100%', height: config.bannerImageHeight ?? 240, objectFit: 'cover' }} />
      )}
    </>
  )
}

// ─── Footer layouts F1–F6 ─────────────────────────────────────────────────────

interface FooterProps { config: FooterConfig; brand: Brand; maxWidth?: number }

function FooterCentredStack({ config, brand, maxWidth = 896 }: FooterProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  const icon = config.iconColor ?? link
  return (
    <div style={{ background: bg, borderTop: '1px solid var(--border)', padding: sectionPad(config.padding, '2.5', '1.5'), textAlign: 'center' }}>
      <div style={wrap(config.fullWidth, maxWidth)}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 120, marginBottom: '1.25rem', display: 'inline-block' }} />}
        {!!brand.socialLinks?.length && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}><SocialIcons links={brand.socialLinks} color={icon} /></div>}
        {!!config.links?.length && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.25rem 1rem', marginBottom: '1rem' }}>
            {config.links.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.8125rem', color: link, textDecoration: 'none' }}>{l.label}</a>)}
          </div>
        )}
        {brand.address && <p style={{ fontSize: '0.75rem', color: body, margin: '0 0 0.375rem' }}>{brand.address}</p>}
        {brand.copyrightText && <p style={{ fontSize: '0.75rem', color: body, margin: 0 }}>{brand.copyrightText}</p>}
      </div>
    </div>
  )
}

function FooterMultiColumn({ config, brand, maxWidth = 896 }: FooterProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const heading = config.headingColor ?? 'var(--foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  const icon = config.iconColor ?? link
  return (
    <div style={{ background: bg, borderTop: '1px solid var(--border)', padding: sectionPad(config.padding, '2.5', '1.5') }}>
      <div style={wrap(config.fullWidth, maxWidth)}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: '2 1 200px' }}>
            {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 120, marginBottom: '0.75rem' }} />}
            {!!brand.socialLinks?.length && <SocialIcons links={brand.socialLinks} size="sm" color={icon} />}
          </div>
          {!!config.quickLinks?.length && (
            <div style={{ flex: '1 1 140px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: heading, margin: '0 0 0.75rem' }}>Quick links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {config.quickLinks.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.8125rem', color: link, textDecoration: 'none' }}>{l.label}</a>)}
              </div>
            </div>
          )}
          {brand.address && (
            <div style={{ flex: '1 1 140px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: heading, margin: '0 0 0.75rem' }}>Our address</p>
              <p style={{ fontSize: '0.8125rem', color: body, margin: 0, whiteSpace: 'pre-line' }}>{brand.address}</p>
            </div>
          )}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem' }}>
          {!!config.links?.length && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem' }}>
              {config.links.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.75rem', color: link, textDecoration: 'none' }}>{l.label}</a>)}
            </div>
          )}
          {brand.copyrightText && <p style={{ fontSize: '0.75rem', color: body, margin: 0 }}>{brand.copyrightText}</p>}
        </div>
      </div>
    </div>
  )
}

// Thin horizontal strip — logo left · social centre · links+copyright right.
// Light card background to match the other footer options.
function FooterAccentBand({ config, brand, maxWidth = 896 }: FooterProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const fg = config.bodyColor ?? 'var(--foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  const accent = config.accentColor ?? 'var(--primary)'
  return (
    <div style={{ background: bg, borderTop: `2px solid ${accent}`, padding: '0.75rem 1.5rem' }}>
      <div style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Left — logo or fallback label */}
        <div style={{ flexShrink: 0 }}>
          {brand.logoUrl
            ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 28, maxWidth: 100, display: 'block' }} />
            : <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: fg }}>Preference Centre</span>
          }
        </div>

        {/* Centre — social icons */}
        {!!brand.socialLinks?.length && (
          <SocialIcons links={brand.socialLinks} size="sm" color={config.iconColor ?? link} />
        )}

        {/* Right — links + copyright */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {!!config.links?.length && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem' }}>
              {config.links.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.75rem', color: link, textDecoration: 'none' }}>{l.label}</a>)}
            </div>
          )}
          {brand.copyrightText && (
            <span style={{ fontSize: '0.75rem', color: fg, opacity: 0.55, whiteSpace: 'nowrap' }}>{brand.copyrightText}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function FooterMinimalLine({ config, brand, maxWidth = 896 }: FooterProps) {
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  const style: React.CSSProperties = { borderTop: '1px solid var(--border)', padding: '1rem 1.5rem' }
  if (config.backgroundColor) style.background = config.backgroundColor
  return (
    <div style={style}>
      <div style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem' }}>
          {config.links?.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.8125rem', color: link, textDecoration: 'none' }}>{l.label}</a>)}
        </div>
        {brand.copyrightText && <p style={{ fontSize: '0.75rem', color: body, margin: 0 }}>{brand.copyrightText}</p>}
      </div>
    </div>
  )
}

function FooterSplitCta({ config, brand, maxWidth = 896 }: FooterProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  const icon = config.iconColor ?? link
  const btnBg = config.buttonBgColor ?? 'var(--primary)'
  const btnText = config.buttonTextColor ?? 'var(--primary-foreground)'
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .spc-splitcta-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .spc-splitcta-left img { margin-left: auto !important; margin-right: auto !important; }
          .spc-splitcta-right { align-items: center !important; }
          .spc-splitcta-right-links { justify-content: center !important; }
        }
      `}} />
      <div style={{ background: bg, borderTop: '1px solid var(--border)', padding: sectionPad(config.padding, '2', '1.5') }}>
        <div className="spc-splitcta-inner" style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div className="spc-splitcta-left">
            {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 120, marginBottom: '0.75rem' }} />}
            {brand.address && <p style={{ fontSize: '0.8125rem', color: body, margin: 0, whiteSpace: 'pre-line' }}>{brand.address}</p>}
          </div>
          <div className="spc-splitcta-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.875rem' }}>
            {brand.backUrl && (
              <HoverLink href={brand.backUrl} bg={btnBg} text={btnText}>Back to website</HoverLink>
            )}
            {!!brand.socialLinks?.length && <SocialIcons links={brand.socialLinks} size="sm" color={icon} />}
            {!!config.links?.length && (
              <div className="spc-splitcta-right-links" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.25rem 0.875rem' }}>
                {config.links.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.75rem', color: link, textDecoration: 'none' }}>{l.label}</a>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function FooterUnsubscribeFocus({ config, brand, maxWidth = 896 }: FooterProps) {
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--primary)'
  const style: React.CSSProperties = { borderTop: '1px solid var(--border)', padding: sectionPad(config.padding, '2', '1.5'), textAlign: 'center' }
  if (config.backgroundColor) style.background = config.backgroundColor
  return (
    <div style={style}>
      <div style={wrap(config.fullWidth, maxWidth)}>
        <p style={{ fontSize: '0.875rem', color: body, margin: '0 0 0.75rem' }}>
          You are receiving this email because you subscribed to our communications.
        </p>
        {!!config.links?.length && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.25rem 1rem' }}>
            {config.links.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.8125rem', color: link, textDecoration: 'underline' }}>{l.label}</a>)}
          </div>
        )}
        {brand.copyrightText && <p style={{ fontSize: '0.75rem', color: body, margin: '0.75rem 0 0' }}>{brand.copyrightText}</p>}
      </div>
    </div>
  )
}

// Two columns: logo + address/copyright on the left, nav links stacked on the right.
function FooterTwoCol({ config, brand, maxWidth = 896 }: FooterProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .spc-twocol-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .spc-twocol-left img { margin-left: auto !important; margin-right: auto !important; }
          .spc-twocol-right { align-items: center !important; }
        }
      `}} />
      <div style={{ background: bg, borderTop: '1px solid var(--border)', padding: sectionPad(config.padding, '2', '1.5') }}>
        <div className="spc-twocol-inner" style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="spc-twocol-left">
            {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 120, marginBottom: '0.75rem', display: 'block' }} />}
            {brand.address && <p style={{ fontSize: '0.8125rem', color: body, margin: '0 0 0.375rem', whiteSpace: 'pre-line' }}>{brand.address}</p>}
            {brand.copyrightText && <p style={{ fontSize: '0.75rem', color: body, margin: 0 }}>{brand.copyrightText}</p>}
          </div>
          {!!config.links?.length && (
            <div className="spc-twocol-right" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              {config.links.map((l) => (
                <a key={l.id} href={l.url} style={{ fontSize: '0.875rem', color: link, textDecoration: 'none' }}>{l.label}</a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Social icons as the visual hero, centred and prominent. Thin copyright + links line below.
function FooterSocialFocused({ config, brand, maxWidth = 896 }: FooterProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  const icon = config.iconColor ?? 'var(--foreground)'
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 480px) {
          .spc-social-links-row { flex-direction: column !important; gap: 0.5rem !important; }
        }
      `}} />
      <div style={{ background: bg, borderTop: '1px solid var(--border)', padding: sectionPad(config.padding, '2', '1.5'), textAlign: 'center' }}>
        <div style={wrap(config.fullWidth, maxWidth)}>
          {!!brand.socialLinks?.length && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {brand.socialLinks.map((sl) => {
                const Icon = SOCIAL_ICONS[sl.platform]
                return Icon ? (
                  <a key={sl.id} href={sl.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: icon, display: 'block' }}
                    className="transition-opacity hover:opacity-70">
                    <Icon className="h-7 w-7" />
                    <span className="sr-only">{sl.platform}</span>
                  </a>
                ) : null
              })}
            </div>
          )}
          <div className="spc-social-links-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.25rem 1rem' }}>
            {config.links?.map((l) => (
              <a key={l.id} href={l.url} style={{ fontSize: '0.75rem', color: link, textDecoration: 'none' }}>{l.label}</a>
            ))}
            {brand.copyrightText && (
              <span style={{ fontSize: '0.75rem', color: body }}>{brand.copyrightText}</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// All footer content in a raised card. Outer wrapper is transparent so it inherits
// the page background (pageBackgroundColor applied on the outer shell div).
function FooterStackedCard({ config, brand, maxWidth = 896 }: FooterProps) {
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  const icon = config.iconColor ?? link
  return (
    <div style={{ background: 'transparent', padding: sectionPad(config.padding, '1.5', '1.5') }}>
      <div style={{
        ...wrap(config.fullWidth, maxWidth),
        background: config.backgroundColor ?? 'var(--card)',
        borderRadius: '0.75rem',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 120, marginBottom: '1rem', display: 'inline-block' }} />}
        {!!brand.socialLinks?.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <SocialIcons links={brand.socialLinks} color={icon} />
          </div>
        )}
        {!!config.links?.length && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem 1rem', marginBottom: '0.75rem' }}>
            {config.links.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.8125rem', color: link, textDecoration: 'none' }}>{l.label}</a>)}
          </div>
        )}
        {brand.address && <p style={{ fontSize: '0.75rem', color: body, margin: '0 0 0.375rem' }}>{brand.address}</p>}
        {brand.copyrightText && <p style={{ fontSize: '0.75rem', color: body, margin: 0 }}>{brand.copyrightText}</p>}
      </div>
    </div>
  )
}

// ─── Footer layouts F10–F11 ──────────────────────────────────────────────────

// Ultra-compact single line: logo · links · copyright — all inline.
function FooterInlineLogo({ config, brand, maxWidth = 896 }: FooterProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  const accent = config.accentColor ?? 'var(--primary)'
  const links = config.links ?? []
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .spc-inline-row { flex-direction: column !important; gap: 0.5rem !important; }
          .spc-inline-sep { display: none !important; }
          .spc-inline-links { flex-direction: column !important; gap: 0.375rem !important; }
        }
      `}} />
      <div style={{ background: bg, borderTop: `2px solid ${accent}`, padding: '0.625rem 1.5rem' }}>
        <div className="spc-inline-row" style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 24, maxWidth: 80, flexShrink: 0 }} />}
          {brand.logoUrl && (links.length > 0 || !!brand.copyrightText) && (
            <span className="spc-inline-sep" style={{ color: body, opacity: 0.35 }}>•</span>
          )}
          {links.length > 0 && (
            <div className="spc-inline-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {links.map((l, i) => (
                <span key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <a href={l.url} style={{ fontSize: '0.8125rem', color: link, textDecoration: 'none' }}>{l.label}</a>
                  {i < links.length - 1 && <span className="spc-inline-sep" style={{ color: body, opacity: 0.35 }}>·</span>}
                </span>
              ))}
            </div>
          )}
          {brand.copyrightText && (
            <>
              {links.length > 0 && <span className="spc-inline-sep" style={{ color: body, opacity: 0.35 }}>•</span>}
              <span style={{ fontSize: '0.75rem', color: body }}>{brand.copyrightText}</span>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// Two-panel: narrow accent panel left (logo), wide content panel right (address + links).
function FooterLeftPanel({ config, brand, maxWidth = 896 }: FooterProps) {
  const panelBg = config.accentColor ?? 'var(--primary)'
  const mainBg = config.backgroundColor ?? 'var(--card)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const link = config.linkColor ?? 'var(--muted-foreground)'
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .spc-leftpanel-outer { flex-direction: column !important; }
          .spc-leftpanel-side { min-width: 0 !important; width: 100% !important; padding: 1.25rem 1.5rem !important; }
          .spc-leftpanel-main { flex-direction: column !important; align-items: center !important; text-align: center !important; justify-content: center !important; }
          .spc-leftpanel-links { justify-content: center !important; }
        }
      `}} />
      <div className="spc-leftpanel-outer" style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
        <div className="spc-leftpanel-side" style={{ background: panelBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', minWidth: 160, flexShrink: 0 }}>
          {brand.logoUrl
            ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 40, maxWidth: 120 }} />
            : <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-foreground)' }}>Brand</span>}
        </div>
        <div className="spc-leftpanel-main" style={{ background: mainBg, flex: '1 1 0', padding: sectionPad(config.padding, '1.5', '2'), display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
          <div>
            {brand.address && <p style={{ fontSize: '0.8125rem', color: body, margin: '0 0 0.25rem', whiteSpace: 'pre-line' }}>{brand.address}</p>}
            {brand.copyrightText && <p style={{ fontSize: '0.75rem', color: body, margin: 0, opacity: 0.7 }}>{brand.copyrightText}</p>}
          </div>
          {!!config.links?.length && (
            <div className="spc-leftpanel-links" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', justifyContent: 'flex-end' }}>
              {config.links.map((l) => <a key={l.id} href={l.url} style={{ fontSize: '0.8125rem', color: link, textDecoration: 'none' }}>{l.label}</a>)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Logo centred, then a button-styled "Manage preferences" link next to an "Unsubscribe" text link, then copyright.
function FooterLogoCta({ config, brand, maxWidth = 896 }: FooterProps) {
  const bg = config.backgroundColor ?? 'var(--card)'
  const btnBg = config.buttonBgColor ?? 'var(--primary)'
  const btnFg = config.buttonTextColor ?? 'var(--primary-foreground)'
  const body = config.bodyColor ?? 'var(--muted-foreground)'
  const copyright = brand.copyrightText ?? `© ${new Date().getFullYear()} Your Company`
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 480px) {
          .spc-logocta-actions { flex-direction: column !important; gap: 0.625rem !important; }
        }
      `}} />
      <div style={{ background: bg, borderTop: '1px solid var(--border)', padding: sectionPad(config.padding, '2', '1.5') }}>
        <div style={{ ...wrap(config.fullWidth, maxWidth), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {brand.logoUrl
            ? <img src={brand.logoUrl} alt="Logo" style={{ maxHeight: 36, maxWidth: 140, display: 'block' }} />
            : <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)' }}>Your Company</span>}
          <div className="spc-logocta-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a href="#" style={{ display: 'inline-block', padding: '0.375rem 1rem', background: btnBg, color: btnFg, fontSize: '0.8125rem', fontWeight: 500, borderRadius: '0.375rem', textDecoration: 'none' }}>
              Manage preferences
            </a>
            <a href="#" style={{ fontSize: '0.8125rem', color: body, textDecoration: 'underline' }}>Unsubscribe</a>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: body, opacity: 0.7, textAlign: 'center' }}>{copyright}</p>
        </div>
      </div>
    </>
  )
}

export function RenderedFooter({ config, brand, contentMaxWidth }: { config: FooterConfig; brand: Brand; contentMaxWidth?: number }) {
  const maxWidth = contentMaxWidth ?? 896
  const p = { config, brand, maxWidth }
  const layout = config.customHtml
    ? <div dangerouslySetInnerHTML={{ __html: config.customHtml }} />
    : (() => { switch (config.layout) {
        case 'centred-stack':      return <FooterCentredStack {...p} />
        case 'multi-column':       return <FooterMultiColumn {...p} />
        case 'dark-band':          return <FooterAccentBand {...p} />
        case 'minimal-line':       return <FooterMinimalLine {...p} />
        case 'split-cta':          return <FooterSplitCta {...p} />
        case 'unsubscribe-focus':  return <FooterUnsubscribeFocus {...p} />
        case 'two-col':            return <FooterTwoCol {...p} />
        case 'social-focused':     return <FooterSocialFocused {...p} />
        case 'stacked-card':       return <FooterStackedCard {...p} />
        case 'inline-logo':        return <FooterInlineLogo {...p} />
        case 'left-panel':         return <FooterLeftPanel {...p} />
        case 'logo-cta':           return <FooterLogoCta {...p} />
        default:                   return <FooterMinimalLine {...p} />
      }})()
  const wrapped = config.imageBackground && config.imageUrl
    ? <ImageBackgroundWrapper config={config}>{layout}</ImageBackgroundWrapper>
    : layout
  return (
    <>
      {config.customCss && <style dangerouslySetInnerHTML={{ __html: config.customCss }} />}
      {config.footerImageUrl && (
        <img src={config.footerImageUrl} alt="" style={{ display: 'block', width: '100%', height: config.footerImageHeight ?? 240, objectFit: 'cover' }} />
      )}
      {wrapped}
    </>
  )
}

// Legacy shim — keeps old imports compiling while callers are migrated
export function RenderedBannerFooter(_props: unknown) { return null }
