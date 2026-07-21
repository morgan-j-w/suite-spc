import type { Brand, EmailBannerLayout, EmailFooterLayout } from '@/lib/subscription-centre'

export interface EmailLayoutColorOptions {
  bgColor?: string
  textColor?: string
  linkColor?: string
  heading?: string
  subheading?: string
  logoMaxWidth?: number
  logoMaxHeight?: number
  logoPosition?: 'left' | 'center' | 'right'
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
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td align="${align}" style="padding:26px 40px 22px;">`,
        `      ${logoOrName(brand.logoUrl, fg, logoH, logoW)}`,
        `    </td>`,
        `  </tr>`,
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `</table>`,
      ].join('\n')
    }

    case 'logo-left': {
      const align = opts.logoPosition ?? 'left'
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td style="padding:16px 40px;">`,
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

    case 'heading-band':
    default: {
      const align = opts.logoPosition ?? 'center'
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr>`,
        `    <td align="${align}" style="padding:26px 40px 16px;">`,
        `      ${logoOrName(brand.logoUrl, fg, logoH, logoW)}`,
        `    </td>`,
        `  </tr>`,
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `  <tr>`,
        `    <td align="center" style="padding:20px 40px 28px;">`,
        `      <p style="margin:0;font-size:22px;font-weight:700;color:${escAttr(fg)};font-family:Arial,sans-serif;">${esc(heading)}</p>`,
        subheading ? `      <p style="margin:8px 0 0;font-size:14px;color:${escAttr(fg)};opacity:0.65;font-family:Arial,sans-serif;">${esc(subheading)}</p>` : '',
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
    }
  }
}

// ─── Email footer generators ───────────────────────────────────────────────────

const UNSUB_URL = '{{{unsubscribe_url}}}'
const PREFS_URL = '{{{preferences_url}}}'

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
    case 'minimal':
    default:
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr><td style="border-top:1px solid ${escAttr(fg)};opacity:0.15;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>`,
        `  <tr>`,
        `    <td style="padding:18px 40px;text-align:center;font-size:12px;color:${escAttr(fg)};font-family:Arial,sans-serif;line-height:1.6;">`,
        `      ${copyright} &middot; <a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')

    case 'links-copyright':
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        logo
          ? `  <tr><td align="${logoAlign}" style="padding:22px 40px 16px;"><img src="${escAttr(logo)}" alt="" height="${logoH}" style="display:block;max-width:${logoW}px;height:auto;max-height:${logoH}px;border:0;" /></td></tr>`
          : '',
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `  <tr>`,
        `    <td style="padding:16px 40px 22px;font-size:12px;color:${escAttr(fg)};font-family:Arial,sans-serif;line-height:1.6;">`,
        `      <p style="margin:0 0 4px;">${copyright}</p>`,
        `      <p style="margin:0;"><a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a> &middot; <a href="${PREFS_URL}" style="color:${escAttr(link)};text-decoration:underline;">Manage preferences</a></p>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')

    case 'address-footer':
      return [
        `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:650px;background-color:${escAttr(bg)};">`,
        `  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid ${escAttr(fg)};opacity:0.15;margin:0;" /></td></tr>`,
        `  <tr>`,
        `    <td style="padding:18px 40px;font-size:11px;color:${escAttr(fg)};font-family:Arial,sans-serif;line-height:1.7;">`,
        addressHtml ? `      <p style="margin:0 0 6px;">${addressHtml}</p>` : '',
        `      <p style="margin:0;">${copyright} &middot; <a href="${UNSUB_URL}" style="color:${escAttr(link)};text-decoration:underline;">Unsubscribe</a></p>`,
        `    </td>`,
        `  </tr>`,
        `</table>`,
      ].join('\n')
  }
}
