'use client'

import { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { type Category, type CategoryOption, type CustomProfileField, type ProfileFieldSection, flattenProfileFields } from '@/lib/subscription-types'
import type { ContentBlock, MailGroup } from '@/lib/subscription-centre'
import { FormFieldsSectionCard } from '@/components/form-fields-section-card'
import { CategoryCard } from '@/components/category-card'
import { ContentBlockCard } from '@/components/content-block-card'
import { SortableCardShell } from '@/components/sortable-card-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, Pencil, Plus, Sparkles, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

const NEW_FOLDER = '__new_folder__'

interface BuildEditorProps {
  profileFieldSections: ProfileFieldSection[]
  onProfileFieldSectionsChange: (sections: ProfileFieldSection[]) => void
  categories: Category[]
  onCategoriesChange: (categories: Category[]) => void
  contentBlocks: ContentBlock[]
  onContentBlocksChange: (blocks: ContentBlock[]) => void
  sectionOrder: string[]
  onSectionOrderChange: (order: string[]) => void
  mailGroups: MailGroup[]
  onAddMailGroup: (group: MailGroup) => void
  catchAllMailGroupId: string | null
  onCatchAllMailGroupIdChange: (mailGroupId: string | null) => void
  suppressErrors?: boolean
}

export function BuildEditor({
  profileFieldSections,
  onProfileFieldSectionsChange,
  categories,
  onCategoriesChange,
  contentBlocks,
  onContentBlocksChange,
  sectionOrder,
  onSectionOrderChange,
  mailGroups,
  onAddMailGroup,
  catchAllMailGroupId,
  onCatchAllMailGroupIdChange,
  suppressErrors = false,
}: BuildEditorProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [justAddedCategoryId, setJustAddedCategoryId] = useState<string | null>(null)
  const justAddedCategoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [expandedOptionKey, setExpandedOptionKey] = useState<string | null>(null)
  const [justAddedOptionKey, setJustAddedOptionKey] = useState<string | null>(null)
  const justAddedOptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sectionIds = new Set(profileFieldSections.map((s) => s.id))
  const categoryIds = new Set(categories.map((c) => c.id))
  const blockIds = new Set(contentBlocks.map((b) => b.id))

  // Everything in sectionOrder that belongs to any block type, in sequence.
  const filteredIds = sectionOrder.filter((id) => sectionIds.has(id) || categoryIds.has(id) || blockIds.has(id))

  const firstSectionId = sectionOrder.find((id) => sectionIds.has(id))

  const profileFields: CustomProfileField[] = flattenProfileFields(profileFieldSections)
  const visibilitySources = [
    ...profileFields.map((f) => ({ id: f.id, label: f.label })),
    ...categories.map((c) => ({ id: c.id, label: c.title })),
  ]
  const getSourceLabel = (fieldId: string) => visibilitySources.find((s) => s.id === fieldId)?.label ?? fieldId

  // ── Ordering ───────────────────────────────────────────────────────────────

  const moveInOrder = (id: string, direction: 'up' | 'down') => {
    const idx = filteredIds.indexOf(id)
    const newIdx = idx + (direction === 'up' ? -1 : 1)
    if (newIdx < 0 || newIdx >= filteredIds.length) return
    const targetId = filteredIds[newIdx]
    onSectionOrderChange(arrayMove(sectionOrder, sectionOrder.indexOf(id), sectionOrder.indexOf(targetId)))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onSectionOrderChange(arrayMove(sectionOrder, sectionOrder.indexOf(active.id as string), sectionOrder.indexOf(over.id as string)))
  }

  // ── Form field sections ────────────────────────────────────────────────────

  const clearVisibleWhenOnFirstSection = (sections: ProfileFieldSection[], order: string[]) => {
    const firstId = order.find((id) => sections.some((s) => s.id === id))
    return sections.map((s) => (s.id === firstId && s.visibleWhen?.length ? { ...s, visibleWhen: undefined } : s))
  }

  const handleAddSection = () => {
    const section: ProfileFieldSection = { id: uuidv4(), title: '', description: '', fields: [] }
    onProfileFieldSectionsChange([...profileFieldSections, section])
    onSectionOrderChange([...sectionOrder, section.id])
    setExpandedSectionId(section.id)
  }

  const handleUpdateSection = (sectionId: string, patch: Partial<ProfileFieldSection>) =>
    onProfileFieldSectionsChange(profileFieldSections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)))

  const handleRemoveSection = (sectionId: string) => {
    const section = profileFieldSections.find((s) => s.id === sectionId)
    if (section?.fields.some((f) => f.locked)) return
    const remaining = profileFieldSections.filter((s) => s.id !== sectionId)
    const remainingOrder = sectionOrder.filter((id) => id !== sectionId)
    onProfileFieldSectionsChange(clearVisibleWhenOnFirstSection(remaining, remainingOrder))
    onSectionOrderChange(remainingOrder)
  }

  // ── Categories ─────────────────────────────────────────────────────────────

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

  const handleUpdateCategory = (categoryId: string, patch: Partial<Category>) =>
    onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, ...patch } : c)))

  const handleRemoveCategory = (categoryId: string) => {
    onCategoriesChange(categories.filter((c) => c.id !== categoryId))
    onSectionOrderChange(sectionOrder.filter((id) => id !== categoryId))
  }

  const handleToggleCategoryMailGroup = (categoryId: string, group: MailGroup, checked: boolean, suppressMailGroupId?: string | null) => {
    if (checked) {
      const option: CategoryOption = {
        key: uuidv4(),
        label: group.name,
        description: '',
        mailGroupId: group.id,
        ...(suppressMailGroupId !== undefined ? { suppressMailGroupId } : {}),
      }
      onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, options: [...c.options, option] } : c)))
      flashJustAddedOption(option.key)
    } else {
      onCategoriesChange(
        categories.map((c) => (c.id === categoryId ? { ...c, options: c.options.filter((o) => o.mailGroupId !== group.id) } : c))
      )
    }
  }

  const handleUpdateOption = (categoryId: string, optionKey: string, patch: Partial<CategoryOption>) =>
    onCategoriesChange(
      categories.map((c) =>
        c.id === categoryId ? { ...c, options: c.options.map((o) => (o.key === optionKey ? { ...o, ...patch } : o)) } : c
      )
    )

  const handleRemoveOption = (categoryId: string, optionKey: string) =>
    onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, options: c.options.filter((o) => o.key !== optionKey) } : c)))

  // ── Content blocks ─────────────────────────────────────────────────────────

  const handleAddContentBlock = (type: ContentBlock['type']) => {
    const block: ContentBlock = { id: uuidv4(), type, html: '', imageWidth: 'contained' }
    onContentBlocksChange([...contentBlocks, block])
    onSectionOrderChange([...sectionOrder, block.id])
  }

  const handleUpdateContentBlock = (id: string, patch: Partial<ContentBlock>) =>
    onContentBlocksChange(contentBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))

  const handleRemoveContentBlock = (id: string) => {
    onContentBlocksChange(contentBlocks.filter((b) => b.id !== id))
    onSectionOrderChange(sectionOrder.filter((oid) => oid !== id))
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Build</h2>
        <p className="text-sm text-muted-foreground">
          Add and arrange every element of your form. Drag to reorder anything in any order.
        </p>
      </div>

      {/* Parent mailgroup — lives outside sectionOrder */}
      <Card className="gap-0 py-0">
        <CardHeader className="px-6 pb-3 pt-4">
          <CardTitle className="text-base">Parent Mailgroup</CardTitle>
          <CardDescription>
            Every subscriber is automatically added to this mailgroup. It&apos;s never shown as a question on the form.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-3">
          <CatchAllMailGroupSection
            mailGroups={mailGroups}
            onAddMailGroup={onAddMailGroup}
            catchAllMailGroupId={catchAllMailGroupId}
            onCatchAllMailGroupIdChange={onCatchAllMailGroupIdChange}
          />
        </CardContent>
      </Card>

      {/* Interleaved sectionOrder items */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {filteredIds.map((id, index) => {
              const isFirst = index === 0
              const isLast = index === filteredIds.length - 1
              const shell = (children: React.ReactNode) => (
                <SortableCardShell
                  key={id}
                  id={id}
                  isFirst={isFirst}
                  isLast={isLast}
                  onMoveUp={() => moveInOrder(id, 'up')}
                  onMoveDown={() => moveInOrder(id, 'down')}
                >
                  {children}
                </SortableCardShell>
              )

              const section = profileFieldSections.find((s) => s.id === id)
              if (section) {
                return shell(
                  <FormFieldsSectionCard
                    section={section}
                    allSections={profileFieldSections}
                    categories={categories}
                    isFirst={section.id === firstSectionId}
                    isExpanded={expandedSectionId === section.id}
                    onToggleExpand={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
                    onUpdateSection={(patch) => handleUpdateSection(section.id, patch)}
                    onRemoveSection={() => handleRemoveSection(section.id)}
                  />
                )
              }

              const category = categories.find((c) => c.id === id)
              if (category) {
                return shell(
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
                    suppressErrors={suppressErrors}
                    onToggleMailGroup={(group, checked, suppressId) => handleToggleCategoryMailGroup(category.id, group, checked, suppressId)}
                    onUpdateOption={(optionKey, patch) => handleUpdateOption(category.id, optionKey, patch)}
                    onRemoveOption={(optionKey) => handleRemoveOption(category.id, optionKey)}
                  />
                )
              }

              const block = contentBlocks.find((b) => b.id === id)
              if (block) {
                return shell(
                  <ContentBlockCard
                    block={block}
                    onUpdate={(patch) => handleUpdateContentBlock(block.id, patch)}
                    onRemove={() => handleRemoveContentBlock(block.id)}
                  />
                )
              }

              return null
            })}
          </div>
        </SortableContext>
      </DndContext>

      {filteredIds.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">Your form is empty</p>
          <p className="mt-1 text-xs text-muted-foreground">Add a section below to get started</p>
        </div>
      )}

      {/* Add buttons */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Add Form Fields Section', icon: Plus, onClick: handleAddSection },
          { label: 'Add Mailgroup Category', icon: Tag, onClick: handleAddCategory },
        ].map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="group flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Parent mailgroup components (moved from mailgroups-editor) ─────────────────

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
          <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => onCatchAllMailGroupIdChange(null)}>
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
      onSelect={(mailGroupId) => { onCatchAllMailGroupIdChange(mailGroupId); setIsEditing(false) }}
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
        <button type="button" onClick={() => setMode('existing')} disabled={mailGroups.length === 0}
          className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
            mode === 'existing' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
          <FolderOpen className="h-3.5 w-3.5" /> Use Existing
        </button>
        <button type="button" onClick={() => setMode('new')}
          className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'new' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
          <Sparkles className="h-3.5 w-3.5" /> Create New
        </button>
      </div>

      {mode === 'existing' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="catch-all-folder">Folder<span className="ml-px text-destructive">*</span></Label>
            <Select value={selectedFolder} onValueChange={(folder) => { setSelectedFolder(folder); setSelectedMailGroupId('') }}>
              <SelectTrigger id="catch-all-folder" className="w-full"><SelectValue placeholder="Select a folder" /></SelectTrigger>
              <SelectContent>{folders.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="catch-all-mailgroup">Mailgroup<span className="ml-px text-destructive">*</span></Label>
            <Select value={selectedMailGroupId} onValueChange={setSelectedMailGroupId} disabled={!selectedFolder}>
              <SelectTrigger id="catch-all-mailgroup" className="w-full"><SelectValue placeholder={selectedFolder ? 'Select a mailgroup' : 'Choose a folder first'} /></SelectTrigger>
              <SelectContent>{mailGroupsInFolder.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            {onCancel && <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>}
            <Button type="button" size="sm" disabled={!selectedMailGroupId} onClick={() => onSelect(selectedMailGroupId)}>Save</Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="catch-all-new-folder">Folder *</Label>
            <Select value={newFolderChoice} onValueChange={setNewFolderChoice}>
              <SelectTrigger id="catch-all-new-folder" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {folders.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                <SelectItem value={NEW_FOLDER}>+ New folder</SelectItem>
              </SelectContent>
            </Select>
            {newFolderChoice === NEW_FOLDER && (
              <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g., Partnerships" autoFocus />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="catch-all-new-mailgroup-name">Mailgroup Name<span className="ml-px text-destructive">*</span></Label>
            <Input id="catch-all-new-mailgroup-name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="e.g., All Subscribers" />
          </div>
          <div className="flex justify-end gap-2">
            {onCancel && <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>}
            <Button type="button" size="sm" className="gap-2" disabled={!canCreate} onClick={handleCreateMailGroup}>
              <Plus className="h-4 w-4" /> Create Mailgroup
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
