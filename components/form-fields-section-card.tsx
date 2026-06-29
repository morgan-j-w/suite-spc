'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  type Category,
  type CustomProfileField,
  type FieldVisibilityOperator,
  type ProfileFieldSection,
  getBuiltInFieldOptions,
  isBooleanFieldType,
  isConditionSourceFieldType,
} from '@/lib/subscription-types'
import type { ColorTheme } from '@/lib/brand-config'
import { StylePicker } from '@/components/style-picker'
import { ProfileFieldEditor } from '@/components/profile-field-editor'
import { ConditionalBadge, ConditionalVisibilityNote } from '@/components/conditional-visibility-note'
import { MultiSelect } from '@/components/multi-select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Check, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldsSectionCardProps {
  section: ProfileFieldSection
  allSections: ProfileFieldSection[]
  categories: Category[]
  theme: ColorTheme
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
  theme,
  isFirst,
  isExpanded,
  onToggleExpand,
  onUpdateSection,
  onRemoveSection,
}: FormFieldsSectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-md',
        currentRule && 'border-l-4 border-l-amber-400',
        isDragging && 'z-50 shadow-lg ring-2 ring-primary/20'
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            type="button"
            className={cn(
              'mt-0.5 flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isDragging && 'cursor-grabbing'
            )}
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${section.title || 'Form Fields section'}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0 pt-1">
            {isExpanded ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                  <Input
                    id={`section-title-${section.id}`}
                    value={section.title}
                    onChange={(e) => onUpdateSection({ title: e.target.value })}
                    placeholder="e.g., Your Details"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`section-description-${section.id}`}>Description</Label>
                  <Textarea
                    id={`section-description-${section.id}`}
                    value={section.description || ''}
                    onChange={(e) => onUpdateSection({ description: e.target.value })}
                    placeholder="Optional description shown under the title"
                    rows={2}
                  />
                </div>

                {isFirst ? (
                  <p className="text-xs text-muted-foreground">
                    This is the first Form Fields section, so it always shows — it can&apos;t be made conditional.
                  </p>
                ) : (
                  visibilitySources.length > 0 && (
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
                  )
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold">{section.title || 'Untitled section'}</p>
                  {currentRule ? <ConditionalBadge /> : null}
                </div>
                {section.description && <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>}
                {currentRule ? (
                  <div className="mt-2">
                    <ConditionalVisibilityNote rule={currentRule} getFieldLabel={getSourceLabel} />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!isExpanded && (
            <StylePicker
              theme={theme}
              value={section.cardStyleIndex}
              onChange={(index) => onUpdateSection({ cardStyleIndex: index })}
              className="w-[130px]"
            />
          )}
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleExpand}>
              {isExpanded ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemoveSection}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ProfileFieldEditor fields={section.fields} onFieldsChange={handleFieldsChange} fieldsInOtherSections={fieldsInOtherSections} />
      </CardContent>
    </Card>
  )
}
