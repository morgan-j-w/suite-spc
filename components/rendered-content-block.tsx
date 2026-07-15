'use client'

import type { ContentBlock } from '@/lib/subscription-centre'
import { richTextContentClass } from '@/components/rich-text-editor'
import { ImageIcon, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RenderedContentBlockProps {
  block: ContentBlock
  showPlaceholder?: boolean
}

export function RenderedContentBlock({ block, showPlaceholder }: RenderedContentBlockProps) {
  if (block.type === 'text') {
    if (!block.html && showPlaceholder) {
      return (
        <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 px-4 py-3 text-sm text-muted-foreground">
          <Type className="h-4 w-4 shrink-0" />
          Empty text block — add content in Form Fields
        </div>
      )
    }
    return (
      <div
        className={cn('text-sm', richTextContentClass)}
        dangerouslySetInnerHTML={{ __html: block.html || '' }}
      />
    )
  }

  if (block.type === 'image') {
    if (!block.imageUrl && showPlaceholder) {
      return (
        <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 px-4 py-3 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4 shrink-0" />
          Empty image block — add an image in Form Fields
        </div>
      )
    }
    if (block.imageUrl) {
      return (
        <div className={cn(block.imageWidth === 'full' ? 'w-full' : 'mx-auto max-w-lg')}>
          <img
            src={block.imageUrl}
            alt={block.imageAlt || ''}
            className="h-auto w-full rounded-md object-cover"
          />
        </div>
      )
    }
  }

  return null
}
