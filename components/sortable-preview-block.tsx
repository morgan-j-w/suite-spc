'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ColorTheme } from '@/lib/brand-config'
import { StylePicker } from '@/components/style-picker'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortablePreviewBlockProps {
  id: string
  theme: ColorTheme
  cardStyleIndex: number | undefined
  onCardStyleChange: (index: number) => void
  children: React.ReactNode
  hideStylePicker?: boolean
  isFirst?: boolean
  isLast?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
}

// Drag handle + per-block StylePicker sit in a real control row above the card -- pushing it
// down in normal document flow -- rather than overlaid on top of it. An overlay would collide
// with the card's own heading whenever one is short or blank (e.g. an untitled section), so
// flow layout is the only approach that holds up regardless of what's inside the card.
export function SortablePreviewBlock({ id, theme, cardStyleIndex, onCardStyleChange, children, hideStylePicker, isFirst, isLast, onMoveUp, onMoveDown }: SortablePreviewBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'z-50')}>
      <div className="mb-3 flex items-center justify-between gap-2" style={{ fontFamily: 'var(--font-sans)' }}>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={cn(
              'flex h-7 shrink-0 cursor-grab items-center gap-1.5 rounded-md border bg-background px-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-600',
              isDragging && 'cursor-grabbing'
            )}
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
            Drag to reorder
          </button>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move up"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-600',
              'disabled:pointer-events-none disabled:opacity-30'
            )}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move down"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-600',
              'disabled:pointer-events-none disabled:opacity-30'
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        {!hideStylePicker && (
          <StylePicker theme={theme} value={cardStyleIndex} onChange={onCardStyleChange} size="sm" className="w-[130px] bg-background shadow-sm" />
        )}
      </div>
      <div className={cn(isDragging && 'opacity-60 shadow-lg ring-2 ring-zinc-300 dark:ring-zinc-600')}>{children}</div>
    </div>
  )
}
