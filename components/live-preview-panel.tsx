'use client'

import { useState } from 'react'
import { Monitor, Smartphone, X } from 'lucide-react'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { FormLivePreview } from '@/components/form-live-preview'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LivePreviewPanelProps {
  centre: SubscriptionCentre
  className?: string
}

// Persistent live preview used on both the Build and Design tabs. Defaults to a narrow
// "mobile" width that sits quietly in the sidebar; switching to "desktop" expands the
// same render into a full-screen overlay rather than squeezing a desktop-width layout
// into a 320px column.
export function LivePreviewPanel({ centre, className }: LivePreviewPanelProps) {
  const [width, setWidth] = useState<'mobile' | 'desktop'>('mobile')

  const toggle = (
    <div className="flex gap-1 rounded-md bg-muted p-1">
      <button
        type="button"
        title="Mobile width"
        onClick={() => setWidth('mobile')}
        className={cn('flex items-center justify-center rounded-sm px-2 py-1 transition-colors', width === 'mobile' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
      >
        <Smartphone className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Desktop width"
        onClick={() => setWidth('desktop')}
        className={cn('flex items-center justify-center rounded-sm px-2 py-1 transition-colors', width === 'desktop' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  )

  return (
    <div className={className}>
      <div className="sticky top-[85px] overflow-y-auto px-2 pb-4" style={{ maxHeight: 'calc(100vh - 100px)' }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
          {toggle}
        </div>

        {width === 'mobile' ? (
          <div className="rounded-xl border shadow-lg">
            <div className="overflow-hidden rounded-xl">
              <FormLivePreview centre={centre} />
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
            <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border shadow-lg">
              <FormLivePreview centre={centre} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
