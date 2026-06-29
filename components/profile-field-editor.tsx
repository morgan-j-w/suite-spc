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
import { renderFormattedText } from '@/lib/format-text'
import { getFieldLibrary, upsertFieldInLibrary } from '@/lib/field-library-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { MultiSelect } from '@/components/multi-select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
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
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  List,
  ListOrdered,
  Link as LinkIcon,
  Palette,
  Minus,
  type LucideIcon,
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '@/lib/utils'
import { ConditionalBadge, ConditionalVisibilityNote } from '@/components/conditional-visibility-note'

const TEXT_LIKE_TYPES: ProfileFieldType[] = ['text', 'email', 'phone', 'number', 'textarea']
const NUMERIC_RANGE_TYPES: ProfileFieldType[] = ['number', 'range']

type TextEl = HTMLInputElement | HTMLTextAreaElement

// Wraps the current selection in `before`/`after` markers (e.g. ** for bold), falling back
// to `placeholder` text when nothing is selected, and restores focus + a sensible selection
// afterwards so the toolbar feels like a real inline editor rather than a one-shot insert.
function wrapSelection(el: TextEl | null, value: string, onChange: (next: string) => void, before: string, after: string, placeholder = '') {
  if (!el) return
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  const selected = value.slice(start, end) || placeholder
  const next = value.slice(0, start) + before + selected + after + value.slice(end)
  onChange(next)
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + before.length, start + before.length + selected.length)
  })
}

// Inserts [link text](https://) and selects the URL placeholder so it's ready to type over.
function insertLink(el: TextEl | null, value: string, onChange: (next: string) => void) {
  if (!el) return
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  const linkText = value.slice(start, end) || 'link text'
  const url = 'https://'
  const next = value.slice(0, start) + `[${linkText}](${url})` + value.slice(end)
  onChange(next)
  requestAnimationFrame(() => {
    el.focus()
    const urlStart = start + linkText.length + 3
    el.setSelectionRange(urlStart, urlStart + url.length)
  })
}

const BULLET_PREFIX = /^-\s+/
const NUMBERED_PREFIX = /^\d+\.\s+/

// Toggles a "- " or "1. " prefix across every line the selection touches -- list buttons
// work on whole lines rather than an arbitrary character range like the other formatters.
function toggleListPrefix(el: TextEl | null, value: string, onChange: (next: string) => void, kind: 'bullet' | 'numbered') {
  if (!el) return
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const nextNewline = value.indexOf('\n', end)
  const lineEnd = nextNewline === -1 ? value.length : nextNewline

  const prefixRe = kind === 'bullet' ? BULLET_PREFIX : NUMBERED_PREFIX
  const lines = value.slice(lineStart, lineEnd).split('\n')
  const alreadyListed = lines.every((line) => prefixRe.test(line))

  const nextLines = lines.map((line, i) => {
    const stripped = line.replace(BULLET_PREFIX, '').replace(NUMBERED_PREFIX, '')
    if (alreadyListed) return stripped
    return kind === 'bullet' ? `- ${stripped}` : `${i + 1}. ${stripped}`
  })

  const nextBlock = nextLines.join('\n')
  const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd)
  onChange(next)
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(lineStart, lineStart + nextBlock.length)
  })
}

// Inserts a "---" horizontal rule on its own line at the cursor, replacing any selection.
function insertHorizontalRule(el: TextEl | null, value: string, onChange: (next: string) => void) {
  if (!el) return
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  const insertion = '\n---\n'
  const next = value.slice(0, start) + insertion + value.slice(end)
  onChange(next)
  requestAnimationFrame(() => {
    const pos = start + insertion.length
    el.focus()
    el.setSelectionRange(pos, pos)
  })
}

interface FieldTypeOption {
  type: ProfileFieldType
  label: string
  description: string
  icon: LucideIcon
}

const FIELD_TYPE_GROUPS: { groupLabel: string; options: FieldTypeOption[] }[] = [
  {
    groupLabel: 'Text',
    options: [
      { type: 'text', label: 'Text input', description: 'Free text, one line', icon: Type },
      { type: 'email', label: 'Email input', description: 'Validates an email address', icon: Mail },
      { type: 'phone', label: 'Phone input', description: 'For phone numbers', icon: Phone },
      { type: 'number', label: 'Number input', description: 'Numeric values only', icon: Hash },
      { type: 'textarea', label: 'Textarea', description: 'Free text, multiple lines', icon: AlignLeft },
    ],
  },
  {
    groupLabel: 'Choice',
    options: [
      { type: 'select', label: 'Dropdown (select)', description: 'Pick one option from a list', icon: ChevronDown },
      { type: 'country', label: 'Country select', description: 'Built-in list of countries', icon: Globe },
      { type: 'state_au', label: 'State (AU)', description: 'Built-in list of AU states & territories', icon: MapPin },
      { type: 'radio', label: 'Radio buttons', description: 'Group of radio buttons, pick one', icon: CircleDot },
      { type: 'checkboxGroup', label: 'Checkbox', description: 'Group of checkboxes, pick any number', icon: ListChecks },
      { type: 'toggle', label: 'Toggle', description: 'Group of on/off switches', icon: ToggleLeft },
    ],
  },
  {
    groupLabel: 'Other',
    options: [
      { type: 'date', label: 'Date input', description: 'A date picker', icon: Calendar },
      { type: 'range', label: 'Range slider', description: 'Pick a number along a slider', icon: SlidersHorizontal },
      { type: 'rating', label: 'Rating', description: 'A star rating scale', icon: Star },
    ],
  },
  {
    groupLabel: 'Display',
    options: [
      { type: 'heading', label: 'Section heading', description: 'A heading with no input', icon: Heading },
      { type: 'paragraph', label: 'Paragraph', description: 'Plain text with no input', icon: Pilcrow },
    ],
  },
]

const FIELD_TYPE_ICONS = FIELD_TYPE_GROUPS.reduce<Partial<Record<ProfileFieldType, LucideIcon>>>((acc, group) => {
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddStandardDialogOpen, setIsAddStandardDialogOpen] = useState(false)
  const [isAddExistingDialogOpen, setIsAddExistingDialogOpen] = useState(false)
  const [selectedExistingIds, setSelectedExistingIds] = useState<string[]>([])
  const [fieldLibrary, setFieldLibrary] = useState<CustomProfileField[]>([])
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null)
  const [justAddedFieldId, setJustAddedFieldId] = useState<string | null>(null)
  const justAddedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load on mount so the "Add Existing Field" button's disabled state is correct right away
  // (an initially-disabled trigger could otherwise never be clicked to open the dialog that
  // would load it), then refresh whenever the picker reopens to pick up fields created or
  // edited elsewhere (another section, another centre) earlier in the same session.
  useEffect(() => {
    setFieldLibrary(getFieldLibrary())
  }, [])

  useEffect(() => {
    if (isAddExistingDialogOpen) setFieldLibrary(getFieldLibrary())
  }, [isAddExistingDialogOpen])

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

  // Library fields, excluding display-only types (headings/paragraphs aren't reusable
  // questions) and ones this section already has. Added fields are cloned with a fresh id
  // (see handleAddExistingFields), so "already has" matches on label + type, not id.
  const availableExistingFields = fieldLibrary.filter(
    (f) =>
      getSimplifiedFieldType(f.type) !== null &&
      !fields.some((existing) => existing.label === f.label && existing.type === f.type)
  )

  const toggleExistingSelection = (id: string) => {
    setSelectedExistingIds((prev) => (prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]))
  }

  const handleAddExistingFields = () => {
    // Cloned with a fresh id, not the source field's id -- two fields must never share an id
    // (it's relied on as a unique key for DOM ids, conditional-visibility lookups, and answer
    // storage). This does mean the clone starts as an independent question with its own
    // answer, not one kept in sync with the original.
    const toAdd = availableExistingFields
      .filter((f) => selectedExistingIds.includes(f.id))
      .map((f) => ({ ...f, id: uuidv4(), visibleWhen: undefined, options: f.options ? [...f.options] : undefined }))
    if (toAdd.length === 0) return
    onFieldsChange([...fields, ...toAdd])
    setIsAddExistingDialogOpen(false)
    setSelectedExistingIds([])
    flashJustAdded(toAdd[toAdd.length - 1].id)
  }

  const handlePickStandardField = (def: StandardFieldDef) => {
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
    setIsAddStandardDialogOpen(false)
    setExpandedFieldId(def.id)
    flashJustAdded(def.id)
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
    setIsAddDialogOpen(false)
    setExpandedFieldId(id)
    flashJustAdded(id)
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
      {/* Add Field Buttons - Prominent at top */}
      <div className="flex gap-2">
        <Dialog open={isAddStandardDialogOpen} onOpenChange={setIsAddStandardDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 gap-2" disabled={availableStandardFields.length === 0}>
              <Plus className="h-4 w-4" />
              Add Standard Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Standard Field</DialogTitle>
              <DialogDescription>
                Standard fields are system-defined — pick one to add it, then edit whether it&apos;s required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto pr-1">
              {availableStandardFields.map((def) => {
                const Icon = FIELD_TYPE_ICONS[def.type]
                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => handlePickStandardField(def)}
                    className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-muted/40"
                  >
                    {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium">{def.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{fieldTypeBadge[def.type].label}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddStandardDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAddExistingDialogOpen}
          onOpenChange={(open) => {
            setIsAddExistingDialogOpen(open)
            if (!open) setSelectedExistingIds([])
          }}
        >
          {availableExistingFields.length === 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex-1 cursor-not-allowed">
                  <Button variant="outline" className="w-full gap-2" disabled>
                    <Plus className="h-4 w-4" />
                    Add Existing Field
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Your field library is empty — create a custom field anywhere and it'll show up here for reuse.
              </TooltipContent>
            </Tooltip>
          ) : (
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Plus className="h-4 w-4" />
                Add Existing Field
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Existing Field</DialogTitle>
              <DialogDescription>Reuse a field from your library. Select one or more.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {availableExistingFields.map((field) => (
                <label
                  key={field.id}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selectedExistingIds.includes(field.id)}
                    onCheckedChange={() => toggleExistingSelection(field.id)}
                  />
                  <span className="flex-1 text-sm font-medium">{field.label || 'Untitled field'}</span>
                  <Badge variant="outline">{getSimplifiedFieldType(field.type)}</Badge>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddExistingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExistingFields} disabled={selectedExistingIds.length === 0}>
                Add {selectedExistingIds.length > 0 ? `(${selectedExistingIds.length})` : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Add New Custom Field
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Custom Field</DialogTitle>
              <DialogDescription>Pick a field type to add it to this section.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {FIELD_TYPE_GROUPS.map((group) => (
                <div key={group.groupLabel} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.groupLabel}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => handlePickFieldType(opt.type)}
                        className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-muted/40"
                      >
                        <opt.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Fields */}
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
        <div className="rounded-lg border-2 border-dashed bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No fields yet. Click &quot;Add Standard Field&quot; for things like Email or Name, or &quot;Add New Custom Field&quot; for anything else.
          </p>
        </div>
      )}
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
        'group relative rounded-lg border bg-card p-4 transition-shadow duration-700 hover:shadow-md',
        field.visibleWhen?.length && 'border-l-4 border-l-amber-400',
        isDragging && 'z-50 shadow-lg ring-2 ring-primary/20',
        isJustAdded && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3">
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
          <div className="min-w-0 flex-1 pt-1.5">
            {isExpanded ? (
              <FieldEditForm field={field} fields={fields} onUpdateField={onUpdateField} />
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">
                    {isDisplayFieldType(field.type)
                      ? renderFormattedText(field.label || 'Untitled field')
                      : field.label || 'Untitled field'}
                  </p>
                  {field.required && <span className="text-xs font-medium text-destructive">Required</span>}
                </div>
                {(field.helpText || field.visibleWhen?.length) && (
                  <div className="mt-1 space-y-1">
                    {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
                    {field.visibleWhen?.length ? (
                      <ConditionalVisibilityNote
                        rule={field.visibleWhen[0]}
                        getFieldLabel={(fieldId) => fields.find((item) => item.id === fieldId)?.label || fieldId}
                      />
                    ) : null}
                  </div>
                )}
              </>
            )}
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
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleExpand}>
              {isExpanded ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
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
  const labelRef = useRef<TextEl>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  // Tracks the range to recolor and the ORIGINAL plain text inside it. Native color inputs
  // fire onChange repeatedly while the user drags the picker, so each firing must replace
  // this exact range with a fresh wrap of the original text -- re-wrapping the textarea's
  // *current* value (which already contains the previous wrap) would nest tags infinitely.
  const colorEditRef = useRef<{ start: number; end: number; original: string } | null>(null)
  const standardEdit = isStandardFieldId(field.id)
  const type = field.type
  const isHeading = type === 'heading'
  const isParagraph = type === 'paragraph'
  const isDisplay = isHeading || isParagraph
  const updateLabel = (next: string) => onUpdateField({ label: next })

  const openColorPicker = () => {
    if (!labelRef.current) return
    const start = labelRef.current.selectionStart ?? field.label.length
    const end = labelRef.current.selectionEnd ?? field.label.length
    colorEditRef.current = { start, end, original: field.label.slice(start, end) || 'colored text' }
    colorInputRef.current?.click()
  }

  const applyColor = (hex: string) => {
    const el = labelRef.current
    const edit = colorEditRef.current
    if (!el || !edit) return
    const { start, end, original } = edit
    const before = `[color=${hex}]`
    const after = '[/color]'
    const wrapped = before + original + after
    const next = field.label.slice(0, start) + wrapped + field.label.slice(end)
    updateLabel(next)
    colorEditRef.current = { start, end: start + wrapped.length, original }
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + original.length)
    })
  }

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
      <div className="space-y-2">
        <Label htmlFor={`field-label-${field.id}`}>
          {isHeading ? 'Heading Text *' : isParagraph ? 'Paragraph Text *' : 'Field Label *'}
        </Label>
        {isParagraph && (
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Bold"
              onClick={() => wrapSelection(labelRef.current, field.label, updateLabel, '**', '**', 'bold text')}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Italic"
              onClick={() => wrapSelection(labelRef.current, field.label, updateLabel, '*', '*', 'italic text')}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Underline"
              onClick={() => wrapSelection(labelRef.current, field.label, updateLabel, '__', '__', 'underlined text')}
            >
              <Underline className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Strikethrough"
              onClick={() => wrapSelection(labelRef.current, field.label, updateLabel, '~~', '~~', 'strikethrough text')}
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Subscript"
              onClick={() => wrapSelection(labelRef.current, field.label, updateLabel, '~', '~', 'sub')}
            >
              <Subscript className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Superscript"
              onClick={() => wrapSelection(labelRef.current, field.label, updateLabel, '^', '^', 'sup')}
            >
              <Superscript className="h-3.5 w-3.5" />
            </Button>

            <div className="mx-0.5 h-5 w-px bg-border" />

            <input
              ref={colorInputRef}
              type="color"
              className="sr-only"
              onChange={(e) => applyColor(e.target.value)}
              tabIndex={-1}
            />
            <Button type="button" variant="outline" size="icon" className="h-7 w-7" title="Text color" onClick={openColorPicker}>
              <Palette className="h-3.5 w-3.5" />
            </Button>

            <div className="mx-0.5 h-5 w-px bg-border" />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Bullet list"
              onClick={() => toggleListPrefix(labelRef.current, field.label, updateLabel, 'bullet')}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Numbered list"
              onClick={() => toggleListPrefix(labelRef.current, field.label, updateLabel, 'numbered')}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>

            <div className="mx-0.5 h-5 w-px bg-border" />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Link"
              onClick={() => insertLink(labelRef.current, field.label, updateLabel)}
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              title="Horizontal rule"
              onClick={() => insertHorizontalRule(labelRef.current, field.label, updateLabel)}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>

            <div className="mx-0.5 h-5 w-px bg-border" />

            <div className="flex gap-1">
              <Button
                type="button"
                variant={(field.textAlign || 'left') === 'left' ? 'default' : 'outline'}
                size="icon"
                className="h-7 w-7"
                title="Align left"
                onClick={() => onUpdateField({ textAlign: 'left' })}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={field.textAlign === 'center' ? 'default' : 'outline'}
                size="icon"
                className="h-7 w-7"
                title="Align center"
                onClick={() => onUpdateField({ textAlign: 'center' })}
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={field.textAlign === 'right' ? 'default' : 'outline'}
                size="icon"
                className="h-7 w-7"
                title="Align right"
                onClick={() => onUpdateField({ textAlign: 'right' })}
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant={field.textAlign === 'justify' ? 'default' : 'outline'}
                size="icon"
                className="h-7 w-7"
                title="Justify"
                onClick={() => onUpdateField({ textAlign: 'justify' })}
              >
                <AlignJustify className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
        {isParagraph ? (
          <Textarea
            ref={labelRef as React.RefObject<HTMLTextAreaElement>}
            id={`field-label-${field.id}`}
            value={field.label}
            onChange={(e) => onUpdateField({ label: e.target.value })}
            placeholder="e.g., A few quick questions to personalize your experience."
            rows={3}
            autoFocus={!field.label}
          />
        ) : (
          <Input
            ref={labelRef as React.RefObject<HTMLInputElement>}
            id={`field-label-${field.id}`}
            value={field.label}
            onChange={(e) => onUpdateField({ label: e.target.value })}
            placeholder={isHeading ? 'e.g., Tell us about yourself' : 'e.g., Department'}
            autoFocus={!field.label}
          />
        )}
      </div>

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
        <div className="flex items-center gap-2">
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
