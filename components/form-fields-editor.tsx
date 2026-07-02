'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type Category, type ProfileFieldSection } from '@/lib/subscription-types'
import { FormFieldsSectionCard } from '@/components/form-fields-section-card'
import { Plus } from 'lucide-react'

interface FormFieldsEditorProps {
  profileFieldSections: ProfileFieldSection[]
  onProfileFieldSectionsChange: (sections: ProfileFieldSection[]) => void
  categories: Category[]
  sectionOrder: string[]
  onSectionOrderChange: (order: string[]) => void
}

// Sections-only CRUD -- cross-type structural ordering (sections + mailgroup categories +
// submit button, interleaved) lives exclusively on the Preview tab via sectionOrder.
export function FormFieldsEditor({
  profileFieldSections,
  onProfileFieldSectionsChange,
  categories,
  sectionOrder,
  onSectionOrderChange,
}: FormFieldsEditorProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)

  const firstSectionId = sectionOrder.find((id) => profileFieldSections.some((s) => s.id === id))

  // The first Form Fields section is never conditional, so if removing a section changes
  // who's first, drop any leftover rule on the section that just became first.
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

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Form Fields</h2>
        <p className="text-sm text-muted-foreground">Add and edit the questions subscribers fill in. Reorder them on the Preview tab.</p>
      </div>

      <div className="space-y-4">
        {profileFieldSections.map((section) => (
          <FormFieldsSectionCard
            key={section.id}
            section={section}
            allSections={profileFieldSections}
            categories={categories}
            isFirst={section.id === firstSectionId}
            isExpanded={expandedSectionId === section.id}
            onToggleExpand={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
            onUpdateSection={(patch) => handleUpdateSection(section.id, patch)}
            onRemoveSection={() => handleRemoveSection(section.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSection}
        className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
      >
        <Plus className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">Add Form Fields Section</span>
      </button>
    </div>
  )
}
