'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CustomProfileField,
  FieldVisibilityOperator,
  ProfileFieldType,
  StandardFieldDef,
  fieldTypeBadge,
  getBuiltInFieldOptions,
  hasFixedOptions,
  isBooleanFieldType,
  isChoiceFieldType,
  isConditionSourceFieldType,
  isDisplayFieldType,
  standardFieldCatalog,
  buildStandardField,
} from '@/lib/subscription-types'
import { buildFieldFromCatalog } from '@/lib/field-catalog'
import { RichTextEditor } from '@/components/rich-text-editor'
import { AddFieldDialog } from '@/components/add-field-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { MultiSelect } from '@/components/multi-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  GripVertical,
  Pencil,
  Check,
  Trash2,
  Type,
  Mail,
  Phone,
  Hash,
  AlignLeft,
  ChevronDown,
  ChevronsUpDown,
  MapPin,
  CircleDot,
  ListChecks,
  ToggleLeft,
  Calendar,
  SlidersHorizontal,
  Star,
  Heading,
  Pilcrow,
  type LucideIcon,
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '@/lib/utils'
import { ConditionalBadge, ConditionalVisibilityNote } from '@/components/conditional-visibility-note'

const TEXT_LIKE_TYPES: ProfileFieldType[] = ['text', 'email', 'phone', 'number', 'textarea']
const NUMERIC_RANGE_TYPES: ProfileFieldType[] = ['number', 'range']

// Marks the controls that only affect how this form asks the question -- the answer still
// saves as a plain number either way -- so it's clear they aren't changing the custom field
// itself the way the (locked) options list would.
const PRESENTATION_HINT = 'Affects how this question looks, not what gets saved'

// One-line plain-text snippet for the collapsed card preview -- paragraph content is now
// rich HTML, so showing it raw would print literal tags instead of readable text.
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

interface FieldTypeOption {
  type: ProfileFieldType
  label: string
  description: string
  icon: LucideIcon
}

export const FIELD_TYPE_GROUPS: { groupLabel: string; options: FieldTypeOption[] }[] = [
  {
    groupLabel: 'Text',
    options: [
      { type: 'text', label: 'Text input', description: 'Short answer — a single line of text', icon: Type },
      { type: 'email', label: 'Email input', description: 'Collects an email address', icon: Mail },
      { type: 'phone', label: 'Phone input', description: 'Collects a phone number', icon: Phone },
      { type: 'number', label: 'Number input', description: 'Accepts numbers only', icon: Hash },
      { type: 'textarea', label: 'Textarea', description: 'Long answer — multiple lines of text', icon: AlignLeft },
    ],
  },
  {
    groupLabel: 'Choice',
    options: [
      { type: 'select', label: 'Dropdown (select)', description: 'Single choice from a dropdown', icon: ChevronDown },
      { type: 'multiSelect', label: 'Multi Select', description: 'Multiple choices from a dropdown', icon: ChevronsUpDown },
      { type: 'state_au', label: 'State (AU)', description: 'Australian state/territory picker, pre-built list', icon: MapPin },
      { type: 'radio', label: 'Radio buttons', description: 'Single choice, options shown inline', icon: CircleDot },
      { type: 'checkboxGroup', label: 'Checkbox', description: 'Multiple choices, options shown inline', icon: ListChecks },
      { type: 'toggle', label: 'Toggle', description: 'On/off toggle per option', icon: ToggleLeft },
    ],
  },
  {
    groupLabel: 'Other',
    options: [
      { type: 'date', label: 'Date input', description: 'Date picker — day, month, year', icon: Calendar },
      { type: 'range', label: 'Range slider', description: 'Numeric range via a slider', icon: SlidersHorizontal },
      { type: 'rating', label: 'Rating', description: 'Star rating, e.g. 1–5', icon: Star },
    ],
  },
  {
    groupLabel: 'Display',
    options: [
      { type: 'heading', label: 'Section heading', description: 'Visual section heading, no answer', icon: Heading },
      { type: 'paragraph', label: 'Paragraph', description: 'Rich text block, no answer', icon: Pilcrow },
    ],
  },
]

export const FIELD_TYPE_ICONS = FIELD_TYPE_GROUPS.reduce<Partial<Record<ProfileFieldType, LucideIcon>>>((acc, group) => {
  group.options.forEach((opt) => {
    acc[opt.type] = opt.icon
  })
  return acc
}, {})

interface ProfileFieldEditorProps {
  fields: CustomProfileField[]
  onFieldsChange: (fields: CustomProfileField[]) => void
  // Fields already used in other sections of this centre -- only consulted to keep standard
  // fields (fixed ids like 'email') from being added twice. Not related to the field library.
  fieldsInOtherSections?: CustomProfileField[]
}

export function ProfileFieldEditor({ fields, onFieldsChange, fieldsInOtherSections = [] }: ProfileFieldEditorProps) {
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false)
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null)
  const [justAddedFieldId, setJustAddedFieldId] = useState<string | null>(null)
  const justAddedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flashJustAdded = (id: string) => {
    if (justAddedTimerRef.current) clearTimeout(justAddedTimerRef.current)
    setJustAddedFieldId(id)
    justAddedTimerRef.current = setTimeout(() => setJustAddedFieldId(null), 1600)
  }

  // Standard fields (fixed ids like 'email') are singletons across the whole centre -- there's
  // only ever one subscriber email -- so once used in any section they drop out everywhere,
  // not just this one.
  const availableStandardFields = standardFieldCatalog.filter(
    (def) => !fields.some((f) => f.id === def.id) && !fieldsInOtherSections.some((f) => f.id === def.id)
  )

  const allFieldIds = new Set([...fields, ...fieldsInOtherSections].map((f) => f.id))

  const handlePickStandardField = (def: StandardFieldDef) => {
    // Belt-and-suspenders: availableStandardFields already filters these out,
    // but guard here too so any future import or programmatic path can't slip a duplicate through.
    if (allFieldIds.has(def.id)) return
    const field = buildStandardField(def)
    onFieldsChange([...fields, field])
    setExpandedFieldId(def.id)
    flashJustAdded(def.id)
    setIsAddFieldDialogOpen(false)
  }

  // Heading/paragraph are display-only content, not subscriber data -- no backend field
  // to protect, so they're still created blank and freely authored.
  const handlePickDisplayType = (type: ProfileFieldType) => {
    const id = uuidv4()
    const field: CustomProfileField = { id, label: '', type, required: false }
    onFieldsChange([...fields, field])
    setExpandedFieldId(id)
    flashJustAdded(id)
    setIsAddFieldDialogOpen(false)
  }

  // Every other field type must come from the fixed catalog -- the chosen widget can differ
  // from the catalog entry's own type (any widget whose shape matches is fine), but the
  // label/options/min/max/step it starts with are the catalog's, not invented here.
  const handlePickCatalogField = (catalogField: CustomProfileField, widgetType: ProfileFieldType) => {
    const field = buildFieldFromCatalog(catalogField.id, widgetType)
    onFieldsChange([...fields, field])
    setExpandedFieldId(field.id)
    flashJustAdded(field.id)
    setIsAddFieldDialogOpen(false)
  }

  const handleUpdateField = (fieldId: string, patch: Partial<CustomProfileField>) => {
    onFieldsChange(fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)))
  }

  const handleRemoveField = (fieldId: string) => {
    if (fields.find((f) => f.id === fieldId)?.locked) return
    onFieldsChange(fields.filter((f) => f.id !== fieldId))
    if (expandedFieldId === fieldId) setExpandedFieldId(null)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    onFieldsChange(arrayMove(fields, oldIndex, newIndex))
  }

  return (
    <div className="flex flex-col gap-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                fields={fields}
                fieldsInOtherSections={fieldsInOtherSections}
                isExpanded={expandedFieldId === field.id}
                isJustAdded={justAddedFieldId === field.id}
                onToggleExpand={() => setExpandedFieldId(expandedFieldId === field.id ? null : field.id)}
                onUpdateField={(patch) => handleUpdateField(field.id, patch)}
                onRemove={() => handleRemoveField(field.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length === 0 && (
        <div className="rounded-lg border-2 border-dashed bg-muted/30 px-6 py-5 text-center">
          <p className="text-sm text-muted-foreground">No fields yet.</p>
        </div>
      )}

      <Button variant="outline" className="w-full gap-2" onClick={() => setIsAddFieldDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Field
      </Button>
      <AddFieldDialog
        open={isAddFieldDialogOpen}
        onOpenChange={setIsAddFieldDialogOpen}
        availableStandardFields={availableStandardFields}
        onPickStandardField={handlePickStandardField}
        onPickDisplayType={handlePickDisplayType}
        onPickCatalogField={handlePickCatalogField}
      />
    </div>
  )
}

interface FieldCardProps {
  field: CustomProfileField
  fields: CustomProfileField[]
  fieldsInOtherSections: CustomProfileField[]
  isExpanded: boolean
  isJustAdded: boolean
  onToggleExpand: () => void
  onUpdateField: (patch: Partial<CustomProfileField>) => void
  onRemove: () => void
}

function FieldCard({ field, fields, fieldsInOtherSections, isExpanded, isJustAdded, onToggleExpand, onUpdateField, onRemove }: FieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })
  const cardRef = useRef<HTMLDivElement | null>(null)

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    cardRef.current = node
  }

  useEffect(() => {
    if (!isJustAdded) return
    // The Add Field dialog's scroll-lock release restores the page's prior scroll position
    // shortly after closing, racing with and overwriting an immediate scrollIntoView — wait
    // for that to settle first.
    const scrollTimer = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
    return () => clearTimeout(scrollTimer)
  }, [isJustAdded])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-card transition-shadow duration-700 hover:shadow-md',
        field.visibleWhen?.length && 'border-l-4 border-l-amber-400',
        isDragging && 'z-50 shadow-lg ring-2 ring-border',
        isJustAdded && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            className={cn(
              'flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isDragging && 'cursor-grabbing'
            )}
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${field.label || 'field'}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <p className={cn('text-sm font-medium', !field.label && 'text-muted-foreground', field.type === 'paragraph' && 'line-clamp-2')}>
              {stripHtml(field.label) || 'Untitled field'}
            </p>
            {field.required && <span className="text-xs font-medium text-destructive">Required</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={fieldTypeBadge[field.type].className}>
              {fieldTypeBadge[field.type].label}
            </Badge>
            {!isExpanded && field.visibleWhen?.length ? <ConditionalBadge /> : null}
          </div>
          <div className="flex gap-1">
            {isExpanded ? (
              <Button variant="default" size="sm" className="h-8 gap-1.5 px-3 text-xs font-medium" onClick={onToggleExpand} disabled={!stripHtml(field.label).trim()}>
                <Check className="h-3.5 w-3.5" />
                Done
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleExpand}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {!field.locked && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {!isExpanded && (field.helpText || field.visibleWhen?.length) && (
        <div className="ml-11 px-4 pb-3 space-y-1">
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {field.visibleWhen?.length ? (
            <ConditionalVisibilityNote
              rule={field.visibleWhen[0]}
              getFieldLabel={(fieldId) => fields.find((item) => item.id === fieldId)?.label || fieldId}
            />
          ) : null}
        </div>
      )}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-4">
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <FieldEditForm field={field} fields={[...fields, ...fieldsInOtherSections]} onUpdateField={onUpdateField} />
          </div>
        </div>
      )}
    </div>
  )
}


interface FieldEditFormProps {
  field: CustomProfileField
  fields: CustomProfileField[]
  onUpdateField: (patch: Partial<CustomProfileField>) => void
}

function FieldEditForm({ field, fields, onUpdateField }: FieldEditFormProps) {
  const type = field.type
  const isHeading = type === 'heading'
  const isParagraph = type === 'paragraph'
  const isDisplay = isHeading || isParagraph
  const updateLabel = (next: string) => onUpdateField({ label: next })

  const conditionSources = fields.filter((f) => f.id !== field.id && isConditionSourceFieldType(f.type))
  const currentRule = field.visibleWhen?.[0]
  const sourceField = conditionSources.find((f) => f.id === currentRule?.fieldId)
  const sourceIsBoolean = sourceField ? isBooleanFieldType(sourceField.type) : false
  const sourceOptions = sourceField
    ? sourceField.options?.length
      ? sourceField.options
      : getBuiltInFieldOptions(sourceField.type)
    : undefined

  const updateConditionSource = (value: string) => {
    const source = fields.find((f) => f.id === value)
    const operator: FieldVisibilityOperator = source && isBooleanFieldType(source.type) ? 'hasValue' : 'equals'
    onUpdateField({ visibleWhen: [{ fieldId: value, operator, value: operator === 'hasValue' ? undefined : [] }] })
  }

  const updateConditionValue = (value: string | string[]) => {
    if (!currentRule) return
    onUpdateField({ visibleWhen: [{ ...currentRule, value }] })
  }

  const toggleCondition = (enabled: boolean) => {
    if (!enabled) {
      onUpdateField({ visibleWhen: undefined })
      return
    }
    if (conditionSources[0]) updateConditionSource(conditionSources[0].id)
  }

  return (
    <div className="space-y-4">
      {isParagraph && (
        <div className="space-y-2">
          <Label htmlFor={`field-label-${field.id}`}>Paragraph Text *</Label>
          <RichTextEditor
            value={field.label}
            onChange={updateLabel}
            placeholder="e.g., A few quick questions to personalise your experience."
          />
        </div>
      )}

      {!isParagraph && (
        <div className="space-y-2">
          <Label htmlFor={`field-label-${field.id}`}>{isHeading ? 'Heading Text' : 'Display Text'}<span aria-hidden="true" className="ml-px text-destructive">*</span></Label>
          <Input
            id={`field-label-${field.id}`}
            value={field.label}
            onChange={(e) => updateLabel(e.target.value)}
            placeholder={isHeading ? 'e.g., Tell us about yourself' : 'e.g., Department'}
            autoFocus={!field.label}
          />
        </div>
      )}

      {!isDisplay && (
        <div className="space-y-2">
          <Label htmlFor={`field-help-text-${field.id}`}>Help Text</Label>
          <Input
            id={`field-help-text-${field.id}`}
            value={field.helpText || ''}
            onChange={(e) => onUpdateField({ helpText: e.target.value })}
            placeholder="e.g., We will only use this for account updates"
          />
        </div>
      )}

      {TEXT_LIKE_TYPES.includes(type) && (
        <div className="space-y-2">
          <Label htmlFor={`field-placeholder-${field.id}`}>Placeholder</Label>
          <Input
            id={`field-placeholder-${field.id}`}
            value={field.placeholder || ''}
            onChange={(e) => onUpdateField({ placeholder: e.target.value })}
            placeholder="e.g., Enter your department"
          />
        </div>
      )}

      {/* Slider bounds and star counts are how this form collects the answer, not part of
          the stored value (the backend just saves a number), so they stay editable here --
          unlike options, which are the field's real allowed values. */}
      {NUMERIC_RANGE_TYPES.includes(type) && (
        <div className="space-y-2">
          <Label>Range</Label>
          <p className="text-xs text-muted-foreground">{PRESENTATION_HINT}</p>
          <div className="grid grid-cols-3 gap-2">
            <Input
              aria-label="Minimum"
              type="number"
              placeholder="Min"
              value={field.min ?? ''}
              onChange={(e) => onUpdateField({ min: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
            <Input
              aria-label="Maximum"
              type="number"
              placeholder="Max"
              value={field.max ?? ''}
              onChange={(e) => onUpdateField({ max: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
            <Input
              aria-label="Step"
              type="number"
              placeholder="Step"
              value={field.step ?? ''}
              onChange={(e) => onUpdateField({ step: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {type === 'rating' && (
        <div className="space-y-2">
          <Label htmlFor={`field-rating-max-${field.id}`}>Number of stars</Label>
          <p className="text-xs text-muted-foreground">{PRESENTATION_HINT}</p>
          <Input
            id={`field-rating-max-${field.id}`}
            type="number"
            min={2}
            max={10}
            value={field.ratingMax ?? ''}
            placeholder="5"
            // Take the typed value as-is and only fall back to the default once the field is
            // left empty — `Number(v) || 5` refilled the box the instant you deleted the
            // digit, so it was impossible to clear and retype.
            onChange={(e) => onUpdateField({ ratingMax: e.target.value === '' ? undefined : Number(e.target.value) })}
            onBlur={(e) => {
              const v = Number(e.target.value)
              if (!e.target.value || !Number.isFinite(v)) return onUpdateField({ ratingMax: 5 })
              onUpdateField({ ratingMax: Math.min(10, Math.max(2, v)) })
            }}
          />
        </div>
      )}

      {hasFixedOptions(type) && (
        <div className="space-y-2">
          <Label>Options</Label>
          <p className="text-xs text-muted-foreground">
            Built-in list of {type === 'country' ? 'countries' : 'Australian states and territories'}
          </p>
        </div>
      )}

      {isChoiceFieldType(type) && (
        <div className="space-y-2">
          <Label>Options</Label>
          <p className="text-xs text-muted-foreground">Preview of options from the custom field</p>
          <div className="flex flex-wrap gap-1.5">
            {field.options?.map((option) => (
              <Badge key={option.value} variant="outline" className="font-normal">
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {conditionSources.length > 0 && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`field-condition-toggle-${field.id}`} className="cursor-pointer">
              Conditional visibility
            </Label>
            <Switch id={`field-condition-toggle-${field.id}`} checked={!!currentRule} onCheckedChange={toggleCondition} />
          </div>

          {currentRule && (
            <>
              <div className="space-y-2">
                <Label htmlFor={`field-condition-source-${field.id}`}>Show this question when the field</Label>
                <Select value={currentRule.fieldId} onValueChange={updateConditionSource}>
                  <SelectTrigger id={`field-condition-source-${field.id}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionSources.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {sourceField && !sourceIsBoolean && (
                <div className="space-y-2">
                  <Label htmlFor={`field-condition-value-${field.id}`}>Equals</Label>
                  {sourceOptions?.length ? (
                    <MultiSelect
                      id={`field-condition-value-${field.id}`}
                      options={sourceOptions}
                      selected={Array.isArray(currentRule.value) ? currentRule.value : currentRule.value ? [currentRule.value] : []}
                      onChange={updateConditionValue}
                      placeholder="Select one or more options"
                    />
                  ) : (
                    <Input
                      id={`field-condition-value-${field.id}`}
                      value={Array.isArray(currentRule.value) ? '' : currentRule.value || ''}
                      onChange={(e) => updateConditionValue(e.target.value)}
                      placeholder="e.g., Marketing"
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!isDisplay && (
        <div className="flex items-center gap-2 border-t pt-3">
          <Checkbox
            id={`field-required-${field.id}`}
            checked={field.required}
            onCheckedChange={(checked) => onUpdateField({ required: checked as boolean })}
          />
          <Label htmlFor={`field-required-${field.id}`} className="cursor-pointer">
            Required field
          </Label>
        </div>
      )}
    </div>
  )
}
