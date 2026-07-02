'use client'

import type { ProfileFieldType, StandardFieldDef } from '@/lib/subscription-types'
import { fieldTypeBadge } from '@/lib/subscription-types'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FIELD_TYPE_GROUPS, FIELD_TYPE_ICONS } from '@/components/profile-field-editor'

interface AddFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableStandardFields: StandardFieldDef[]
  onPickStandardField: (def: StandardFieldDef) => void
  onPickFieldType: (type: ProfileFieldType) => void
}

// One modal so the user can compare standard fields against brand new field types side by
// side, instead of separate buttons each opening their own dialog. Reusing an existing field
// from the library happens afterwards, via the autocomplete on the new field's Label input
// (filtered to fields of the same simplified type) rather than browsing a list here. Picking
// a field adds it and closes the dialog immediately; "Done"/the close button just let the
// user back out without picking anything.
export function AddFieldDialog({
  open,
  onOpenChange,
  availableStandardFields,
  onPickStandardField,
  onPickFieldType,
}: AddFieldDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Add Field</DialogTitle>
          <DialogDescription>Pick a standard field, or start a new field type.</DialogDescription>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New Field Type</p>
            {FIELD_TYPE_GROUPS.map((group) => (
              <div key={group.groupLabel} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{group.groupLabel}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.options.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => onPickFieldType(opt.type)}
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
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
