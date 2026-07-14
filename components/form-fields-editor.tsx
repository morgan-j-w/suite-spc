'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { type Category, type ProfileFieldSection } from '@/lib/subscription-types'
import type { ContentBlock } from '@/lib/subscription-centre'
import { FormFieldsSectionCard } from '@/components/form-fields-section-card'
import { ContentBlockCard } from '@/components/content-block-card'
import { SortableCardShell } from '@/components/sortable-card-shell'
import { Image, Plus, Type } from 'lucide-react'

interface FormFieldsEditorProps {
  profileFieldSections: ProfileFieldSection[]
  onProfileFieldSectionsChange: (sections: ProfileFieldSection[]) => void
  categories: Category[]
  sectionOrder: string[]
  onSectionOrderChange: (order: string[]) => void
  contentBlocks: ContentBlock[]
  onContentBlocksChange: (blocks: ContentBlock[]) => void
}

export function FormFieldsEditor({
  profileFieldSections,
  onProfileFieldSectionsChange,
  categories,
  sectionOrder,
  onSectionOrderChange,
  contentBlocks,
  onContentBlocksChange,
}: FormFieldsEditorProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)

  const sectionIds = new Set(profileFieldSections.map((s) => s.id))
  const blockIds = new Set(contentBlocks.map((b) => b.id))

  // Items that belong to this tab, in sectionOrder sequence.
  const filteredIds = sectionOrder.filter((id) => sectionIds.has(id) || blockIds.has(id))

  const firstSectionId = sectionOrder.find((id) => sectionIds.has(id))

  const clearVisibleWhenOnFirstSection = (sections: ProfileFieldSection[], order: string[]) => {
    const firstId = order.find((id) => sections.some((s) => s.id === id))
    return sections.map((s) => (s.id === firstId && s.visibleWhen?.length ? { ...s, visibleWhen: undefined } : s))
  }

  // Move within filtered list only — up/down doesn't jump over categories invisible in this tab.
  const moveInOrder = (id: string, direction: 'up' | 'down') => {
    const filteredIdx = filteredIds.indexOf(id)
    const newFilteredIdx = filteredIdx + (direction === 'up' ? -1 : 1)
    if (newFilteredIdx < 0 || newFilteredIdx >= filteredIds.length) return
    const targetId = filteredIds[newFilteredIdx]
    onSectionOrderChange(arrayMove(sectionOrder, sectionOrder.indexOf(id), sectionOrder.indexOf(targetId)))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onSectionOrderChange(arrayMove(sectionOrder, sectionOrder.indexOf(active.id as string), sectionOrder.indexOf(over.id as string)))
  }

  const handleAddSection = () => {
    const section: ProfileFieldSection = { id: uuidv4(), title: '', description: '', fields: [] }
    onProfileFieldSectionsChange([...profileFieldSections, section])
    onSectionOrderChange([...sectionOrder, section.id])
    setExpandedSectionId(section.id)
  }

  const handleUpdateSection = (sectionId: string, patch: Partial<ProfileFieldSection>) => {
    onProfileFieldSectionsChange(profileFieldSections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)))
  }

  const handleRemoveSection = (sectionId: string) => {
    const section = profileFieldSections.find((s) => s.id === sectionId)
    if (section?.fields.some((f) => f.locked)) return
    const remainingSections = profileFieldSections.filter((s) => s.id !== sectionId)
    const remainingOrder = sectionOrder.filter((id) => id !== sectionId)
    onProfileFieldSectionsChange(clearVisibleWhenOnFirstSection(remainingSections, remainingOrder))
    onSectionOrderChange(remainingOrder)
  }

  const handleAddContentBlock = (type: ContentBlock['type']) => {
    const block: ContentBlock = { id: uuidv4(), type, html: '', imageWidth: 'contained' }
    onContentBlocksChange([...contentBlocks, block])
    onSectionOrderChange([...sectionOrder, block.id])
  }

  const handleUpdateContentBlock = (id: string, patch: Partial<ContentBlock>) => {
    onContentBlocksChange(contentBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  const handleRemoveContentBlock = (id: string) => {
    onContentBlocksChange(contentBlocks.filter((b) => b.id !== id))
    onSectionOrderChange(sectionOrder.filter((oid) => oid !== id))
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Form Fields</h2>
        <p className="text-sm text-muted-foreground">Add and edit the questions subscribers fill in.</p>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {filteredIds.map((id, index) => {
              const section = profileFieldSections.find((s) => s.id === id)
              if (section) {
                return (
                  <SortableCardShell
                    key={id}
                    id={id}
                    isFirst={index === 0}
                    isLast={index === filteredIds.length - 1}
                    onMoveUp={() => moveInOrder(id, 'up')}
                    onMoveDown={() => moveInOrder(id, 'down')}
                  >
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
                  </SortableCardShell>
                )
              }

              const block = contentBlocks.find((b) => b.id === id)
              if (block) {
                return (
                  <SortableCardShell
                    key={id}
                    id={id}
                    isFirst={index === 0}
                    isLast={index === filteredIds.length - 1}
                    onMoveUp={() => moveInOrder(id, 'up')}
                    onMoveDown={() => moveInOrder(id, 'down')}
                  >
                    <ContentBlockCard
                      block={block}
                      onUpdate={(patch) => handleUpdateContentBlock(block.id, patch)}
                      onRemove={() => handleRemoveContentBlock(block.id)}
                    />
                  </SortableCardShell>
                )
              }

              return null
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddSection}
          className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <Plus className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">Add Section</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddContentBlock('text')}
          className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <Type className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">Add Text</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddContentBlock('image')}
          className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <Image className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">Add Image</span>
        </button>
      </div>
    </div>
  )
}
