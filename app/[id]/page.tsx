'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteCentre, getCentre, saveCentre } from '@/lib/subscription-centre-store'
import { type Category, type ProfileFieldSection, flattenProfileFields } from '@/lib/subscription-types'
import type { MailGroup, StatusPages, SubmitButtonAlignment, SubscriptionCentre, UnsubscribeFeedbackForm } from '@/lib/subscription-centre'
import type { ColorTheme } from '@/lib/brand-config'
import { FormFieldsEditor } from '@/components/form-fields-editor'
import { MailgroupsEditor } from '@/components/mailgroups-editor'
import { PreviewEditor } from '@/components/preview-editor'
import { StatusPagesEditor } from '@/components/status-pages-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ArrowLeft, Download, FileText, LayoutTemplate, Loader2, Mail, Palette, Trash2 } from 'lucide-react'

interface BuilderPageProps {
  params: Promise<{ id: string }>
}

type BuilderSection = 'fields' | 'mailgroups' | 'preview' | 'status'

const SECTIONS: { id: BuilderSection; label: string; icon: typeof LayoutTemplate }[] = [
  { id: 'fields', label: 'Form Fields', icon: LayoutTemplate },
  { id: 'mailgroups', label: 'Mailgroups', icon: Mail },
  { id: 'status', label: 'Status Pages', icon: FileText },
  { id: 'preview', label: 'Preview', icon: Palette },
]

export default function BuilderEditorPage({ params }: BuilderPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [centre, setCentre] = useState<SubscriptionCentre | null | undefined>(undefined)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<BuilderSection>('fields')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const loaded = getCentre(id)
    setCentre(loaded)
    setSavedSnapshot(loaded ? JSON.stringify(loaded) : null)
  }, [id])

  if (centre === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (centre === null) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-foreground">This subscription centre could not be found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Back</Link>
        </Button>
      </div>
    )
  }

  const handleProfileFieldSectionsChange = (profileFieldSections: ProfileFieldSection[]) => {
    setCentre((prev) => (prev ? { ...prev, profileFieldSections } : prev))
  }

  const handleCategoriesChange = (categories: Category[]) => {
    setCentre((prev) => (prev ? { ...prev, categories } : prev))
  }

  const handleSectionOrderChange = (sectionOrder: string[]) => {
    setCentre((prev) => (prev ? { ...prev, sectionOrder } : prev))
  }

  const handleThemeChange = (themePresetId: ColorTheme) => {
    setCentre((prev) => (prev ? { ...prev, themePresetId } : prev))
  }

  const handleStatusPagesChange = (statusPages: StatusPages) => {
    setCentre((prev) => (prev ? { ...prev, statusPages } : prev))
  }

  const handleUnsubscribeFeedbackChange = (unsubscribeFeedback: UnsubscribeFeedbackForm) => {
    setCentre((prev) => (prev ? { ...prev, unsubscribeFeedback } : prev))
  }

  const handleAddMailGroup = (group: MailGroup) => {
    setCentre((prev) => (prev ? { ...prev, mailGroups: [...prev.mailGroups, group] } : prev))
  }

  const handleCatchAllMailGroupIdChange = (catchAllMailGroupId: string | null) => {
    setCentre((prev) => (prev ? { ...prev, catchAllMailGroupId } : prev))
  }

  const handleSubmitButtonTextChange = (submitButtonText: string) => {
    setCentre((prev) => (prev ? { ...prev, submitButtonText } : prev))
  }

  const handleSubmitButtonStyleIndexChange = (submitButtonStyleIndex: number) => {
    setCentre((prev) => (prev ? { ...prev, submitButtonStyleIndex } : prev))
  }

  const handleSubmitButtonAlignmentChange = (submitButtonAlignment: SubmitButtonAlignment) => {
    setCentre((prev) => (prev ? { ...prev, submitButtonAlignment } : prev))
  }

  const handleFormLayoutChange = (formLayout: 'stacked' | 'inline') => {
    setCentre((prev) => (prev ? { ...prev, formLayout } : prev))
  }

  const handleFormLabelWidthChange = (formLabelWidth: number) => {
    setCentre((prev) => (prev ? { ...prev, formLabelWidth } : prev))
  }

  const isDirty = savedSnapshot !== null && JSON.stringify(centre) !== savedSnapshot

  // A centre needs some way to actually put a subscriber into a mailgroup -- either a
  // mailgroup card option on the form, or the hidden parent mailgroup from the Mailgroups tab.
  const hasMailGroupCard = centre.categories.some((category) => category.options.some((option) => option.mailGroupId))
  const hasCatchAllMailGroup = Boolean(centre.catchAllMailGroupId)
  const canSave = hasMailGroupCard || hasCatchAllMailGroup

  const handleSave = () => {
    if (!canSave) {
      toast.error('Add a mailgroup card to the form, or choose a parent mailgroup in Mailgroups, before saving.')
      return
    }
    saveCentre(centre)
    setSavedSnapshot(JSON.stringify(centre))
    toast.success('Saved')
  }

  const handleDelete = () => {
    deleteCentre(centre.id)
    setIsDeleteDialogOpen(false)
    router.push('/')
  }

  // A JSON spec of everything shown on the Preview tab -- fields, mailgroup categories,
  // theme, and submit button -- for a dev team to implement the form elsewhere. Deliberately
  // excludes Status Pages copy and builder-only metadata (id, createdAt, updatedAt), since
  // those aren't part of "the form" itself.
  const handleExportSpec = () => {
    const spec = {
      name: centre.name,
      theme: centre.themePresetId,
      sectionOrder: centre.sectionOrder,
      formFieldSections: centre.profileFieldSections,
      mailgroupCategories: centre.categories,
      mailGroups: centre.mailGroups,
      catchAllMailGroupId: centre.catchAllMailGroupId,
      submitButton: {
        text: centre.submitButtonText,
        styleIndex: centre.submitButtonStyleIndex,
        alignment: centre.submitButtonAlignment,
      },
    }
    const fileSlug = centre.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'subscription-centre'
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileSlug}-form-spec.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <div className="shrink-0 md:w-44">
              <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
              <Input
                value={centre.name}
                onChange={(e) => setCentre((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                className="h-9 w-full bg-white text-base font-semibold md:max-w-md md:flex-1"
              />
              <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExportSpec}>
                <Download className="h-4 w-4" />
                Export for Dev
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete this subscription centre?</DialogTitle>
                    <DialogDescription>
                      This permanently deletes &quot;{centre.name}&quot; and cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button size="sm" onClick={handleSave} disabled={!isDirty}>
                Save
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8 pt-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="shrink-0 md:w-44">
            <nav className="flex flex-col gap-1 md:fixed md:top-[85px] md:w-44 md:left-[max(1rem,calc(50%-31rem))]">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="min-w-0 flex-1">
            {activeSection === 'fields' && (
              <FormFieldsEditor
                profileFieldSections={centre.profileFieldSections}
                onProfileFieldSectionsChange={handleProfileFieldSectionsChange}
                categories={centre.categories}
                sectionOrder={centre.sectionOrder}
                onSectionOrderChange={handleSectionOrderChange}
              />
            )}

            {activeSection === 'mailgroups' && (
              <MailgroupsEditor
                mailGroups={centre.mailGroups}
                onAddMailGroup={handleAddMailGroup}
                catchAllMailGroupId={centre.catchAllMailGroupId}
                onCatchAllMailGroupIdChange={handleCatchAllMailGroupIdChange}
                categories={centre.categories}
                onCategoriesChange={handleCategoriesChange}
                profileFields={flattenProfileFields(centre.profileFieldSections)}
                sectionOrder={centre.sectionOrder}
                onSectionOrderChange={handleSectionOrderChange}
              />
            )}

            {activeSection === 'preview' && (
              <PreviewEditor
                centre={centre}
                onThemeChange={handleThemeChange}
                onSectionOrderChange={handleSectionOrderChange}
                onProfileFieldSectionsChange={handleProfileFieldSectionsChange}
                onCategoriesChange={handleCategoriesChange}
                submitButtonText={centre.submitButtonText}
                submitButtonStyleIndex={centre.submitButtonStyleIndex}
                submitButtonAlignment={centre.submitButtonAlignment}
                onSubmitButtonTextChange={handleSubmitButtonTextChange}
                onSubmitButtonStyleIndexChange={handleSubmitButtonStyleIndexChange}
                onSubmitButtonAlignmentChange={handleSubmitButtonAlignmentChange}
                formLayout={centre.formLayout}
                formLabelWidth={centre.formLabelWidth}
                onFormLayoutChange={handleFormLayoutChange}
                onFormLabelWidthChange={handleFormLabelWidthChange}
              />
            )}

            {activeSection === 'status' && (
              <StatusPagesEditor
                statusPages={centre.statusPages}
                onStatusPagesChange={handleStatusPagesChange}
                unsubscribeFeedback={centre.unsubscribeFeedback}
                onUnsubscribeFeedbackChange={handleUnsubscribeFeedbackChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
