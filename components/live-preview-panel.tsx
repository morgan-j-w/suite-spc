'use client'

import { useState } from 'react'
import { Monitor, Smartphone, UserRound, X } from 'lucide-react'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { PREVIEW_PERSONAS, type PreviewPersona } from '@/lib/preview-personas'
import { FormLivePreview, type PreviewEditRegion } from '@/components/form-live-preview'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  const [persona, setPersona] = useState<PreviewPersona>('new')

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

  // Persona picker — re-seeds the preview's scratch profile/answers on change so
  // conditional logic can be exercised without filling the form by hand.
  const personaSelect = (compact?: boolean) => (
    <Select value={persona} onValueChange={(v) => setPersona(v as PreviewPersona)}>
      <SelectTrigger className={compact ? 'h-8 w-52 text-xs' : 'h-8 w-full text-xs'}>
        <span className="flex min-w-0 items-center gap-1.5">
          <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate"><SelectValue /></span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {PREVIEW_PERSONAS.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <div className="flex flex-col items-start">
              <span>{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className={className}>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
          {toggle}
        </div>
        <div className="mb-3">{personaSelect()}</div>

        {width === 'mobile' ? (
          <div className="rounded-xl border shadow-sm">
            <div className="overflow-hidden rounded-xl">
              <FormLivePreview centre={centre} onEditRegion={onEditRegion} persona={persona} />
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
          <div className="flex items-center justify-between gap-3 border-b bg-background px-6 py-3">
            <p className="shrink-0 text-sm font-semibold">Live preview — Desktop</p>
            <div className="flex items-center gap-2">
              {personaSelect(true)}
              {toggle}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setWidth('mobile')}>
                <X className="h-3.5 w-3.5" />
                Close
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border shadow-sm">
              <FormLivePreview centre={centre} onEditRegion={onEditRegion} persona={persona} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
