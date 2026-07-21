import type { Brand, EmailBannerLayout, EmailFooterLayout } from '@/lib/subscription-centre'

export interface EmailLayoutColorOptions {
  bgColor?: string
  textColor?: string
  linkColor?: string
  accentColor?: string
  heading?: string
  subheading?: string
  logoMaxWidth?: number
  logoMaxHeight?: number
  logoPosition?: 'left' | 'center' | 'right'
  padding?: number | 'compact' | 'spacious'
}

// Scales every hardcoded vertical padding value in a layout by the ratio between the
// user's chosen padding and that layout's own "normal" baseline, preserving each layout's
// asymmetric top/bottom shape (e.g. logo-centered's 26px-top/22px-bottom) rather than
// flattening every row to one identical number.
function paddingScale(padding: number | 'compact' | 'spacious' | undefined, normalBase: number): number {
  if (typeof padding === 'number') return padding / normalBase
  if (padding === 'compact') return 0.6
  if (padding === 'spacious') return 1.6
  return 1
}

function esc(s?: string): string {
  if (!s) return ''
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escAttr(s?: string): string {
  if (!s) return ''
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function logoOrName(logo: string | undefined, fg: string, height = 40, maxWidth = 160): string {
  return logo
    ? `<img src="${escAttr(logo)}" alt="" height="${height}" style="display:block;max-width:${maxWidth}px;height:auto;max-height:${height}px;border:0;" />`
    : `<span style="font-size:16px;font-weight:700;color:${escAttr(fg)};font-family:Arial,sans-serif;">Your Company</span>`
}

// ─── Email banner generators ───────────────────────────────────────────────────

export function generateEmailBannerHtml(
  layout: EmailBannerLayout,
  brand: Brand,
  opts: EmailLayoutColorOptions = {}
): string {
  const bg = opts.bgColor ?? '#ffffff'
  const fg = opts.textColor ?? '#111111'
  const link = opts.linkColor ?? fg
  const heading = opts.heading || 'Email from us'
  const subheading = opts.subheading || ''
  const logoH = opts.logoMaxHeight ?? 40
  const logoW = opts.logoMaxWidth ?? 180

  switch (layout) {
    case 'logo-centered': {
      const align = opts.logoPosition ?? 'center'
      const scale = paddingScale(opts.padding, 26)
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td align="${align}" style="padding:${Math.round(26 * scale)}px 40px ${Math.round(22 * scale)}px;">`,
        `      ${logoOrName(brand.logoUrl, fg, logoH, logoW)}`,
        `    </td>`,
        `  </tr>`,
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `</table>`,
      ].join('\n')
    }

    case 'logo-left': {
      const align = opts.logoPosition ?? 'left'
      const pad = Math.round(16 * paddingScale(opts.padding, 16))
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td style="padding:${pad}px 40px;">`,
        `      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`,
        `        <td align="${align}">${logoOrName(brand.logoUrl, fg, logoH, logoW)}</td>`,
        brand.backUrl
          ? `        <td align="right"><a href="${escAttr(brand.backUrl)}" style="font-size:12px;color:${escAttr(link)};text-decoration:none;font-family:Arial,sans-serif;">Back to website &rarr;</a></td>`
          : '',
        `      </tr></table>`,
        `    </td>`,
        `  </tr>`,
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `</table>`,
      ].join('\n')
    }

    case 'heading-band': {
      const align = opts.logoPosition ?? 'center'
      const scale = paddingScale(opts.padding, 26)
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td align="${align}" style="padding:${Math.round(26 * scale)}px 40px ${Math.round(16 * scale)}px;">`,
        `      ${logoOrName(brand.logoUrl, fg, logoH, logoW)}`,
        `    </td>`,
        `  </tr>`,
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `  <tr>`,
        `    <td align="center" style="padding:${Math.round(20 * scale)}px 40px ${Math.round(28 * scale)}px;">`,
        `      <p style="margin:0;font-size:22px;font-weight:700;color:${escAttr(fg)};font-family:Arial,sans-serif;">${esc(heading)}</p>`,
        subheading ? `      <p style="margin:8px 0 0;font-size:14px;color:${escAttr(fg)};opacity:0.65;font-family:Arial,sans-serif;">${esc(subheading)}</p>` : '',
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    // Logo + "Back to website" row, then a centred heading/blurb band below — a bulletproof
    // nested-table equivalent of the web Bar + CTA banner.
    case 'bar-cta': {
      const scale = paddingScale(opts.padding, 22)
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td style="padding:${Math.round(18 * scale)}px 40px 0;">`,
        `      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`,
        `        <td align="left">${logoOrName(brand.logoUrl, fg, logoH, logoW)}</td>`,
        brand.backUrl
          ? `        <td align="right"><a href="${escAttr(brand.backUrl)}" style="font-size:12px;color:${escAttr(link)};text-decoration:none;font-family:Arial,sans-serif;">Back to website &rarr;</a></td>`
          : '',
        `      </tr></table>`,
        `    </td>`,
        `  </tr>`,
        `  <tr>`,
        `    <td style="padding:${Math.round(22 * scale)}px 40px ${Math.round(18 * scale)}px;">`,
        `      <p style="margin:0;font-size:20px;font-weight:700;color:${escAttr(fg)};font-family:Arial,sans-serif;">${esc(heading)}</p>`,
        subheading ? `      <p style="margin:6px 0 0;font-size:14px;color:${escAttr(fg)};font-family:Arial,sans-serif;">${esc(subheading)}</p>` : '',
        `    </td>`,
        `  </tr>`,
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `</table>`,
      ].join('\n')
    }

    // Solid accent stripe + logo in a fixed-width left column, heading/blurb filling the
    // rest — a single table row with fixed-width cells, which is the bulletproof way to get
    // a side-by-side layout in email (no flexbox, so this is a genuine table, not a port).
    case 'brand-band': {
      const accent = opts.accentColor ?? link
      const scale = paddingScale(opts.padding, 22)
      const pad = Math.round(22 * scale)
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td width="4" style="background-color:${escAttr(accent)};font-size:0;line-height:0;">&nbsp;</td>`,
        `    <td width="150" style="padding:${pad}px 16px ${pad}px 24px;border-right:1px solid #e5e5e5;" align="left">${logoOrName(brand.logoUrl, fg, Math.min(logoH, 32), Math.min(logoW, 120))}</td>`,
        `    <td style="padding:${pad}px 24px;" align="left">`,
        `      <p style="margin:0;font-size:18px;font-weight:700;color:${escAttr(fg)};line-height:1.3;font-family:Arial,sans-serif;">${esc(heading)}</p>`,
        subheading ? `      <p style="margin:4px 0 0;font-size:13px;color:${escAttr(fg)};opacity:0.75;font-family:Arial,sans-serif;">${esc(subheading)}</p>` : '',
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    // Bold full-bleed colour band, centred logo/heading/blurb — no drop shadow or background
    // image (Outlook needs VML for those), just a solid background-color cell, which renders
    // identically everywhere.
    case 'feature-hero': {
      const scale = paddingScale(opts.padding, 34)
      const sz = { h: Math.min(logoH, 32), w: Math.min(logoW, 120) }
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td align="center" style="padding:${Math.round(34 * scale)}px 40px;">`,
        brand.logoUrl ? `      <img src="${escAttr(brand.logoUrl)}" alt="" height="${sz.h}" style="display:block;margin:0 auto 16px;max-width:${sz.w}px;height:auto;max-height:${sz.h}px;border:0;opacity:0.9;" />` : '',
        `      <p style="margin:0 0 10px;font-size:26px;font-weight:800;color:${escAttr(fg)};line-height:1.15;font-family:Arial,sans-serif;">${esc(heading)}</p>`,
        subheading ? `      <p style="margin:0;font-size:15px;color:${escAttr(fg)};opacity:0.85;line-height:1.5;font-family:Arial,sans-serif;">${esc(subheading)}</p>` : '',
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    default:
      return generateEmailBannerHtml('heading-band', brand, opts)
  }
}

// ─── Email body (rich text) — email-safe wrapper ───────────────────────────────
//
// The rich text editor (Tiptap) outputs clean semantic HTML — <p>, <h1-4>, <ul>/<ol>/<li>,
// <a>, <blockquote>, <hr>, <table> — visually styled in the builder by a Tailwind class
// (richTextContentClass in rich-text-editor.tsx). That works in a browser with the app's
// stylesheet loaded, but email clients strip <style> blocks and ignore CSS classes far
// more aggressively than they mangle div-based layout even — the only thing that reliably
// survives across Gmail/Outlook/Apple Mail is a `style=""` attribute on every element, and
// a <table> wrapper the same way the banner/footer already use, not a bare <div>.
//
// TextStyle+Color and TextAlign already emit inline `style="color:…"` / `style="text-
// align:…"` directly — that's Tiptap's own behaviour, not something we add — so this only
// needs to inline sizing/spacing for the structural tags, merging into any style attribute
// a tag already carries rather than clobbering it.

function styleTag(html: string, tag: string, css: string): string {
  const re = new RegExp(`<${tag}(\\s[^>]*)?>`, 'g')
  return html.replace(re, (_match, attrs: string | undefined) => {
    const a = attrs ?? ''
    const styleMatch = /\sstyle="([^"]*)"/.exec(a)
    if (styleMatch) {
      const withoutStyle = a.slice(0, styleMatch.index) + a.slice(styleMatch.index + styleMatch[0].length)
      return `<${tag}${withoutStyle} style="${css};${styleMatch[1]}">`
    }
    return `<${tag}${a} style="${css}">`
  })
}

export interface EmailBodyOptions {
  textColor?: string
  linkColor?: string
  bgColor?: string
  buttonBgColor?: string
  buttonTextColor?: string
  padding?: number | 'compact' | 'spacious'
}

// Wraps rich-text bodyHtml in a 650px table matching the banner/footer's own structure,
// and inlines the same visual treatment richTextContentClass gives it in the builder.
export function generateEmailBodyHtml(bodyHtml: string, opts: EmailBodyOptions = {}): string {
  const text = opts.textColor ?? '#1a1a1a'
  const linkC = opts.linkColor ?? '#2563eb'
  const bg = opts.bgColor ?? '#ffffff'
  const btnBg = opts.buttonBgColor ?? '#2563eb'
  const btnFg = opts.buttonTextColor ?? '#ffffff'
  const pad = Math.round(24 * paddingScale(opts.padding, 24))

  let html = bodyHtml || '<p style="color:#9ca3af;font-style:italic;margin:0;">No body content yet.</p>'

  // Button-styled links (data-button="true", set via the editor's "Insert button" tool) get
  // their own look BEFORE the general <a> pass below. styleTag's merge puts new css first and
  // an existing style value after, so whichever comes LAST in the merged string wins for any
  // overlapping property — running this pass first means the button's own colour/no-underline
  // survive the general link pass rather than being stomped by it.
  html = html.replace(/<a([^>]*\sdata-button="true"[^>]*)>/g, (_match, attrs: string) => {
    const buttonCss = `display:inline-block;background:${btnBg};color:${btnFg};padding:10px 22px;border-radius:6px;font-weight:600;text-decoration:none;`
    const styleMatch = /\sstyle="([^"]*)"/.exec(attrs)
    if (styleMatch) {
      const withoutStyle = attrs.slice(0, styleMatch.index) + attrs.slice(styleMatch.index + styleMatch[0].length)
      return `<a${withoutStyle} style="${buttonCss};${styleMatch[1]}">`
    }
    return `<a${attrs} style="${buttonCss}">`
  })

  html = styleTag(html, 'p', 'margin:0 0 16px;font-size:14px;line-height:1.6;')
  html = styleTag(html, 'h1', 'margin:0 0 16px;font-size:28px;font-weight:700;line-height:1.25;')
  html = styleTag(html, 'h2', 'margin:0 0 14px;font-size:24px;font-weight:700;line-height:1.3;')
  html = styleTag(html, 'h3', 'margin:0 0 12px;font-size:20px;font-weight:600;line-height:1.35;')
  html = styleTag(html, 'h4', 'margin:0 0 10px;font-size:16px;font-weight:600;line-height:1.4;')
  html = styleTag(html, 'a', `color:${linkC};text-decoration:underline;`)
  html = styleTag(html, 'ul', 'margin:0 0 16px;padding-left:20px;')
  html = styleTag(html, 'ol', 'margin:0 0 16px;padding-left:20px;')
  html = styleTag(html, 'li', 'margin:0 0 4px;font-size:14px;line-height:1.6;')
  html = styleTag(html, 'blockquote', 'margin:0 0 16px;padding:4px 0 4px 16px;border-left:3px solid #e5e5e5;color:#666666;')
  html = styleTag(html, 'code', 'background:#f3f3f3;padding:2px 5px;border-radius:3px;font-family:Consolas,Monaco,monospace;font-size:13px;')
  html = styleTag(html, 'table', 'border-collapse:collapse;width:100%;margin:0 0 16px;')
  html = styleTag(html, 'th', 'border:1px solid #e0e0e0;background:#f7f7f7;padding:8px 12px;text-align:left;font-size:13px;font-weight:600;')
  html = styleTag(html, 'td', 'border:1px solid #e0e0e0;padding:8px 12px;font-size:13px;')
  html = html.replace(/<hr(\s[^>]*)?>/g, '<hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;" />')
  html = html.replace(/<table/g, '<table cellpadding="0" cellspacing="0" border="0"')

  return [
    `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
    `  <tr>`,
    `    <td style="padding:${pad}px 40px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${escAttr(text)};">`,
    `      ${html}`,
    `    </td>`,
    `  </tr>`,
    `</table>`,
  ].join('\n')
}

// ─── Email footer generators ───────────────────────────────────────────────────

const UNSUB_URL = '{{{unsubscribe_url}}}'
const PREFS_URL = '{{{preferences_url}}}'

// Social icon graphics need hosted image assets this app doesn't have, so the email-safe
// fallback (a legitimate, common pattern when icon assets aren't available) is plain text
// platform names as links, same underlying brand.socialLinks data the web footer uses.
const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook', x: 'X', instagram: 'Instagram', linkedin: 'LinkedIn',
  youtube: 'YouTube', tiktok: 'TikTok', pinterest: 'Pinterest', threads: 'Threads',
}

export function generateEmailFooterHtml(
  layout: EmailFooterLayout,
  brand: Brand,
  opts: EmailLayoutColorOptions = {}
): string {
  const bg = opts.bgColor ?? 'transparent'
  const fg = opts.textColor ?? '#999999'
  const link = opts.linkColor ?? fg
  const logoH = opts.logoMaxHeight ?? 28
  const logoW = opts.logoMaxWidth ?? 120
  const logoAlign = opts.logoPosition ?? 'left'
  const copyright = brand.copyrightText
    ? esc(brand.copyrightText)
    : `&copy; ${new Date().getFullYear()} Your Company`
  const addressHtml = brand.address ? esc(brand.address).replace(/\n/g, '<br />') : ''
  const logo = brand.logoUrl

  switch (layout) {
    case 'minimal': {
      const pad = Math.round(18 * paddingScale(opts.padding, 18))
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr><td style="border-top:1px solid ${escAttr(fg)};opacity:0.15;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>`,
        `  <tr>`,
        `    <td style="padding:${pad}px 40px;text-align:center;font-size:12px;color:${escAttr(fg)};font-family:Arial,sans-serif;line-height:1.6;">`,
        `      ${copyright} &middot; <a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    case 'links-copyright': {
      const scale = paddingScale(opts.padding, 22)
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        logo
          ? `  <tr><td align="${logoAlign}" style="padding:${Math.round(22 * scale)}px 40px ${Math.round(16 * scale)}px;"><img src="${escAttr(logo)}" alt="" height="${logoH}" style="display:block;max-width:${logoW}px;height:auto;max-height:${logoH}px;border:0;" /></td></tr>`
          : '',
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `  <tr>`,
        `    <td style="padding:${Math.round(16 * scale)}px 40px ${Math.round(22 * scale)}px;font-size:12px;color:${escAttr(fg)};font-family:Arial,sans-serif;line-height:1.6;">`,
        `      <p style="margin:0 0 4px;">${copyright}</p>`,
        `      <p style="margin:0;"><a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a> &middot; <a href="${PREFS_URL}" style="color:${escAttr(link)};text-decoration:underline;">Manage preferences</a></p>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    case 'address-footer': {
      const pad = Math.round(18 * paddingScale(opts.padding, 18))
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `  <tr>`,
        `    <td style="padding:${pad}px 40px;font-size:11px;color:${escAttr(fg)};font-family:Arial,sans-serif;line-height:1.7;">`,
        addressHtml ? `      <p style="margin:0 0 6px;">${addressHtml}</p>` : '',
        `      <p style="margin:0;">${copyright} &middot; <a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a></p>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    // Logo + address/copyright in a fixed-width left column, Unsubscribe/Manage preferences
    // stacked right-aligned in a fixed-width right column — one table row, two cells.
    case 'two-col': {
      const pad = Math.round(20 * paddingScale(opts.padding, 20))
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td width="325" valign="top" style="padding:${pad}px 20px ${pad}px 40px;font-family:Arial,sans-serif;">`,
        logo ? `      <img src="${escAttr(logo)}" alt="" height="${logoH}" style="display:block;max-width:${logoW}px;height:auto;max-height:${logoH}px;border:0;margin:0 0 10px;" />` : '',
        addressHtml ? `      <p style="margin:0 0 4px;font-size:12px;color:${escAttr(fg)};">${addressHtml}</p>` : '',
        `      <p style="margin:0;font-size:11px;color:${escAttr(fg)};">${copyright}</p>`,
        `    </td>`,
        `    <td width="325" valign="top" align="right" style="padding:${pad}px 40px ${pad}px 20px;font-family:Arial,sans-serif;">`,
        `      <p style="margin:0 0 4px;font-size:12px;"><a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a></p>`,
        `      <p style="margin:0;font-size:12px;"><a href="${PREFS_URL}" style="color:${escAttr(link)};text-decoration:underline;">Manage preferences</a></p>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    // Social platform names as text links (no icon graphics — see SOCIAL_LABELS above),
    // centred, then copyright + Unsubscribe below. No logo, mirroring the web layout's
    // social-first emphasis.
    case 'social-focused': {
      const pad = Math.round(20 * paddingScale(opts.padding, 20))
      const socialLinks = brand.socialLinks ?? []
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr><td style="border-top:1px solid ${escAttr(fg)};opacity:0.15;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>`,
        `  <tr>`,
        `    <td align="center" style="padding:${pad}px 40px;font-family:Arial,sans-serif;">`,
        socialLinks.length
          ? `      <p style="margin:0 0 10px;font-size:12px;">${socialLinks.map((sl) => `<a href="${escAttr(sl.url)}" style="color:${escAttr(link)};text-decoration:none;margin:0 6px;font-weight:600;">${SOCIAL_LABELS[sl.platform] ?? sl.platform}</a>`).join('')}</p>`
          : '',
        `      <p style="margin:0;font-size:12px;color:${escAttr(fg)};">${copyright} &middot; <a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a></p>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    // Logo left, copyright + Unsubscribe right, single row, coloured top border — the
    // horizontal counterpart to Links + copyright's stacked rows.
    case 'inline-band': {
      const accent = opts.accentColor ?? link
      const pad = Math.round(16 * paddingScale(opts.padding, 16))
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};border-top:3px solid ${escAttr(accent)};">`,
        `  <tr>`,
        logo
          ? `    <td width="140" valign="middle" align="left" style="padding:${pad}px 16px ${pad}px 40px;"><img src="${escAttr(logo)}" alt="" height="${logoH}" style="display:block;max-width:${logoW}px;height:auto;max-height:${logoH}px;border:0;" /></td>`
          : `    <td valign="middle" align="left" style="padding:${pad}px 16px ${pad}px 40px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${escAttr(fg)};">Your Company</td>`,
        `    <td valign="middle" align="right" style="padding:${pad}px 40px ${pad}px 16px;font-family:Arial,sans-serif;font-size:11px;color:${escAttr(fg)};">`,
        `      ${copyright} &middot; <a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }

    default:
      return generateEmailFooterHtml('minimal', brand, opts)
  }
}
