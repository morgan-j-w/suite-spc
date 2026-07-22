'use client'

import { useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { FormLivePreview, type PreviewEditRegion } from '@/components/form-live-preview'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Segmented } from '@/components/ui/segmented'
import { cn } from '@/lib/utils'

interface MobilePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  centre: SubscriptionCentre
  onEditRegion?: (region: PreviewEditRegion) => void
}

// Below xl, the sidebar live preview (live-preview-panel.tsx) is hidden for space — this
// gives narrower screens the same preview via a header button instead, with the same
// mobile/desktop width toggle rather than a second, divergent preview implementation.
export function MobilePreviewDialog({ open, onOpenChange, centre, onEditRegion }: MobilePreviewDialogProps) {
  const [width, setWidth] = useState<'mobile' | 'desktop'>('mobile')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b px-4 py-3 pr-10">
          <DialogTitle className="text-sm font-semibold">Live preview</DialogTitle>
          <Segmented
            className="flex-none"
            options={[
              { value: 'mobile', icon: Smartphone, title: 'Mobile width' },
              { value: 'desktop', icon: Monitor, title: 'Desktop width' },
            ]}
            value={width}
            onChange={setWidth}
          />
        </DialogHeader>
        <div className="overflow-y-auto bg-muted/30 p-4">
          <div className={cn('mx-auto rounded-xl border bg-background shadow-sm', width === 'mobile' ? 'max-w-[380px]' : 'max-w-none')}>
            <div className="overflow-hidden rounded-xl">
              <FormLivePreview centre={centre} onEditRegion={onEditRegion} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
