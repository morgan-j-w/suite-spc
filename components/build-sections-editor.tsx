'use client'

import { useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { type Category, type CategoryOption, type ProfileFieldSection, flattenProfileFields } from '@/lib/subscription-types'
import type { MailGroup, SubmitButtonAlignment } from '@/lib/subscription-centre'
import type { ColorTheme } from '@/lib/brand-config'
import { SortableCategoryCard } from '@/components/sortable-category-card'
import { FormFieldsSectionCard } from '@/components/form-fields-section-card'
import { SubmitButtonCard } from '@/components/submit-button-card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, LayoutTemplate, Mail, Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface BuildSectionsEditorProps {
  profileFieldSections: ProfileFieldSection[]
  onProfileFieldSectionsChange: (sections: ProfileFieldSection[]) => void
  categories: Category[]
  onCategoriesChange: (categories: Category[]) => void
  sectionOrder: string[]
  onSectionOrderChange: (order: string[]) => void
  mailGroups: MailGroup[]
  onAddMailGroup: (group: MailGroup) => void
  themePresetId: ColorTheme
  submitButtonText: string
  submitButtonStyleIndex: number
  submitButtonAlignment: SubmitButtonAlignment
  onSubmitButtonTextChange: (text: string) => void
  onSubmitButtonStyleIndexChange: (index: number) => void
  onSubmitButtonAlignmentChange: (alignment: SubmitButtonAlignment) => void
}

export function BuildSectionsEditor({
  profileFieldSections,
  onProfileFieldSectionsChange,
  categories,
  onCategoriesChange,
  sectionOrder,
  onSectionOrderChange,
  mailGroups,
  onAddMailGroup,
  themePresetId,
  submitButtonText,
  submitButtonStyleIndex,
  submitButtonAlignment,
  onSubmitButtonTextChange,
  onSubmitButtonStyleIndexChange,
  onSubmitButtonAlignmentChange,
}: BuildSectionsEditorProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [justAddedCategoryId, setJustAddedCategoryId] = useState<string | null>(null)
  const justAddedCategoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)

  const [expandedOptionKey, setExpandedOptionKey] = useState<string | null>(null)
  const [justAddedOptionKey, setJustAddedOptionKey] = useState<string | null>(null)
  const justAddedOptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const profileFields = flattenProfileFields(profileFieldSections)

  const visibilitySources = [
    ...profileFields.map((field) => ({ id: field.id, label: field.label })),
    ...categories.map((category) => ({ id: category.id, label: category.title })),
  ]

  const getSourceLabel = (fieldId: string) => visibilitySources.find((source) => source.id === fieldId)?.label || fieldId

  const firstSectionId = sectionOrder.find((id) => profileFieldSections.some((s) => s.id === id))

  // The first Form Fields section is never conditional, so if reordering or deleting changes
  // who's first, drop any leftover rule on the section that just became first.
  const clearVisibleWhenOnFirstSection = (sections: ProfileFieldSection[], order: string[]) => {
    const firstId = order.find((id) => sections.some((s) => s.id === id))
    return sections.map((s) => (s.id === firstId && s.visibleWhen?.length ? { ...s, visibleWhen: undefined } : s))
  }

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
    const category: Category = {
      id: uuidv4(),
      title: '',
      description: '',
      type: 'checkbox',
      options: [],
      required: false,
    }
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

  const handleCardStyleChange = (categoryId: string, cardStyleIndex: number) => {
    onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, cardStyleIndex } : c)))
  }

  const handleAddOption = (categoryId: string) => {
    const option: CategoryOption = { key: uuidv4(), label: '', description: '', mailGroupId: undefined }
    onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, options: [...c.options, option] } : c)))
    setExpandedOptionKey(option.key)
    flashJustAddedOption(option.key)
  }

  const handleAddExistingOptions = (categoryId: string, mailGroupIds: string[]) => {
    const toAdd = mailGroupIds
      .map((id) => mailGroups.find((g) => g.id === id))
      .filter((g): g is MailGroup => !!g)
      .map((group) => ({ key: uuidv4(), label: group.name, description: '', mailGroupId: group.id }))
    if (toAdd.length === 0) return
    onCategoriesChange(categories.map((c) => (c.id === categoryId ? { ...c, options: [...c.options, ...toAdd] } : c)))
    flashJustAddedOption(toAdd[toAdd.length - 1].key)
  }

  const handleUpdateOption = (categoryId: string, optionKey: string, patch: Partial<CategoryOption>) => {
    onCategoriesChange(
      categories.map((c) =>
        c.id === categoryId
          ? { ...c, options: c.options.map((o) => (o.key === optionKey ? { ...o, ...patch } : o)) }
          : c
      )
    )
  }

  const handleRemoveOption = (categoryId: string, optionKey: string) => {
    onCategoriesChange(
      categories.map((c) => (c.id === categoryId ? { ...c, options: c.options.filter((o) => o.key !== optionKey) } : c))
    )
  }

  const handleAddSection = () => {
    const section: ProfileFieldSection = { id: uuidv4(), title: 'Form Fields', description: '', fields: [] }
    onProfileFieldSectionsChange([...profileFieldSections, section])
    onSectionOrderChange([...sectionOrder, section.id])
  }

  const handleUpdateSection = (sectionId: string, patch: Partial<ProfileFieldSection>) => {
    onProfileFieldSectionsChange(profileFieldSections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)))
  }

  const handleRemoveSection = (sectionId: string) => {
    const remainingSections = profileFieldSections.filter((s) => s.id !== sectionId)
    const remainingOrder = sectionOrder.filter((id) => id !== sectionId)
    onProfileFieldSectionsChange(clearVisibleWhenOnFirstSection(remainingSections, remainingOrder))
    onSectionOrderChange(remainingOrder)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sectionOrder.indexOf(active.id as string)
    const newIndex = sectionOrder.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex)
    onSectionOrderChange(newOrder)
    onProfileFieldSectionsChange(clearVisibleWhenOnFirstSection(profileFieldSections, newOrder))
  }

  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Plus className="h-4 w-4" />
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              Add Block
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-72">
          <DropdownMenuItem onClick={handleAddSection} className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Form Fields Section
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddCategory} className="gap-2">
            <Mail className="h-4 w-4" />
            Mail Group Category
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sectionOrder.map((id) => {
              const section = profileFieldSections.find((s) => s.id === id)
              if (section) {
                return (
                  <FormFieldsSectionCard
                    key={id}
                    section={section}
                    allSections={profileFieldSections}
                    categories={categories}
                    theme={themePresetId}
                    isFirst={id === firstSectionId}
                    isExpanded={expandedSectionId === section.id}
                    onToggleExpand={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
                    onUpdateSection={(patch) => handleUpdateSection(id, patch)}
                    onRemoveSection={() => handleRemoveSection(id)}
                  />
                )
              }

              const category = categories.find((c) => c.id === id)
              if (!category) return null

              return (
                <SortableCategoryCard
                  key={id}
                  category={category}
                  mailGroups={mailGroups}
                  onAddMailGroup={onAddMailGroup}
                  profileFields={profileFields}
                  categories={categories}
                  getSourceLabel={getSourceLabel}
                  theme={themePresetId}
                  isExpanded={expandedCategoryId === category.id}
                  isJustAdded={justAddedCategoryId === category.id}
                  onToggleExpand={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                  onUpdateCategory={(patch) => handleUpdateCategory(category.id, patch)}
                  onRemove={() => handleRemoveCategory(category.id)}
                  onCardStyleChange={(styleIndex) => handleCardStyleChange(category.id, styleIndex)}
                  expandedOptionKey={expandedOptionKey}
                  justAddedOptionKey={justAddedOptionKey}
                  onToggleOptionExpand={(optionKey) => setExpandedOptionKey(expandedOptionKey === optionKey ? null : optionKey)}
                  onAddOption={() => handleAddOption(category.id)}
                  onAddExistingOptions={(mailGroupIds) => handleAddExistingOptions(category.id, mailGroupIds)}
                  onUpdateOption={(optionKey, patch) => handleUpdateOption(category.id, optionKey, patch)}
                  onRemoveOption={(optionKey) => handleRemoveOption(category.id, optionKey)}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      <SubmitButtonCard
        theme={themePresetId}
        text={submitButtonText}
        styleIndex={submitButtonStyleIndex}
        alignment={submitButtonAlignment}
        onTextChange={onSubmitButtonTextChange}
        onStyleIndexChange={onSubmitButtonStyleIndexChange}
        onAlignmentChange={onSubmitButtonAlignmentChange}
      />
    </div>
  )
}
