// Hardcoded reference catalogue of card style previews shown on the Theme tab.
// Once this tool connects to the real system, this will be populated dynamically
// per account instead of made up per theme.

import type { ColorTheme } from '@/lib/brand-config'

export interface StylePreview {
  label: string
  description: string
  background: string
  heading: string
  buttonBackground: string
  buttonText: string
  noPadding?: boolean
  // Explicit card border color -- only the real reference's "Border -" variants set this;
  // every other style relies on the card's own default border, same as before.
  cardBorder?: string
  // Set only when buttonBackground equals background -- without a border the button would
  // blend invisibly into the card behind it. Computed in getStylePreviews, not set per-style.
  buttonBorder?: string
}

type ColorRole = 'white' | 'dark' | 'charcoal' | 'brand' | 'light1' | 'light2' | 'warm' | 'grey'

interface ThemePalette {
  colors: Record<ColorRole, string>
  names: Record<ColorRole, string>
}

const palettes: Record<Exclude<ColorTheme, 'coastal'>, ThemePalette> = {
  blue: {
    colors: { white: '#FFFFFF', dark: '#1B2333', charcoal: '#2E3B4A', brand: '#2F5FB3', light1: '#4FA3DB', light2: '#7FD8CE', warm: '#D2C8AE', grey: '#E2E4E8' },
    names: { white: 'white', dark: 'navy', charcoal: 'granite', brand: 'blue', light1: 'sky', light2: 'aqua', warm: 'fawn', grey: 'grey' },
  },
  green: {
    colors: { white: '#FFFFFF', dark: '#1B3324', charcoal: '#2C3B35', brand: '#2F8F5B', light1: '#6FC9A0', light2: '#A8D9B9', warm: '#D9D2B0', grey: '#E3E6E2' },
    names: { white: 'white', dark: 'forest', charcoal: 'slate', brand: 'green', light1: 'mint', light2: 'sage', warm: 'sand', grey: 'grey' },
  },
  orange: {
    colors: { white: '#FFFFFF', dark: '#3A2317', charcoal: '#3A2C22', brand: '#E2702A', light1: '#F2A45C', light2: '#F7C998', warm: '#EADFC8', grey: '#EDE7E1' },
    names: { white: 'white', dark: 'espresso', charcoal: 'charcoal', brand: 'orange', light1: 'peach', light2: 'apricot', warm: 'cream', grey: 'grey' },
  },
  purple: {
    colors: { white: '#FFFFFF', dark: '#241B33', charcoal: '#2E2640', brand: '#6A3FB5', light1: '#A88AE0', light2: '#C9B6EE', warm: '#E3D2D9', grey: '#E6E3EA' },
    names: { white: 'white', dark: 'midnight', charcoal: 'charcoal', brand: 'purple', light1: 'lavender', light2: 'lilac', warm: 'blush', grey: 'grey' },
  },
  neutral: {
    colors: { white: '#FFFFFF', dark: '#1F1F1F', charcoal: '#3A3A3A', brand: '#111111', light1: '#9A9A9A', light2: '#BFBFBF', warm: '#D8D2C4', grey: '#E4E4E4' },
    names: { white: 'white', dark: 'charcoal', charcoal: 'slate', brand: 'black', light1: 'silver', light2: 'stone', warm: 'sand', grey: 'grey' },
  },
}

const COASTAL_BRAND: { hex: string; label: string }[] = [
  { hex: '#FFFAF5', label: 'Warm white' },
  { hex: '#89DDE8', label: 'Arctic' },
  { hex: '#FE976F', label: 'Coral' },
  { hex: '#FF6936', label: 'Salmon' },
  { hex: '#45BED3', label: 'Sky' },
  { hex: '#00607B', label: 'Ocean' },
  { hex: '#003C51', label: 'Midnight' },
  { hex: '#10191A', label: 'Rich charcoal' },
]

const ROLE_ORDER: ColorRole[] = ['white', 'light1', 'light2', 'warm', 'grey', 'brand', 'charcoal', 'dark']

export function getThemeBrandColors(theme: ColorTheme): { hex: string; label: string }[] {
  if (theme === 'coastal') return COASTAL_BRAND
  const palette = palettes[theme]
  return ROLE_ORDER.map((role) => ({ hex: palette.colors[role], label: capitalize(palette.names[role]) }))
}

// Lifted directly from a real client theme reference -- 19 fixed styles, not a recolored
// template. Unlike the other 5 mock themes, every value here (background, heading, button
// colors, descriptions, order) is copied verbatim rather than generated from styleTemplates.
const WARM_WHITE = '#FFFAF5'
const RICH_CHARCOAL = '#10191A'
const MIDNIGHT = '#003C51'

const coastalStylePreviews: StylePreview[] = [
  { label: 'Style 1', description: 'Warm white background with rich charcoal headings and warm white buttons', background: WARM_WHITE, heading: RICH_CHARCOAL, buttonBackground: WARM_WHITE, buttonText: RICH_CHARCOAL },
  { label: 'Style 2', description: 'Warm white background with rich charcoal headings and midnight buttons', background: WARM_WHITE, heading: RICH_CHARCOAL, buttonBackground: MIDNIGHT, buttonText: WARM_WHITE },
  { label: 'Style 3', description: 'Border - Warm white background with rich charcoal headings and warm white buttons', background: WARM_WHITE, heading: RICH_CHARCOAL, buttonBackground: WARM_WHITE, buttonText: RICH_CHARCOAL, cardBorder: RICH_CHARCOAL },
  { label: 'Style 4', description: 'Border - Warm white background with rich charcoal headings and midnight buttons', background: WARM_WHITE, heading: RICH_CHARCOAL, buttonBackground: MIDNIGHT, buttonText: WARM_WHITE, cardBorder: RICH_CHARCOAL },
  { label: 'Style 5', description: 'No padding - Warm white background with rich charcoal headings and warm white buttons', background: WARM_WHITE, heading: RICH_CHARCOAL, buttonBackground: WARM_WHITE, buttonText: RICH_CHARCOAL, noPadding: true },
  { label: 'Style 6', description: 'No padding - Warm white background with rich charcoal headings and midnight buttons', background: WARM_WHITE, heading: RICH_CHARCOAL, buttonBackground: MIDNIGHT, buttonText: WARM_WHITE, noPadding: true },
  { label: 'Style 7', description: 'Coral background with rich charcoal headings and coral buttons', background: '#FE976F', heading: RICH_CHARCOAL, buttonBackground: '#FE976F', buttonText: RICH_CHARCOAL },
  { label: 'Style 8', description: 'Coral background with rich charcoal headings and midnight buttons', background: '#FE976F', heading: RICH_CHARCOAL, buttonBackground: MIDNIGHT, buttonText: WARM_WHITE },
  { label: 'Style 9', description: 'Arctic background with rich charcoal headings and arctic buttons', background: '#89DDE8', heading: RICH_CHARCOAL, buttonBackground: '#89DDE8', buttonText: RICH_CHARCOAL },
  { label: 'Style 10', description: 'Arctic background with rich charcoal headings and midnight buttons', background: '#89DDE8', heading: RICH_CHARCOAL, buttonBackground: MIDNIGHT, buttonText: WARM_WHITE },
  { label: 'Style 11', description: 'Sky background with rich charcoal headings and sky buttons', background: '#45BED3', heading: RICH_CHARCOAL, buttonBackground: '#45BED3', buttonText: RICH_CHARCOAL },
  { label: 'Style 12', description: 'Sky background with rich charcoal headings and warm white buttons', background: '#45BED3', heading: RICH_CHARCOAL, buttonBackground: WARM_WHITE, buttonText: RICH_CHARCOAL },
  { label: 'Style 13', description: 'Ocean background with warm white headings and warm white buttons', background: '#00607B', heading: WARM_WHITE, buttonBackground: WARM_WHITE, buttonText: RICH_CHARCOAL },
  { label: 'Style 14', description: 'Midnight background with warm white headings and midnight buttons', background: MIDNIGHT, heading: WARM_WHITE, buttonBackground: MIDNIGHT, buttonText: WARM_WHITE },
  { label: 'Style 15', description: 'Salmon background with rich charcoal headings and salmon buttons', background: '#FF6936', heading: RICH_CHARCOAL, buttonBackground: '#FF6936', buttonText: RICH_CHARCOAL },
  { label: 'Style 16', description: 'Marigold background with warm white headings and warm white buttons', background: '#FC4902', heading: WARM_WHITE, buttonBackground: WARM_WHITE, buttonText: RICH_CHARCOAL },
  { label: 'Style 17', description: 'Poppy background with warm white headings and warm white buttons', background: '#E2371E', heading: WARM_WHITE, buttonBackground: WARM_WHITE, buttonText: RICH_CHARCOAL },
  { label: 'Style 18', description: 'Rich charcoal background with warm white headings and rich charcoal buttons', background: RICH_CHARCOAL, heading: WARM_WHITE, buttonBackground: RICH_CHARCOAL, buttonText: WARM_WHITE },
  { label: 'Style 19', description: 'Rich charcoal background with warm white headings and warm white buttons', background: RICH_CHARCOAL, heading: WARM_WHITE, buttonBackground: WARM_WHITE, buttonText: RICH_CHARCOAL },
]

interface StyleTemplate {
  bgRole: ColorRole
  bgOpacity?: number
  headingRole: ColorRole
  buttonRole: ColorRole
  noPadding?: boolean
}

const styleTemplates: StyleTemplate[] = [
  { bgRole: 'white', headingRole: 'dark', buttonRole: 'brand' },
  { bgRole: 'white', headingRole: 'dark', buttonRole: 'brand', noPadding: true },
  { bgRole: 'charcoal', headingRole: 'white', buttonRole: 'brand' },
  { bgRole: 'dark', headingRole: 'white', buttonRole: 'brand' },
  { bgRole: 'brand', headingRole: 'white', buttonRole: 'dark' },
  { bgRole: 'light1', headingRole: 'charcoal', buttonRole: 'dark' },
  { bgRole: 'light2', headingRole: 'charcoal', buttonRole: 'dark' },
  { bgRole: 'warm', headingRole: 'dark', buttonRole: 'dark' },
  { bgRole: 'brand', bgOpacity: 0.2, headingRole: 'charcoal', buttonRole: 'brand' },
  { bgRole: 'light1', bgOpacity: 0.2, headingRole: 'charcoal', buttonRole: 'brand' },
  { bgRole: 'light2', bgOpacity: 0.2, headingRole: 'charcoal', buttonRole: 'brand' },
  { bgRole: 'warm', bgOpacity: 0.2, headingRole: 'charcoal', buttonRole: 'brand' },
  { bgRole: 'grey', headingRole: 'dark', buttonRole: 'brand' },
  { bgRole: 'grey', bgOpacity: 0.4, headingRole: 'charcoal', buttonRole: 'brand' },
]

export function withOpacity(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function getReadableTextColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  return luma > 150 ? '#1A1A1A' : '#FFFFFF'
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// A button the exact same color as the card behind it would be invisible -- give it a
// border in the (already background-contrasting) heading color so it stays visible.
function withButtonBorder(preview: Omit<StylePreview, 'buttonBorder'>): StylePreview {
  return {
    ...preview,
    buttonBorder: preview.buttonBackground === preview.background ? preview.heading : undefined,
  }
}

export function getStylePreviews(theme: ColorTheme): StylePreview[] {
  if (theme === 'coastal') return coastalStylePreviews.map(withButtonBorder)

  const palette = palettes[theme]
  return styleTemplates.map((template, index) => {
    const bgName = palette.names[template.bgRole] + (template.bgOpacity ? ` ${Math.round(template.bgOpacity * 100)}%` : '')
    const headingName = palette.names[template.headingRole]
    const buttonName = palette.names[template.buttonRole]
    const prefix = template.noPadding ? 'No padding - ' : ''
    const buttonBackground = palette.colors[template.buttonRole]

    return withButtonBorder({
      label: `Style ${index + 1}`,
      description: `${prefix}${capitalize(bgName)} background with ${headingName} headings and ${buttonName} buttons`,
      background: template.bgOpacity ? withOpacity(palette.colors[template.bgRole], template.bgOpacity) : palette.colors[template.bgRole],
      heading: palette.colors[template.headingRole],
      buttonBackground,
      buttonText: getReadableTextColor(buttonBackground),
      noPadding: template.noPadding,
    })
  })
}
