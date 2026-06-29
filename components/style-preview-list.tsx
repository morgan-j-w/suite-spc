import { getStylePreviews } from '@/lib/style-previews'
import type { ColorTheme } from '@/lib/brand-config'

interface StylePreviewListProps {
  theme: ColorTheme
}

export function StylePreviewList({ theme }: StylePreviewListProps) {
  const stylePreviews = getStylePreviews(theme)

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-semibold">Card styles</h3>
        <p className="text-sm text-muted-foreground">
          A preview of the card styles available in this theme.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stylePreviews.map((style) => (
          <div
            key={style.label}
            className="rounded-lg border"
            style={{
              backgroundColor: style.background,
              padding: style.noPadding ? 0 : '0.75rem',
              ...(style.cardBorder ? { borderColor: style.cardBorder, borderWidth: 1 } : {}),
            }}
          >
            <p className="mb-0 font-bold leading-tight" style={{ color: style.heading }}>
              {style.label}
            </p>
            <p className="text-sm leading-tight" style={{ color: style.heading }}>
              {style.description}
            </p>
            <button
              type="button"
              className="mt-2 rounded-md px-3 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: style.buttonBackground,
                color: style.buttonText,
                ...(style.buttonBorder ? { borderColor: style.buttonBorder, borderWidth: 1 } : {}),
              }}
              tabIndex={-1}
            >
              Sample Button
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
