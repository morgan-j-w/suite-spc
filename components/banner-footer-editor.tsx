'use client'

import { useState } from 'react'
import { Code2, Pencil } from 'lucide-react'
import type { BannerFooter } from '@/lib/subscription-centre'
import { RichTextEditor } from '@/components/rich-text-editor'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BannerFooterItemProps {
  label: string
  value: BannerFooter | null
  onChange: (value: BannerFooter | null) => void
}

function BannerFooterItem({ label, value, onChange }: BannerFooterItemProps) {
  const [sourceMode, setSourceMode] = useState(false)
  const enabled = value !== null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Switch
          checked={enabled}
          onCheckedChange={(on) => onChange(on ? { html: '', fullWidth: false } : null)}
        />
      </div>

      {enabled && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1 rounded-md bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setSourceMode(false)}
                className={cn(
                  'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
                  !sourceMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Pencil className="h-3 w-3" />
                Visual
              </button>
              <button
                type="button"
                onClick={() => setSourceMode(true)}
                className={cn(
                  'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
                  sourceMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Code2 className="h-3 w-3" />
                HTML
              </button>
            </div>

            <div className="flex gap-1 rounded-md bg-muted p-0.5">
              {(['contained', 'full'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onChange({ ...value, fullWidth: w === 'full' })}
                  className={cn(
                    'rounded px-2 py-1 text-xs font-medium capitalize transition-colors',
                    (w === 'full') === value.fullWidth
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {sourceMode ? (
            <textarea
              value={value.html}
              onChange={(e) => onChange({ ...value, html: e.target.value })}
              spellCheck={false}
              placeholder={`<div>Your ${label.toLowerCase()} HTML here…</div>`}
              className="h-40 w-full rounded-md border bg-background px-3 py-2 font-mono text-xs focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-ring/50"
            />
          ) : (
            <RichTextEditor
              value={value.html}
              onChange={(html) => onChange({ ...value, html })}
              placeholder={`Add ${label.toLowerCase()} content…`}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface BannerFooterEditorProps {
  banner: BannerFooter | null
  footer: BannerFooter | null
  onBannerChange: (value: BannerFooter | null) => void
  onFooterChange: (value: BannerFooter | null) => void
}

export function BannerFooterEditor({ banner, footer, onBannerChange, onFooterChange }: BannerFooterEditorProps) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-6 pt-4 pb-2">
        <CardTitle className="text-base">Page</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pt-2 pb-6">
        <BannerFooterItem label="Banner" value={banner} onChange={onBannerChange} />
        <div className="h-px bg-border" />
        <BannerFooterItem label="Footer" value={footer} onChange={onFooterChange} />
      </CardContent>
    </Card>
  )
}
