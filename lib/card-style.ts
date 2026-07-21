import type { CardStyle } from '@/lib/subscription-centre'

// CSS rules scoped to [data-card-canvas] so they only affect the form area,
// not the builder chrome or banner/footer.
export function getCardStyleCss(cardStyle?: CardStyle): string {
  if (!cardStyle) return ''
  const rules: string[] = []

  // Border radius
  if (cardStyle.borderRadius !== undefined) {
    rules.push(`[data-card-canvas] [data-slot="card"] { border-radius: ${cardStyle.borderRadius}px !important; }`)
  }

  // Border
  if (cardStyle.borderEnabled === false) {
    rules.push('[data-card-canvas] [data-slot="card"] { border: none !important; }')
  } else {
    if (cardStyle.borderWidth !== undefined) {
      rules.push(`[data-card-canvas] [data-slot="card"] { border-width: ${cardStyle.borderWidth}px !important; border-style: solid !important; }`)
    }
    if (cardStyle.borderColor) {
      rules.push(`[data-card-canvas] [data-slot="card"] { border-color: ${cardStyle.borderColor} !important; }`)
    }
  }

  // Shadow
  if (cardStyle.shadow === 'off') {
    rules.push('[data-card-canvas] [data-slot="card"] { box-shadow: none !important; }')
  }

  // Padding — 'compact'/'spacious' presets, a custom px number, or the layout's own
  // default when unset ('normal' or undefined).
  if (cardStyle.padding === 'compact') {
    rules.push('[data-card-canvas] [data-slot="card"] { padding-top: 1rem !important; padding-bottom: 1rem !important; }')
    rules.push('[data-card-canvas] [data-slot="card-content"] { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }')
    rules.push('[data-card-canvas] [data-slot="card-header"] { padding-left: 1.25rem !important; padding-right: 1.25rem !important; padding-top: 0.75rem !important; padding-bottom: 0.5rem !important; }')
  } else if (cardStyle.padding === 'spacious') {
    rules.push('[data-card-canvas] [data-slot="card"] { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }')
    rules.push('[data-card-canvas] [data-slot="card-content"] { padding-left: 2.5rem !important; padding-right: 2.5rem !important; }')
    rules.push('[data-card-canvas] [data-slot="card-header"] { padding-left: 2.5rem !important; padding-right: 2.5rem !important; }')
  } else if (typeof cardStyle.padding === 'number') {
    const px = cardStyle.padding
    rules.push(`[data-card-canvas] [data-slot="card"] { padding-top: ${px}px !important; padding-bottom: ${px}px !important; }`)
    rules.push(`[data-card-canvas] [data-slot="card-content"] { padding-left: ${px}px !important; padding-right: ${px}px !important; }`)
    rules.push(`[data-card-canvas] [data-slot="card-header"] { padding-left: ${px}px !important; padding-right: ${px}px !important; padding-top: ${Math.round(px * 0.75)}px !important; padding-bottom: ${Math.round(px * 0.5)}px !important; }`)
  }

  // Spacing (custom px only — 'compact'/'spacious'/undefined are plain Tailwind classes
  // from getCardSpacingClass below). Tailwind's JIT scanner needs every class name to
  // appear literally in source, so a runtime value can't become `space-y-[Npx]` the way
  // the presets do — instead getCardSpacingClass returns a stable marker class and the
  // actual margin gets injected here as real CSS, same trick as the padding rules above.
  if (typeof cardStyle.spacing === 'number') {
    rules.push(`[data-card-canvas] .spc-card-spacing-custom > * + * { margin-top: ${cardStyle.spacing}px !important; }`)
  }

  return rules.join('\n')
}

export function getCardSpacingClass(cardStyle?: CardStyle): string {
  if (typeof cardStyle?.spacing === 'number') return 'spc-card-spacing-custom'
  switch (cardStyle?.spacing) {
    case 'compact': return 'space-y-2'
    case 'spacious': return 'space-y-12'
    default: return 'space-y-6'
  }
}
