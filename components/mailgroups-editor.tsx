'use client'

import { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { type Category, type CategoryOption, type CustomProfileField } from '@/lib/subscription-types'
import type { MailGroup } from '@/lib/subscription-centre'
import { CategoryCard } from '@/components/category-card'
import { SortableCardShell } from '@/components/sortable-card-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, Pencil, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const NEW_FOLDER = '__new_folder__'

interface MailgroupsEditorProps {
  mailGroups: MailGroup[]
  onAddMailGroup: (group: MailGroup) => void
  catchAllMailGroupId: string | null
  onCatchAllMailGroupIdChange: (mailGroupId: string | null) => void
  categories: Category[]
  onCategoriesChange: (categories: Category[]) => void
  profileFields: CustomProfileField[]
  sectionOrder: string[]
  onSectionOrderChange: (order: string[]) => void
}

export function MailgroupsEditor({
  mailGroups,
  onAddMailGroup,
  catchAllMailGroupId,
  onCatchAllMailGroupIdChange,
  categories,
  onCategoriesChange,
  profileFields,
  sectionOrder,
  onSectionOrderChange,
}: MailgroupsEditorProps) {
  const categoryIds = sectionOrder.filter((id) => categories.some((c) => c.id === id))

  const moveCategory = (id: string, direction: 'up' | 'down') => {
    const filteredIdx = categoryIds.indexOf(id)
    const newFilteredIdx = filteredIdx + (direction === 'up' ? -1 : 1)
    if (newFilteredIdx < 0 || newFilteredIdx >= categoryIds.length) return
    const targetId = categoryIds[newFilteredIdx]
    onSectionOrderChange(arrayMove(sectionOrder, sectionOrder.indexOf(id), sectionOrder.indexOf(targetId)))
  }

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onSectionOrderChange(arrayMove(sectionOrder, sectionOrder.indexOf(active.id as string), sectionOrder.indexOf(over.id as string)))
  }

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [justAddedCategoryId, setJustAddedCategoryId] = useState<string | null>(null)
  const justAddedCategoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [expandedOptionKey, setExpandedOptionKey] = useState<string | null>(null)
  const [justAddedOptionKey, setJustAddedOptionKey] = useState<string | null>(null)
  const justAddedOptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visibilitySources = [
    ...profileFields.map((field) => ({ id: field.id, label: field.label })),
    ...categories.map((category) => ({ id: category.id, label: category.title })),
  ]
  const getSourceLabel = (fieldId: string) => visibilitySources.find((source) => source.id === fieldId)?.label || fieldId

  const flashJustAddedCategory = (id: string) => {
    if (justAddedCategoryTimerRef.current) clearTimeout(justAddedCategoryTimerRef.current)
    setJustAddedCategoryId(id)
    justAddedCategoryTimerRef.current = setTimeout(() => setJustAddedCategoryId(null), 1600)
  }

  const flashJustAddedOption = (key: string) => {
    if (justAddedOptionTimerRef.current) clearTimeout(justAddedOptionTimerRef.current)
    setJustAddedOptionKey(key)
    justAddedOptionTimerRef.current = setTimeout(() => setJustAddedOptionKey(null), 1600)
  }

  const handleAddCategory = () => {
    const category: Category = { id: uuidv4(), title: '', description: '', type: 'checkbox', options: [], required: false }
    onCategoriesChange([...categories, category])
    onSectionOrderChange([...sectionOrder, category.id])
    setExpandedCategoryId(category.id)
    flashJustAddedCategory(category.id)
  }

  const handleUpdateCategory = (categoryId: string, patch: Partial<Category>) => {
    onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, ...patch } : c)))
  }

  const handleRemoveCategory = (categoryId: string) => {
    onCategoriesChange(categories.filter((c) => c.id !== categoryId))
    onSectionOrderChange(sectionOrder.filter((id) => id !== categoryId))
  }

  const handleToggleCategoryMailGroup = (categoryId: string, group: MailGroup, checked: boolean) => {
    if (checked) {
      const option: CategoryOption = { key: uuidv4(), label: group.name, description: '', mailGroupId: group.id }
      onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, options: [...c.options, option] } : c)))
      flashJustAddedOption(option.key)
    } else {
      onCategoriesChange(
        categories.map((c) => (c.id === categoryId ? { ...c, options: c.options.filter((o) => o.mailGroupId !== group.id) } : c))
      )
    }
  }

  const handleUpdateOption = (categoryId: string, optionKey: string, patch: Partial<CategoryOption>) => {
    onCategoriesChange(
      categories.map((c) =>
        c.id === categoryId ? { ...c, options: c.options.map((o) => (o.key === optionKey ? { ...o, ...patch } : o)) } : c
      )
    )
  }

  const handleRemoveOption = (categoryId: string, optionKey: string) => {
    onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, options: c.options.filter((o) => o.key !== optionKey) } : c)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Mailgroups</h2>
        <p className="text-sm text-muted-foreground">
          Manage the parent mailgroup everyone joins automatically, and the Mailgroup Category questions shown on the form.
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="px-6 pb-3 pt-4">
          <CardTitle className="text-base">Parent Mailgroup</CardTitle>
          <CardDescription>
            Every subscriber is automatically added to this mailgroup, regardless of which Mailgroup Category options they pick (or
            whether the form has any at all). It&apos;s never shown as a question on the form.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-3">
          <CatchAllMailGroupSection mailGroups={mailGroups} onAddMailGroup={onAddMailGroup} catchAllMailGroupId={catchAllMailGroupId} onCatchAllMailGroupIdChange={onCatchAllMailGroupIdChange} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Mailgroup Categories</h3>
          <p className="text-sm text-muted-foreground">Questions shown on the form that let subscribers pick which mailgroups to join.</p>
        </div>
        {categoryIds.length > 0 && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
            <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {categoryIds.map((id, index) => {
                  const category = categories.find((c) => c.id === id)
                  if (!category) return null
                  return (
                    <SortableCardShell
                      key={id}
                      id={id}
                      isFirst={index === 0}
                      isLast={index === categoryIds.length - 1}
                      onMoveUp={() => moveCategory(id, 'up')}
                      onMoveDown={() => moveCategory(id, 'down')}
                    >
                      <CategoryCard
                        category={category}
                        mailGroups={mailGroups}
                        onAddMailGroup={onAddMailGroup}
                        profileFields={profileFields}
                        categories={categories}
                        getSourceLabel={getSourceLabel}
                        isExpanded={expandedCategoryId === category.id}
                        isJustAdded={justAddedCategoryId === category.id}
                        onToggleExpand={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                        onUpdateCategory={(patch) => handleUpdateCategory(category.id, patch)}
                        onRemove={() => handleRemoveCategory(category.id)}
                        expandedOptionKey={expandedOptionKey}
                        justAddedOptionKey={justAddedOptionKey}
                        onToggleOptionExpand={(optionKey) => setExpandedOptionKey(expandedOptionKey === optionKey ? null : optionKey)}
                        onToggleMailGroup={(group, checked) => handleToggleCategoryMailGroup(category.id, group, checked)}
                        onUpdateOption={(optionKey, patch) => handleUpdateOption(category.id, optionKey, patch)}
                        onRemoveOption={(optionKey) => handleRemoveOption(category.id, optionKey)}
                      />
                    </SortableCardShell>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <button
          type="button"
          onClick={handleAddCategory}
          className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <Plus className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">Add Mailgroup Category</span>
        </button>
      </div>
    </div>
  )
}

interface CatchAllMailGroupSectionProps {
  mailGroups: MailGroup[]
  onAddMailGroup: (group: MailGroup) => void
  catchAllMailGroupId: string | null
  onCatchAllMailGroupIdChange: (mailGroupId: string | null) => void
}

function CatchAllMailGroupSection({ mailGroups, onAddMailGroup, catchAllMailGroupId, onCatchAllMailGroupIdChange }: CatchAllMailGroupSectionProps) {
  const currentGroup = mailGroups.find((g) => g.id === catchAllMailGroupId)
  const [isEditing, setIsEditing] = useState(!currentGroup)

  if (!isEditing && currentGroup) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{currentGroup.name}</span>
          <Badge variant="secondary">{currentGroup.folder}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Change
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onCatchAllMailGroupIdChange(null)}
          >
            Remove
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CatchAllMailGroupForm
      mailGroups={mailGroups}
      currentMailGroupId={catchAllMailGroupId}
      onAddMailGroup={onAddMailGroup}
      onSelect={(mailGroupId) => {
        onCatchAllMailGroupIdChange(mailGroupId)
        setIsEditing(false)
      }}
      onCancel={currentGroup ? () => setIsEditing(false) : undefined}
    />
  )
}

interface CatchAllMailGroupFormProps {
  mailGroups: MailGroup[]
  currentMailGroupId: string | null
  onAddMailGroup: (group: MailGroup) => void
  onSelect: (mailGroupId: string) => void
  onCancel?: () => void
}

function CatchAllMailGroupForm({ mailGroups, currentMailGroupId, onAddMailGroup, onSelect, onCancel }: CatchAllMailGroupFormProps) {
  const currentMailGroup = mailGroups.find((g) => g.id === currentMailGroupId)
  const folders = Array.from(new Set(mailGroups.map((g) => g.folder)))

  const [mode, setMode] = useState<'existing' | 'new'>(mailGroups.length > 0 ? 'existing' : 'new')
  const [selectedFolder, setSelectedFolder] = useState(currentMailGroup?.folder ?? folders[0] ?? '')
  const [selectedMailGroupId, setSelectedMailGroupId] = useState(currentMailGroupId ?? '')
  const [newFolderChoice, setNewFolderChoice] = useState(folders[0] ?? NEW_FOLDER)
  const [newFolderName, setNewFolderName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  const mailGroupsInFolder = mailGroups.filter((g) => g.folder === selectedFolder)
  const resolvedNewFolder = newFolderChoice === NEW_FOLDER ? newFolderName.trim() : newFolderChoice
  const canCreate = resolvedNewFolder.length > 0 && newGroupName.trim().length > 0

  const handleCreateMailGroup = () => {
    if (!canCreate) return
    const group: MailGroup = { id: uuidv4(), name: newGroupName.trim(), folder: resolvedNewFolder }
    onAddMailGroup(group)
    onSelect(group.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode('existing')}
          disabled={mailGroups.length === 0}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
            mode === 'existing' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Use Existing
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'new' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Create New
        </button>
      </div>

      {mode === 'existing' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="catch-all-folder">Folder<span className="ml-px text-destructive">*</span></Label>
            <Select
              value={selectedFolder}
              onValueChange={(folder) => {
                setSelectedFolder(folder)
                setSelectedMailGroupId('')
              }}
            >
              <SelectTrigger id="catch-all-folder" className="w-full">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="catch-all-mailgroup">Mailgroup<span className="ml-px text-destructive">*</span></Label>
            <Select value={selectedMailGroupId} onValueChange={setSelectedMailGroupId} disabled={!selectedFolder}>
              <SelectTrigger id="catch-all-mailgroup" className="w-full">
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

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="button" size="sm" disabled={!selectedMailGroupId} onClick={() => onSelect(selectedMailGroupId)}>
              Save
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="catch-all-new-folder">Folder *</Label>
            <Select value={newFolderChoice} onValueChange={setNewFolderChoice}>
              <SelectTrigger id="catch-all-new-folder" className="w-full">
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
              <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g., Partnerships" autoFocus />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="catch-all-new-mailgroup-name">Mailgroup Name<span className="ml-px text-destructive">*</span></Label>
            <Input
              id="catch-all-new-mailgroup-name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., All Subscribers"
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="button" size="sm" className="gap-2" disabled={!canCreate} onClick={handleCreateMailGroup}>
              <Plus className="h-4 w-4" />
              Create Mailgroup
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
