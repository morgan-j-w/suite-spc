'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteCentre, getCentre, saveCentre } from '@/lib/subscription-centre-store'
import { type Category, type ProfileFieldSection } from '@/lib/subscription-types'
import type { MailGroup, StatusPages, SubmitButtonAlignment, SubscriptionCentre, UnsubscribeFeedbackForm } from '@/lib/subscription-centre'
import type { ColorTheme } from '@/lib/brand-config'
import { BuildSectionsEditor } from '@/components/build-sections-editor'
import { ThemePresetPicker } from '@/components/theme-preset-picker'
import { StylePreviewList } from '@/components/style-preview-list'
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
import { ArrowLeft, Eye, FileText, LayoutGrid, Loader2, Palette, Trash2 } from 'lucide-react'

interface BuilderPageProps {
  params: Promise<{ id: string }>
}

type BuilderSection = 'build' | 'theme' | 'status'

const SECTIONS: { id: BuilderSection; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'build', label: 'Build', icon: LayoutGrid },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'status', label: 'Status Pages', icon: FileText },
]

export default function BuilderEditorPage({ params }: BuilderPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [centre, setCentre] = useState<SubscriptionCentre | null | undefined>(undefined)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<BuilderSection>('build')
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
          <Link href="/builder">Back</Link>
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

  const handleSubmitButtonTextChange = (submitButtonText: string) => {
    setCentre((prev) => (prev ? { ...prev, submitButtonText } : prev))
  }

  const handleSubmitButtonStyleIndexChange = (submitButtonStyleIndex: number) => {
    setCentre((prev) => (prev ? { ...prev, submitButtonStyleIndex } : prev))
  }

  const handleSubmitButtonAlignmentChange = (submitButtonAlignment: SubmitButtonAlignment) => {
    setCentre((prev) => (prev ? { ...prev, submitButtonAlignment } : prev))
  }

  const isDirty = savedSnapshot !== null && JSON.stringify(centre) !== savedSnapshot

  const handleSave = () => {
    saveCentre(centre)
    setSavedSnapshot(JSON.stringify(centre))
    toast.success('Saved')
  }

  const handlePreview = () => {
    saveCentre(centre)
    setSavedSnapshot(JSON.stringify(centre))
    window.open(`/builder/${centre.id}/preview`, '_blank', 'noopener,noreferrer')
  }

  const handleDelete = () => {
    deleteCentre(centre.id)
    setIsDeleteDialogOpen(false)
    router.push('/builder')
  }

  return (
    <div>
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <div className="shrink-0 md:w-44">
              <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2">
                <Link href="/builder">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
              <Input
                value={centre.name}
                onChange={(e) => setCentre((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                className="h-9 max-w-md flex-1 text-base font-semibold"
              />
              <div className="flex items-center gap-2">
              {isDirty && <span className="text-sm text-amber-600">Unsaved changes</span>}
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePreview}>
                <Eye className="h-4 w-4" />
                Preview
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
              <Button size="sm" onClick={handleSave}>
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
            <nav className="flex gap-1 md:fixed md:top-[85px] md:w-44 md:flex-col md:left-[max(1rem,calc(50%-31rem))]">
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
            {activeSection === 'build' && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold">Build</h2>
                  <p className="text-sm text-muted-foreground">
                    Form Fields sections and Mail Group Categories — drag to reorder them however you like.
                  </p>
                </div>
                <BuildSectionsEditor
                  profileFieldSections={centre.profileFieldSections}
                  onProfileFieldSectionsChange={handleProfileFieldSectionsChange}
                  categories={centre.categories}
                  onCategoriesChange={handleCategoriesChange}
                  sectionOrder={centre.sectionOrder}
                  onSectionOrderChange={handleSectionOrderChange}
                  mailGroups={centre.mailGroups}
                  onAddMailGroup={handleAddMailGroup}
                  themePresetId={centre.themePresetId}
                  submitButtonText={centre.submitButtonText}
                  submitButtonStyleIndex={centre.submitButtonStyleIndex}
                  submitButtonAlignment={centre.submitButtonAlignment}
                  onSubmitButtonTextChange={handleSubmitButtonTextChange}
                  onSubmitButtonStyleIndexChange={handleSubmitButtonStyleIndexChange}
                  onSubmitButtonAlignmentChange={handleSubmitButtonAlignmentChange}
                />
              </div>
            )}

            {activeSection === 'theme' && (
              <div className="space-y-6">
                <ThemePresetPicker value={centre.themePresetId} onChange={handleThemeChange} />
                <StylePreviewList theme={centre.themePresetId} />
              </div>
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
