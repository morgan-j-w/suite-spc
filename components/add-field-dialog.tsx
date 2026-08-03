'use client'

import { useState } from 'react'
import type { CustomProfileField, ProfileFieldType, StandardFieldDef } from '@/lib/subscription-types'
import { fieldTypeBadge, getFieldShape, isChoiceFieldType, isDisplayFieldType } from '@/lib/subscription-types'
import { getFieldCatalog } from '@/lib/field-catalog'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FIELD_TYPE_GROUPS, FIELD_TYPE_ICONS } from '@/components/profile-field-editor'
import { cn } from '@/lib/utils'

interface AddFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableStandardFields: StandardFieldDef[]
  onPickStandardField: (def: StandardFieldDef) => void
  // Heading/paragraph aren't data fields -- no catalog entry to pick, created blank.
  onPickDisplayType: (type: ProfileFieldType) => void
  // Every other type: the widget the user picked, plus the catalog field supplying its
  // label/options/min/max/step.
  onPickCatalogField: (catalogField: CustomProfileField, widgetType: ProfileFieldType) => void
}

// A catalog field is offered for a given widget type when its backend shape matches AND it
// has options iff the widget needs them -- e.g. a catalog field with options (like "Industry")
// only shows up under option-based widgets (Dropdown, Radio, ...), never under plain Text
// Input, even though both happen to be "Text"-shaped.
function catalogFieldMatchesType(catalogField: CustomProfileField, targetType: ProfileFieldType): boolean {
  const targetShape = getFieldShape(targetType)
  const catalogShape = getFieldShape(catalogField.type)
  if (!targetShape || !catalogShape || targetShape !== catalogShape) return false
  return isChoiceFieldType(targetType) === !!catalogField.options?.length
}

// One modal: standard fields, then every other question type. Custom fields can no longer be
// invented from scratch -- picking a type narrows down to the fixed catalog of fields that
// type can render, so what gets added is always real, existing data, never a fresh field a
// client could shape however they like. Only heading/paragraph (no backend data) still create
// blank, since there's nothing to protect there.
export function AddFieldDialog({
  open,
  onOpenChange,
  availableStandardFields,
  onPickStandardField,
  onPickDisplayType,
  onPickCatalogField,
}: AddFieldDialogProps) {
  const [selectedType, setSelectedType] = useState<ProfileFieldType | null>(null)
  const catalog = getFieldCatalog()
  const matches = selectedType ? catalog.filter((f) => catalogFieldMatchesType(f, selectedType)) : []

  const close = (v: boolean) => {
    onOpenChange(v)
    if (!v) setSelectedType(null)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Add Field</DialogTitle>
          <DialogDescription>Pick a standard field, or choose a question type to select from existing fields.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
          {availableStandardFields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Standard Fields</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableStandardFields.map((def) => {
                  const Icon = FIELD_TYPE_ICONS[def.type]
                  return (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => onPickStandardField(def)}
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
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question Type</p>
            {FIELD_TYPE_GROUPS.map((group) => (
              <div key={group.groupLabel} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{group.groupLabel}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.options.map((opt) => {
                    const isSelected = selectedType === opt.type
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => (isDisplayFieldType(opt.type) ? onPickDisplayType(opt.type) : setSelectedType(opt.type))}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-muted/40',
                          isSelected && 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        )}
                      >
                        <opt.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedType && (
            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Existing {fieldTypeBadge[selectedType].label.toLowerCase()} fields
                </p>
                <button type="button" onClick={() => setSelectedType(null)} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              </div>
              {matches.length === 0 ? (
                <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                  No existing fields of this type yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {matches.map((catalogField) => (
                    <button
                      key={catalogField.id}
                      type="button"
                      onClick={() => onPickCatalogField(catalogField, selectedType)}
                      className="rounded-lg border bg-background p-3 text-left transition-colors hover:border-primary hover:bg-muted/40"
                    >
                      <p className="text-sm font-medium">{catalogField.label}</p>
                      {catalogField.options?.length ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {catalogField.options.map((o) => o.label).join(', ')}
                        </p>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => close(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
