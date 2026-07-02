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
  getSimplifiedFieldType,
  hasFixedOptions,
  isBooleanFieldType,
  isChoiceFieldType,
  isConditionSourceFieldType,
  isDisplayFieldType,
  isStandardFieldId,
  standardFieldCatalog,
} from '@/lib/subscription-types'
import { getFieldLibrary, upsertFieldInLibrary } from '@/lib/field-library-store'
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
  X,
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
  Globe,
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
      { type: 'country', label: 'Country select', description: 'Country picker, pre-built list', icon: Globe },
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
    const field: CustomProfileField = {
      id: def.id,
      label: def.label,
      type: def.type,
      required: false,
      placeholder: def.placeholder,
      helpText: def.helpText,
      options: def.options,
    }
    onFieldsChange([...fields, field])
    setExpandedFieldId(def.id)
    flashJustAdded(def.id)
    setIsAddFieldDialogOpen(false)
  }

  const handlePickFieldType = (type: ProfileFieldType) => {
    const id = uuidv4()
    const field: CustomProfileField = {
      id,
      label: '',
      type,
      required: false,
      options: isChoiceFieldType(type) ? [] : undefined,
      ratingMax: type === 'rating' ? 5 : undefined,
    }
    onFieldsChange([...fields, field])
    if (!isDisplayFieldType(type)) upsertFieldInLibrary(field)
    setExpandedFieldId(id)
    flashJustAdded(id)
    setIsAddFieldDialogOpen(false)
  }

  const handleUpdateField = (fieldId: string, patch: Partial<CustomProfileField>) => {
    const updated = fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f))
    onFieldsChange(updated)
    // Keep the library in sync while the user is actively setting this field up, so it shows
    // up with its real label/options rather than whatever it looked like at creation.
    const updatedField = updated.find((f) => f.id === fieldId)
    if (updatedField && !isStandardFieldId(updatedField.id) && !isDisplayFieldType(updatedField.type)) {
      upsertFieldInLibrary(updatedField)
    }
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
        onPickFieldType={handlePickFieldType}
      />
    </div>
  )
}

interface FieldCardProps {
  field: CustomProfileField
  fields: CustomProfileField[]
  isExpanded: boolean
  isJustAdded: boolean
  onToggleExpand: () => void
  onUpdateField: (patch: Partial<CustomProfileField>) => void
  onRemove: () => void
}

function FieldCard({ field, fields, isExpanded, isJustAdded, onToggleExpand, onUpdateField, onRemove }: FieldCardProps) {
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
        isDragging && 'z-50 shadow-lg ring-2 ring-primary/20',
        isJustAdded && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            className={cn(
              'flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
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
              <Button variant="default" size="sm" className="h-8 gap-1.5 px-3 text-xs font-medium" onClick={onToggleExpand}>
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
            <FieldEditForm field={field} fields={fields} onUpdateField={onUpdateField} />
          </div>
        </div>
      )}
    </div>
  )
}

interface FieldLabelAutocompleteProps {
  field: CustomProfileField
  onUpdateField: (patch: Partial<CustomProfileField>) => void
  id: string
  placeholder: string
  autoFocus: boolean
  asInput?: boolean
}

// Suggests existing fields of the same simplified type (Text/Number/Single select/Date) as the
// user types a label, so reusing a question's label/placeholder/help text/options is as easy
// as picking it from the list instead of rebuilding it from scratch. The widget type itself is
// never touched -- it was already chosen before this autocomplete appeared. Styled to blend in
// as plain text until hovered/focused, since this now lives directly in the card header rather
// than a separate "Field Label" row in the edit form below.
function FieldLabelAutocomplete({ field, onUpdateField, id, placeholder, autoFocus, asInput }: FieldLabelAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fieldLibrary, setFieldLibrary] = useState<CustomProfileField[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFieldLibrary(getFieldLibrary())
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const bucket = getSimplifiedFieldType(field.type)
  const searchTerm = field.label.trim().toLowerCase()
  const suggestions = bucket
    ? fieldLibrary
        .filter((f) => f.id !== field.id && getSimplifiedFieldType(f.type) === bucket)
        // An exact label match means this field was already built from (or matches) that
        // library entry -- re-suggesting it would just clone identical content into itself.
        .filter((f) => f.label.trim().toLowerCase() !== searchTerm)
        .filter((f) => !searchTerm || f.label.toLowerCase().includes(searchTerm))
        .slice(0, 6)
    : []

  const handleSelect = (source: CustomProfileField) => {
    // Deliberately doesn't copy `type` -- the user already chose a concrete widget (e.g. Range
    // slider) before this autocomplete ever appeared, and a same-bucket suggestion can be a
    // different concrete type (e.g. Annual Revenue is a plain Number field), so cloning it
    // wholesale would silently swap their chosen widget out from under them.
    onUpdateField({
      label: source.label,
      placeholder: source.placeholder,
      helpText: source.helpText,
      required: source.required,
      options: source.options ? [...source.options] : undefined,
      min: source.min,
      max: source.max,
      step: source.step,
      ratingMax: source.ratingMax,
    })
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <input
        id={id}
        value={field.label}
        onChange={(e) => {
          onUpdateField({ label: e.target.value })
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-label="Field label"
        className={asInput
          ? 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
          : 'h-auto w-full min-w-0 -mx-1 rounded border-none bg-transparent px-1 py-0.5 text-sm font-medium shadow-none outline-none transition-colors hover:bg-muted/60 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring'
        }
      />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Reuse an existing field</p>
          {suggestions.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => handleSelect(source)}
              className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span className="truncate">{source.label || 'Untitled field'}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{fieldTypeBadge[source.type].label}</span>
            </button>
          ))}
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
  const [newOption, setNewOption] = useState('')
  const standardEdit = isStandardFieldId(field.id)
  const type = field.type
  const isHeading = type === 'heading'
  const isParagraph = type === 'paragraph'
  const isDisplay = isHeading || isParagraph
  const updateLabel = (next: string) => onUpdateField({ label: next })

  const handleAddOption = () => {
    if (!newOption.trim()) return
    onUpdateField({
      options: [...(field.options || []), { value: newOption.toLowerCase().replace(/\s+/g, '_'), label: newOption }],
    })
    setNewOption('')
  }

  const handleRemoveOption = (index: number) => {
    onUpdateField({ options: field.options?.filter((_, i) => i !== index) })
  }

  // Only the label is editable -- the underlying value stays put since conditional
  // visibility rules elsewhere may already reference this option by its value.
  const handleUpdateOptionLabel = (index: number, label: string) => {
    onUpdateField({ options: field.options?.map((o, i) => (i === index ? { ...o, label } : o)) })
  }

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
          <Label htmlFor={`field-label-${field.id}`}>
            {isHeading ? 'Heading Text' : 'Label'}
            <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>
          </Label>
          <FieldLabelAutocomplete
            field={field}
            onUpdateField={onUpdateField}
            id={`field-label-${field.id}`}
            placeholder={isHeading ? 'e.g., Tell us about yourself' : 'e.g., Department'}
            autoFocus={!field.label}
            asInput
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

      {!standardEdit && NUMERIC_RANGE_TYPES.includes(type) && (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor={`field-min-${field.id}`}>Min</Label>
            <Input
              id={`field-min-${field.id}`}
              type="number"
              value={field.min ?? ''}
              onChange={(e) => onUpdateField({ min: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`field-max-${field.id}`}>Max</Label>
            <Input
              id={`field-max-${field.id}`}
              type="number"
              value={field.max ?? ''}
              onChange={(e) => onUpdateField({ max: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`field-step-${field.id}`}>Step</Label>
            <Input
              id={`field-step-${field.id}`}
              type="number"
              value={field.step ?? ''}
              onChange={(e) => onUpdateField({ step: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
          </div>
        </div>
      )}

      {!standardEdit && type === 'rating' && (
        <div className="space-y-2">
          <Label htmlFor={`field-rating-max-${field.id}`}>Number of stars</Label>
          <Input
            id={`field-rating-max-${field.id}`}
            type="number"
            min={2}
            max={10}
            value={field.ratingMax ?? 5}
            onChange={(e) => onUpdateField({ ratingMax: Number(e.target.value) || 5 })}
          />
        </div>
      )}

      {!standardEdit && hasFixedOptions(type) && (
        <p className="text-xs text-muted-foreground">
          Uses a built-in list of {type === 'country' ? 'countries' : 'Australian states and territories'} — no setup needed.
        </p>
      )}

      {!standardEdit && isChoiceFieldType(type) && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => handleUpdateOptionLabel(index, e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add an option"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddOption()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddOption}>
                Add
              </Button>
            </div>
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
