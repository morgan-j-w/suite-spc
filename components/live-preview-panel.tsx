'use client'

import { useState } from 'react'
import { Monitor, Smartphone, X } from 'lucide-react'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { FormLivePreview, type PreviewEditRegion } from '@/components/form-live-preview'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'

interface LivePreviewPanelProps {
  centre: SubscriptionCentre
  className?: string
  onEditRegion?: (region: PreviewEditRegion) => void
}

// Persistent live preview rendered in the app frame's right rail (which owns padding and
// scrolling), on both the Build and Design tabs. Defaults to a narrow "mobile" width that
// fits the rail; switching to "desktop" expands the same render into a full-screen overlay
// rather than squeezing a desktop-width layout into a narrow column.
export function LivePreviewPanel({ centre, className, onEditRegion }: LivePreviewPanelProps) {
  const [width, setWidth] = useState<'mobile' | 'desktop'>('mobile')

  const toggle = (
    <Segmented
      className="flex-none"
      options={[
        { value: 'mobile', icon: Smartphone, title: 'Mobile width' },
        { value: 'desktop', icon: Monitor, title: 'Desktop width' },
      ]}
      value={width}
      onChange={setWidth}
    />
  )

  return (
    <div className={className}>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
          {toggle}
        </div>

        {width === 'mobile' ? (
          <div className="rounded-xl border shadow-sm">
            <div className="overflow-hidden rounded-xl">
              <FormLivePreview centre={centre} onEditRegion={onEditRegion} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setWidth('desktop')}
            className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Monitor className="h-5 w-5" />
            Desktop preview open
          </button>
        )}
      </div>

      {width === 'desktop' && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b bg-background px-6 py-3">
            <p className="text-sm font-semibold">Live preview — Desktop</p>
            <div className="flex items-center gap-2">
              {toggle}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setWidth('mobile')}>
                <X className="h-3.5 w-3.5" />
                Close
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border shadow-sm">
              <FormLivePreview centre={centre} onEditRegion={onEditRegion} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
