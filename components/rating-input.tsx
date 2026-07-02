'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface RatingInputProps {
  value: number
  max?: number
  onChange: (value: number) => void
  id?: string
  color?: string
}

export function RatingInput({ value, max = 5, onChange, id, color }: RatingInputProps) {
  const [hovered, setHovered] = useState(0)
  const activeColor = color || '#f59e0b'
  const highlight = hovered || value

  return (
    <div id={id} className="flex items-center gap-1" role="radiogroup" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`Rate ${rating} out of ${max}`}
          onClick={() => onChange(rating)}
          onMouseEnter={() => setHovered(rating)}
          className="rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className="h-6 w-6 transition-colors"
            style={rating <= highlight
              ? { fill: activeColor, color: activeColor }
              : { color: 'var(--muted-foreground)' }
            }
          />
        </button>
      ))}
    </div>
  )
}
