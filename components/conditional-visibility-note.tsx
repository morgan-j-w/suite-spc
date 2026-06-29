import { AlertCircle, EyeOff } from 'lucide-react'
import type { FieldVisibilityRule } from '@/lib/subscription-types'
import { cn } from '@/lib/utils'

const amberText = 'text-amber-600 dark:text-amber-400'

export function ConditionalBadge({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', amberText, className)}>
      <EyeOff className="h-3.5 w-3.5" />
      conditional
    </span>
  )
}

export function ConditionalVisibilityNote({
  rule,
  getFieldLabel,
}: {
  rule: FieldVisibilityRule
  getFieldLabel: (fieldId: string) => string
}) {
  const label = getFieldLabel(rule.fieldId)
  const values = Array.isArray(rule.value) ? rule.value : [rule.value || '']

  return (
    <p className={cn('flex items-center gap-1.5 text-xs font-medium', amberText)}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>
        Shown when <span className="font-semibold">{label}</span>
        {rule.operator === 'hasValue' ? ' is checked' : <> = &ldquo;{values.join('” or “')}&rdquo;</>}
      </span>
    </p>
  )
}
