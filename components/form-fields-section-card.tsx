'use client'

import {
  type Category,
  type CustomProfileField,
  type FieldVisibilityOperator,
  type ProfileFieldSection,
  getBuiltInFieldOptions,
  isBooleanFieldType,
  isConditionSourceFieldType,
} from '@/lib/subscription-types'
import { ProfileFieldEditor } from '@/components/profile-field-editor'
import { ConditionalBadge, ConditionalVisibilityNote } from '@/components/conditional-visibility-note'
import { MultiSelect } from '@/components/multi-select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Check, Settings, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldsSectionCardProps {
  section: ProfileFieldSection
  allSections: ProfileFieldSection[]
  categories: Category[]
  isFirst: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onUpdateSection: (patch: Partial<ProfileFieldSection>) => void
  onRemoveSection: () => void
}

export function FormFieldsSectionCard({
  section,
  allSections,
  categories,
  isFirst,
  isExpanded,
  onToggleExpand,
  onUpdateSection,
  onRemoveSection,
}: FormFieldsSectionCardProps) {
  const [descFocused, setDescFocused] = useState(false)
  const descRef = useRef<HTMLInputElement>(null)
  const handleFieldsChange = (fields: CustomProfileField[]) => onUpdateSection({ fields })

  const otherSections = allSections.filter((s) => s.id !== section.id)
  const fieldsInOtherSections = otherSections.flatMap((s) => s.fields)
  const visibilitySources = [
    ...otherSections.flatMap((s) =>
      s.fields
        .filter((field) => isConditionSourceFieldType(field.type))
        .map((field) => ({
          id: field.id,
          label: field.label,
          isBoolean: isBooleanFieldType(field.type),
          options: field.options?.length ? field.options : getBuiltInFieldOptions(field.type),
        }))
    ),
    ...categories.map((category) => ({
      id: category.id,
      label: category.title,
      isBoolean: false,
      options: category.options.map((option) => ({ value: option.key, label: option.label })),
    })),
  ]
  const getSourceLabel = (fieldId: string) => visibilitySources.find((source) => source.id === fieldId)?.label || fieldId

  const currentRule = !isFirst ? section.visibleWhen?.[0] : undefined
  const sourceField = visibilitySources.find((source) => source.id === currentRule?.fieldId)
  const sourceIsBoolean = sourceField?.isBoolean ?? false

  const updateConditionSource = (value: string) => {
    const source = visibilitySources.find((s) => s.id === value)
    const operator: FieldVisibilityOperator = source?.isBoolean ? 'hasValue' : 'equals'
    onUpdateSection({ visibleWhen: [{ fieldId: value, operator, value: operator === 'hasValue' ? undefined : [] }] })
  }

  const updateConditionValue = (value: string | string[]) => {
    if (!currentRule) return
    onUpdateSection({ visibleWhen: [{ ...currentRule, value }] })
  }

  const toggleCondition = (enabled: boolean) => {
    if (!enabled) {
      onUpdateSection({ visibleWhen: undefined })
      return
    }
    if (visibilitySources[0]) updateConditionSource(visibilitySources[0].id)
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-md gap-0 py-0',
        currentRule && 'border-l-4 border-l-amber-400'
      )}
    >
      <CardHeader className="px-6 pb-3 pt-4">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={section.title}
                  onChange={(e) => onUpdateSection({ title: e.target.value })}
                  placeholder="Untitled section"
                  aria-label="Section title"
                  autoFocus={!section.title}
                  className="h-auto min-w-0 flex-1 -mx-1 rounded border-none bg-transparent px-1 py-0.5 text-base font-semibold shadow-none outline-none transition-colors hover:bg-muted/60 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
                />
                {currentRule ? <ConditionalBadge /> : null}
              </div>
              {(section.description || descFocused) ? (
                <input
                  ref={descRef}
                  value={section.description || ''}
                  onChange={(e) => onUpdateSection({ description: e.target.value })}
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                  placeholder="Add a description (optional)"
                  aria-label="Section description"
                  className="mt-1 h-auto w-full min-w-0 -mx-1 rounded border-none bg-transparent px-1 py-0.5 text-sm text-muted-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground/60 hover:bg-muted/60 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => { setDescFocused(true); setTimeout(() => descRef.current?.focus(), 0) }}
                  className="mt-0.5 block text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
                >
                  + Add description
                </button>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex gap-1">
              {!isFirst && visibilitySources.length > 0 && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleExpand}>
                  {isExpanded ? <Check className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                </Button>
              )}
              {!isFirst && !section.fields.some((f) => f.locked) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onRemoveSection}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        {isExpanded && visibilitySources.length > 0 ? (
          <div className="mt-4 space-y-4">
            {(
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={`section-condition-toggle-${section.id}`} className="cursor-pointer">
                    Conditional visibility
                  </Label>
                  <Switch
                    id={`section-condition-toggle-${section.id}`}
                    checked={!!currentRule}
                    onCheckedChange={toggleCondition}
                  />
                </div>

                {currentRule && (
                  <div className="space-y-2">
                    <Label htmlFor={`section-condition-source-${section.id}`}>Show this section when the field</Label>
                    <Select value={currentRule.fieldId} onValueChange={updateConditionSource}>
                      <SelectTrigger id={`section-condition-source-${section.id}`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilitySources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentRule && sourceField && !sourceIsBoolean && (
                  <div className="space-y-2">
                    <Label htmlFor={`section-condition-value-${section.id}`}>Equals</Label>
                    {sourceField.options?.length ? (
                      <MultiSelect
                        id={`section-condition-value-${section.id}`}
                        options={sourceField.options}
                        selected={
                          Array.isArray(currentRule.value) ? currentRule.value : currentRule.value ? [currentRule.value] : []
                        }
                        onChange={updateConditionValue}
                        placeholder="Select one or more options"
                      />
                    ) : (
                      <Input
                        id={`section-condition-value-${section.id}`}
                        value={Array.isArray(currentRule.value) ? '' : currentRule.value || ''}
                        onChange={(e) => updateConditionValue(e.target.value)}
                        placeholder="e.g., an option key"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (

          currentRule ? (
            <div className="mt-2">
              <ConditionalVisibilityNote rule={currentRule} getFieldLabel={getSourceLabel} />
            </div>
          ) : null
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-3">
        <ProfileFieldEditor fields={section.fields} onFieldsChange={handleFieldsChange} fieldsInOtherSections={fieldsInOtherSections} />
      </CardContent>
    </Card>
  )
}
