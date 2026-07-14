'use client'

import type { ContentBlock } from '@/lib/subscription-centre'
import { richTextContentClass } from '@/components/rich-text-editor'
import { cn } from '@/lib/utils'

interface RenderedContentBlockProps {
  block: ContentBlock
}

export function RenderedContentBlock({ block }: RenderedContentBlockProps) {
  if (block.type === 'text') {
    return (
      <div
        className={cn('text-sm', richTextContentClass)}
        dangerouslySetInnerHTML={{ __html: block.html || '' }}
      />
    )
  }

  if (block.type === 'image' && block.imageUrl) {
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

  return null
}
