'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableCardShellProps {
  id: string
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  children: React.ReactNode
}

export function SortableCardShell({ id, isFirst, isLast, onMoveUp, onMoveDown, children }: SortableCardShellProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && 'z-50')}>
      <div className="mb-2 flex items-center gap-1">
        <button
          type="button"
          className={cn(
            'flex h-7 shrink-0 cursor-grab items-center gap-1.5 rounded-md border bg-background px-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors',
            'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
            'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
            'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-30'
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      {children}
    </div>
  )
}
