'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingInputProps {
  value: number
  max?: number
  onChange: (value: number) => void
  id?: string
}

export function RatingInput({ value, max = 5, onChange, id }: RatingInputProps) {
  return (
    <div id={id} className="flex items-center gap-1" role="radiogroup">
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`Rate ${rating} out of ${max}`}
          onClick={() => onChange(rating)}
          className="rounded-sm text-muted-foreground transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star className={cn('h-6 w-6', rating <= value && 'fill-amber-400 text-amber-400')} />
        </button>
      ))}
    </div>
  )
}
