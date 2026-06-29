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
  type Category,
  type CategoryOption,
  type CustomProfileField,
  type FieldVisibilityOperator,
  fieldTypeBadge,
  getBuiltInFieldOptions,
  isBooleanFieldType,
  isConditionSourceFieldType,
} from '@/lib/subscription-types'
import type { MailGroup } from '@/lib/subscription-centre'
import type { ColorTheme } from '@/lib/brand-config'
import { ConditionalBadge, ConditionalVisibilityNote } from '@/components/conditional-visibility-note'
import { StylePicker } from '@/components/style-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/multi-select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, X, GripVertical, Pencil, Check, Trash2, ArrowDownAZ } from 'lucide-react'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

const NO_FOLDER = '__none__'
const NEW_FOLDER = '__new_folder__'

export interface SortableCategoryCardProps {
  category: Category
  mailGroups: MailGroup[]
  onAddMailGroup: (group: MailGroup) => void
  profileFields: CustomProfileField[]
  categories: Category[]
  getSourceLabel: (id: string) => string
  theme: ColorTheme
  isExpanded: boolean
  isJustAdded: boolean
  onToggleExpand: () => void
  onUpdateCategory: (patch: Partial<Category>) => void
  onRemove: () => void
  onCardStyleChange: (styleIndex: number) => void
  expandedOptionKey: string | null
  justAddedOptionKey: string | null
  onToggleOptionExpand: (optionKey: string) => void
  onAddOption: () => void
  onAddExistingOptions: (mailGroupIds: string[]) => void
  onUpdateOption: (optionKey: string, patch: Partial<CategoryOption>) => void
  onRemoveOption: (optionKey: string) => void
}

export function SortableCategoryCard({
  category,
  mailGroups,
  onAddMailGroup,
  profileFields,
  categories,
  getSourceLabel,
  theme,
  isExpanded,
  isJustAdded,
  onToggleExpand,
  onUpdateCategory,
  onRemove,
  onCardStyleChange,
  expandedOptionKey,
  justAddedOptionKey,
  onToggleOptionExpand,
  onAddOption,
  onAddExistingOptions,
  onUpdateOption,
  onRemoveOption,
}: SortableCategoryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id })
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [isAddExistingDialogOpen, setIsAddExistingDialogOpen] = useState(false)
  const [selectedExistingIds, setSelectedExistingIds] = useState<string[]>([])

  const availableExistingMailGroups = mailGroups.filter(
    (g) => !category.options.some((o) => o.mailGroupId === g.id)
  )

  const toggleExistingSelection = (id: string) => {
    setSelectedExistingIds((prev) => (prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]))
  }

  const handleAddExisting = () => {
    if (selectedExistingIds.length === 0) return
    onAddExistingOptions(selectedExistingIds)
    setIsAddExistingDialogOpen(false)
    setSelectedExistingIds([])
  }

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    cardRef.current = node
  }

  const optionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleOptionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = category.options.findIndex((o) => o.key === active.id)
    const newIndex = category.options.findIndex((o) => o.key === over.id)
    onUpdateCategory({ options: arrayMove(category.options, oldIndex, newIndex) })
  }

  const handleSortAlphabetically = () => {
    const sorted = [...category.options].sort((a, b) =>
      (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' })
    )
    onUpdateCategory({ options: sorted })
  }

  useEffect(() => {
    if (!isJustAdded) return
    const timer = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
    return () => clearTimeout(timer)
  }, [isJustAdded])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setRefs}
      style={style}
      className={cn(
        'relative overflow-hidden transition-shadow duration-700 hover:shadow-md',
        category.visibleWhen?.length && 'border-l-4 border-l-amber-400',
        isDragging && 'z-50 shadow-lg ring-2 ring-primary/20',
        isJustAdded && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-3 text-left">
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
              aria-label={`Drag to reorder ${category.title || 'category'}`}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 pt-1.5">
              {isExpanded ? (
                <CategoryEditForm
                  category={category}
                  profileFields={profileFields}
                  categories={categories}
                  onUpdateCategory={onUpdateCategory}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold">{category.title || 'Untitled category'}</p>
                    {category.required && <span className="text-xs font-medium text-destructive">Required</span>}
                  </div>
                  {category.description && <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>}
                  {category.visibleWhen?.length ? (
                    <div className="mt-2">
                      <ConditionalVisibilityNote rule={category.visibleWhen[0]} getFieldLabel={getSourceLabel} />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isExpanded && (
              <StylePicker theme={theme} value={category.cardStyleIndex} onChange={onCardStyleChange} className="w-[130px]" />
            )}
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
      </CardHeader>

      <CardContent className="space-y-3">
        {!isExpanded && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={fieldTypeBadge[category.type].className}>
                {fieldTypeBadge[category.type].label}
              </Badge>
              <Badge variant="outline">
                {category.options.length} {category.options.length === 1 ? 'mailgroup' : 'mailgroups'}
              </Badge>
              {category.visibleWhen?.length ? <ConditionalBadge /> : null}
            </div>
            {category.options.length > 1 && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={handleSortAlphabetically}>
                <ArrowDownAZ className="h-3.5 w-3.5" />
                Sort A-Z
              </Button>
            )}
          </div>
        )}

        {category.options.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No mailgroups added yet.</p>
        ) : (
          <>
            <DndContext sensors={optionSensors} collisionDetection={closestCenter} onDragEnd={handleOptionDragEnd}>
              <SortableContext items={category.options.map((o) => o.key)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {category.options.map((option) => (
                    <MailgroupOptionRow
                      key={option.key}
                      option={option}
                      mailGroups={mailGroups}
                      onAddMailGroup={onAddMailGroup}
                      isExpanded={expandedOptionKey === option.key}
                      isJustAdded={justAddedOptionKey === option.key}
                      onToggleExpand={() => onToggleOptionExpand(option.key)}
                      onUpdateOption={(patch) => onUpdateOption(option.key, patch)}
                      onRemove={() => onRemoveOption(option.key)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}

        <div className="flex gap-2">
          <Dialog
            open={isAddExistingDialogOpen}
            onOpenChange={(open) => {
              setIsAddExistingDialogOpen(open)
              if (!open) setSelectedExistingIds([])
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2" disabled={availableExistingMailGroups.length === 0}>
                <Plus className="h-4 w-4" />
                Add Existing Mailgroup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Existing Mailgroup</DialogTitle>
                <DialogDescription>Link one or more mail groups from your mailing system. Select one or more.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                {availableExistingMailGroups.map((group) => (
                  <label
                    key={group.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={selectedExistingIds.includes(group.id)}
                      onCheckedChange={() => toggleExistingSelection(group.id)}
                    />
                    <span className="flex-1 text-sm font-medium">{group.name}</span>
                    <Badge variant="outline">{group.folder}</Badge>
                  </label>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddExistingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExisting} disabled={selectedExistingIds.length === 0}>
                  Add {selectedExistingIds.length > 0 ? `(${selectedExistingIds.length})` : ''}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="flex-1 gap-2" onClick={onAddOption}>
            <Plus className="h-4 w-4" />
            Add New Mailgroup
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface MailgroupOptionRowProps {
  option: CategoryOption
  mailGroups: MailGroup[]
  onAddMailGroup: (group: MailGroup) => void
  isExpanded: boolean
  isJustAdded: boolean
  onToggleExpand: () => void
  onUpdateOption: (patch: Partial<CategoryOption>) => void
  onRemove: () => void
}

function MailgroupOptionRow({
  option,
  mailGroups,
  onAddMailGroup,
  isExpanded,
  isJustAdded,
  onToggleExpand,
  onUpdateOption,
  onRemove,
}: MailgroupOptionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.key })
  const rowRef = useRef<HTMLDivElement | null>(null)

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    rowRef.current = node
  }

  useEffect(() => {
    if (!isJustAdded) return
    const timer = setTimeout(() => {
      rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
    return () => clearTimeout(timer)
  }, [isJustAdded])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const linkedGroup = mailGroups.find((g) => g.id === option.mailGroupId)

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        'flex items-start justify-between rounded-md border bg-muted/50 p-3 transition-shadow duration-700',
        isDragging && 'z-50 shadow-lg ring-2 ring-primary/20',
        isJustAdded && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
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
          aria-label={`Drag to reorder ${option.label || 'mailgroup'}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 pt-1.5">
          {isExpanded ? (
            <MailgroupOptionEditForm
              option={option}
              mailGroups={mailGroups}
              onAddMailGroup={onAddMailGroup}
              onUpdateOption={onUpdateOption}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{option.label || 'Select a mailgroup'}</p>
                {linkedGroup && <Badge variant="outline">{linkedGroup.folder}</Badge>}
              </div>
              {option.description && <p className="text-xs text-muted-foreground">{option.description}</p>}
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleExpand}>
          {isExpanded ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface CategoryEditFormProps {
  category: Category
  profileFields: CustomProfileField[]
  categories: Category[]
  onUpdateCategory: (patch: Partial<Category>) => void
}

function CategoryEditForm({ category, profileFields, categories, onUpdateCategory }: CategoryEditFormProps) {
  const visibilitySources = [
    ...profileFields
      .filter((field) => isConditionSourceFieldType(field.type))
      .map((field) => ({
        id: field.id,
        label: field.label,
        isBoolean: isBooleanFieldType(field.type),
        options: field.options?.length ? field.options : getBuiltInFieldOptions(field.type),
      })),
    ...categories
      .filter((c) => c.id !== category.id)
      .map((c) => ({
        id: c.id,
        label: c.title,
        isBoolean: false,
        options: c.options.map((option) => ({ value: option.key, label: option.label })),
      })),
  ]

  const currentRule = category.visibleWhen?.[0]
  const sourceField = visibilitySources.find((s) => s.id === currentRule?.fieldId)
  const sourceIsBoolean = sourceField?.isBoolean ?? false

  const updateConditionSource = (value: string) => {
    const source = visibilitySources.find((s) => s.id === value)
    const operator: FieldVisibilityOperator = source?.isBoolean ? 'hasValue' : 'equals'
    onUpdateCategory({ visibleWhen: [{ fieldId: value, operator, value: operator === 'hasValue' ? undefined : [] }] })
  }

  const updateConditionValue = (value: string | string[]) => {
    if (!currentRule) return
    onUpdateCategory({ visibleWhen: [{ ...currentRule, value }] })
  }

  const toggleCondition = (enabled: boolean) => {
    if (!enabled) {
      onUpdateCategory({ visibleWhen: undefined })
      return
    }
    if (visibilitySources[0]) updateConditionSource(visibilitySources[0].id)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`category-title-${category.id}`}>Category Title *</Label>
        <Input
          id={`category-title-${category.id}`}
          value={category.title}
          onChange={(e) => onUpdateCategory({ title: e.target.value })}
          placeholder="e.g., Newsletter Topics"
          autoFocus={!category.title}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`category-description-${category.id}`}>Description</Label>
        <Textarea
          id={`category-description-${category.id}`}
          value={category.description}
          onChange={(e) => onUpdateCategory({ description: e.target.value })}
          placeholder="e.g., Choose the topics you want to receive updates about"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`category-type-${category.id}`}>Selection Type</Label>
        <Select value={category.type} onValueChange={(value: 'checkbox' | 'radio') => onUpdateCategory({ type: value })}>
          <SelectTrigger id={`category-type-${category.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checkbox">Checkboxes (Multiple Choice)</SelectItem>
            <SelectItem value="radio">Radio Buttons (Single Choice)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {visibilitySources.length > 0 && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`category-condition-toggle-${category.id}`} className="cursor-pointer">
              Conditional visibility
            </Label>
            <Switch id={`category-condition-toggle-${category.id}`} checked={!!currentRule} onCheckedChange={toggleCondition} />
          </div>

          {currentRule && (
            <div className="space-y-2">
              <Label htmlFor={`category-condition-source-${category.id}`}>Show this question when the field</Label>
              <Select value={currentRule.fieldId} onValueChange={updateConditionSource}>
                <SelectTrigger id={`category-condition-source-${category.id}`} className="w-full">
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
              <Label htmlFor={`category-condition-value-${category.id}`}>Equals</Label>
              {sourceField.options?.length ? (
                <MultiSelect
                  id={`category-condition-value-${category.id}`}
                  options={sourceField.options}
                  selected={Array.isArray(currentRule.value) ? currentRule.value : currentRule.value ? [currentRule.value] : []}
                  onChange={updateConditionValue}
                  placeholder="Select one or more options"
                />
              ) : (
                <Input
                  id={`category-condition-value-${category.id}`}
                  value={Array.isArray(currentRule.value) ? '' : currentRule.value || ''}
                  onChange={(e) => updateConditionValue(e.target.value)}
                  placeholder="e.g., an option key"
                />
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id={`category-required-${category.id}`}
          checked={category.required}
          onCheckedChange={(checked) => onUpdateCategory({ required: checked as boolean })}
        />
        <Label htmlFor={`category-required-${category.id}`} className="cursor-pointer">
          Require an answer
        </Label>
      </div>
    </div>
  )
}

interface MailgroupOptionEditFormProps {
  option: CategoryOption
  mailGroups: MailGroup[]
  onAddMailGroup: (group: MailGroup) => void
  onUpdateOption: (patch: Partial<CategoryOption>) => void
}

function MailgroupOptionEditForm({ option, mailGroups, onAddMailGroup, onUpdateOption }: MailgroupOptionEditFormProps) {
  const currentMailGroup = mailGroups.find((g) => g.id === option.mailGroupId)
  const [selectedFolder, setSelectedFolder] = useState(currentMailGroup?.folder ?? '')
  const folders = Array.from(new Set(mailGroups.map((g) => g.folder)))
  const mailGroupsInFolder = mailGroups.filter((g) => g.folder === selectedFolder)

  // Blank options only ever come from "Add New Mailgroup" now ("Add Existing Mailgroup"
  // creates fully-linked options directly), so default this form straight to Create New.
  const [mode, setMode] = useState<'existing' | 'new'>(option.mailGroupId ? 'existing' : 'new')
  const [newFolderChoice, setNewFolderChoice] = useState(folders[0] ?? NEW_FOLDER)
  const [newFolderName, setNewFolderName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  const handleSelectMailGroup = (mailGroupId: string) => {
    const group = mailGroups.find((g) => g.id === mailGroupId)
    if (!group) return
    onUpdateOption({ mailGroupId: group.id, label: group.name })
  }

  const resolvedNewFolder = newFolderChoice === NEW_FOLDER ? newFolderName.trim() : newFolderChoice
  const canCreate = resolvedNewFolder.length > 0 && newGroupName.trim().length > 0

  const handleCreateMailGroup = () => {
    if (!canCreate) return
    const group: MailGroup = { id: uuidv4(), name: newGroupName.trim(), folder: resolvedNewFolder }
    onAddMailGroup(group)
    onUpdateOption({ mailGroupId: group.id, label: group.name })
    setSelectedFolder(group.folder)
    setNewGroupName('')
    setNewFolderName('')
    setMode('existing')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode('existing')}
          className={cn(
            'flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'existing' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Use Existing
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={cn(
            'flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'new' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Create New
        </button>
      </div>

      {mode === 'existing' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor={`option-folder-${option.key}`}>Folder *</Label>
            <Select
              value={selectedFolder || NO_FOLDER}
              onValueChange={(value) => {
                const folder = value === NO_FOLDER ? '' : value
                setSelectedFolder(folder)
                onUpdateOption({ mailGroupId: undefined, label: '' })
              }}
            >
              <SelectTrigger id={`option-folder-${option.key}`}>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_FOLDER} disabled>
                  Select a folder
                </SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {folders.length === 0 && <p className="text-xs text-muted-foreground">No mail groups available to link yet.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`option-mailgroup-${option.key}`}>Mailgroup *</Label>
            <Select value={option.mailGroupId || ''} onValueChange={handleSelectMailGroup} disabled={!selectedFolder}>
              <SelectTrigger id={`option-mailgroup-${option.key}`}>
                <SelectValue placeholder={selectedFolder ? 'Select a mailgroup' : 'Choose a folder first'} />
              </SelectTrigger>
              <SelectContent>
                {mailGroupsInFolder.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor={`option-new-folder-${option.key}`}>Folder *</Label>
            <Select value={newFolderChoice} onValueChange={setNewFolderChoice}>
              <SelectTrigger id={`option-new-folder-${option.key}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_FOLDER}>+ New folder</SelectItem>
              </SelectContent>
            </Select>
            {newFolderChoice === NEW_FOLDER && (
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Partnerships"
                autoFocus
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`option-new-mailgroup-name-${option.key}`}>Mailgroup Name *</Label>
            <Input
              id={`option-new-mailgroup-name-${option.key}`}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Product Updates"
            />
          </div>

          <Button type="button" size="sm" className="gap-2" disabled={!canCreate} onClick={handleCreateMailGroup}>
            <Plus className="h-4 w-4" />
            Create Mailgroup
          </Button>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor={`option-description-${option.key}`}>Description</Label>
        <Textarea
          id={`option-description-${option.key}`}
          value={option.description}
          onChange={(e) => onUpdateOption({ description: e.target.value })}
          placeholder="e.g., New features, improvements, and releases"
          rows={2}
        />
      </div>
    </div>
  )
}
