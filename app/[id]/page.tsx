'use client'

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { clearDraft, deleteCentre, getCentre, getDraft, saveCentre, saveDraft } from '@/lib/subscription-centre-store'
import { type Category, type FieldVisibilityRule, type ProfileFieldSection, flattenProfileFields } from '@/lib/subscription-types'
import { defaultMailGroups, type MailGroup, type StatusPages, type SubmitButtonAlignment, type SubscriptionCentre, type UnsubscribeFeedbackForm } from '@/lib/subscription-centre'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ArrowLeft, Download, Eraser, FileText, FlaskConical, LayoutTemplate, Loader2, Mail, Palette, Trash2 } from 'lucide-react'
import { FormLivePreview } from '@/components/form-live-preview'

interface BuilderPageProps {
  params: Promise<{ id: string }>
}

type BuilderSection = 'fields' | 'mailgroups' | 'preview' | 'status'

const SECTIONS: { id: BuilderSection; label: string; icon: typeof LayoutTemplate }[] = [
  { id: 'fields', label: 'Form Fields', icon: LayoutTemplate },
  { id: 'mailgroups', label: 'Mailgroups', icon: Mail },
  { id: 'status', label: 'Status Pages', icon: FileText },
  { id: 'preview', label: 'Style', icon: Palette },
]

export default function BuilderEditorPage({ params }: BuilderPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [centre, setCentre] = useState<SubscriptionCentre | null | undefined>(undefined)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<BuilderSection>('fields')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const showPreviewPanel = activeSection === 'fields' || activeSection === 'mailgroups'
  const saveRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    const published = getCentre(id)
    const draft = getDraft(id)
    // Draft takes priority — it's the builder's in-progress state.
    // savedSnapshot tracks the published version; if only a draft exists treat as dirty.
    setCentre(draft ?? published)
    setSavedSnapshot(published ? JSON.stringify(published) : draft ? '' : null)
  }, [id])

  // Persist work-in-progress to a SEPARATE draft key so the live /subscribe and
  // /preferences pages (which read from the published store) are never touched.
  useEffect(() => {
    if (!centre) return
    const timer = setTimeout(() => saveDraft(centre), 800)
    return () => clearTimeout(timer)
  }, [centre])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveRef.current?.()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (centre === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (centre === null) {
    router.replace('/')
    return null
  }

  const handleContentBlocksChange = (contentBlocks: import('@/lib/subscription-centre').ContentBlock[]) => {
    setCentre((prev) => (prev ? { ...prev, contentBlocks } : prev))
  }

  const handleBannerChange = (banner: import('@/lib/subscription-centre').BannerFooter | null) => {
    setCentre((prev) => (prev ? { ...prev, banner } : prev))
  }

  const handleFooterChange = (footer: import('@/lib/subscription-centre').BannerFooter | null) => {
    setCentre((prev) => (prev ? { ...prev, footer } : prev))
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

  const handleFormCardModeChange = (formCardMode: 'separate' | 'single') => {
    setCentre((prev) => (prev ? { ...prev, formCardMode } : prev))
  }

  const handleSingleCardStyleIndexChange = (singleCardStyleIndex: number) => {
    setCentre((prev) => (prev ? { ...prev, singleCardStyleIndex } : prev))
  }

  const handlePopulateForm = () => {
    const randStyle = () => Math.floor(Math.random() * 15)
    const extraMailGroups: MailGroup[] = [
      { id: 'demo-event-invites', name: 'Event Invites', folder: 'Events' },
      { id: 'demo-webinars', name: 'Webinar Announcements', folder: 'Events' },
      { id: 'demo-research', name: 'Research Digest', folder: 'Content' },
    ]
    const mergedMailGroups = [
      ...centre.mailGroups,
      ...extraMailGroups.filter((mg) => !centre.mailGroups.some((e) => e.id === mg.id)),
    ]

    // Pre-declare IDs for fields/categories that drive conditional rules
    const detailsId = crypto.randomUUID()
    const aboutId = crypto.randomUUID()
    const commsId = crypto.randomUUID()
    const newsletterCatId = crypto.randomUUID()
    const productCatId = crypto.randomUUID()
    const partnerCatId = crypto.randomUUID()
    const radioHowDidYouHearId = crypto.randomUUID()
    const checkboxDecisionMakerId = crypto.randomUUID()
    const toggleOptInId = crypto.randomUUID()

    const profileFieldSections: ProfileFieldSection[] = [
      {
        id: detailsId,
        title: 'Your Details',
        description: 'Help us personalise your experience.',
        cardStyleIndex: randStyle(),
        fields: [
          { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com', locked: true },
          { id: crypto.randomUUID(), label: 'First name', type: 'text', required: false, placeholder: 'Jane' },
          { id: crypto.randomUUID(), label: 'Last name', type: 'text', required: false, placeholder: 'Smith' },
        ],
      },
      {
        id: aboutId,
        title: 'About You',
        description: '',
        cardStyleIndex: randStyle(),
        fields: [
          { id: crypto.randomUUID(), label: 'Tell us about yourself', type: 'heading', required: false },
          { id: crypto.randomUUID(), label: 'Your answers help us tailor our content to what matters most to you.', type: 'paragraph', required: false },
          { id: radioHowDidYouHearId, label: 'How did you hear about us?', type: 'radio', required: false, options: [
            { value: 'social', label: 'Social media' },
            { value: 'word-of-mouth', label: 'Word of mouth' },
            { value: 'search', label: 'Search engine' },
            { value: 'event', label: 'Event or conference' },
          ]},
          { id: crypto.randomUUID(), label: 'Which topics interest you?', type: 'checkboxGroup', required: false, options: [
            { value: 'technology', label: 'Technology' },
            { value: 'design', label: 'Design' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'business', label: 'Business strategy' },
            { value: 'research', label: 'Research & insights' },
          ]},
          { id: crypto.randomUUID(), label: 'Industries relevant to you', type: 'multiSelect', required: false, options: [
            { value: 'fintech', label: 'Fintech' },
            { value: 'healthtech', label: 'Healthtech' },
            { value: 'saas', label: 'SaaS' },
            { value: 'ecommerce', label: 'E-commerce' },
            { value: 'media', label: 'Media & publishing' },
          ]},
          { id: checkboxDecisionMakerId, label: 'I work in a decision-making role', type: 'checkbox', required: false, options: [
            { value: 'yes', label: 'Yes' },
          ]},
          // Only shown when decision-maker checkbox is ticked
          { id: crypto.randomUUID(), label: 'Team size', type: 'number', required: false, placeholder: '25', helpText: 'Approximate number of people in your organisation.',
            visibleWhen: [{ fieldId: checkboxDecisionMakerId, operator: 'hasValue' } as FieldVisibilityRule],
          },
        ],
      },
      {
        id: commsId,
        title: 'Communication Preferences',
        description: 'Tell us how often and in what format you would like to hear from us.',
        cardStyleIndex: randStyle(),
        // Only unlocked once the user has answered how they heard about us
        visibleWhen: [{ fieldId: radioHowDidYouHearId, operator: 'hasValue' } as FieldVisibilityRule],
        fields: [
          { id: crypto.randomUUID(), label: 'Preferred language', type: 'select', required: false, options: [
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'es', label: 'Spanish' },
            { value: 'pt', label: 'Portuguese' },
          ]},
          { id: toggleOptInId, label: 'Opt-in preferences', type: 'toggle', required: false, options: [
            { value: 'newsletter', label: 'Weekly newsletter' },
            { value: 'product-news', label: 'Product news & updates' },
            { value: 'events', label: 'Events & webinars' },
          ]},
          { id: crypto.randomUUID(), label: 'Contact frequency', type: 'range', required: false, min: 1, max: 10, step: 1, helpText: '1 = monthly  ·  10 = daily' },
          { id: crypto.randomUUID(), label: 'Rate your experience with us', type: 'rating', required: false, ratingMax: 5 },
          { id: crypto.randomUUID(), label: 'Date of birth', type: 'date', required: false },
          // Only shown when the user opts in to events
          { id: crypto.randomUUID(), label: 'Phone', type: 'phone', required: false, placeholder: '+1 555 000 0000',
            visibleWhen: [{ fieldId: toggleOptInId, operator: 'equals', value: 'events' } as FieldVisibilityRule],
          },
          { id: crypto.randomUUID(), label: 'Additional comments', type: 'textarea', required: false, placeholder: "Anything else you'd like us to know?" },
        ],
      },
    ]

    const categories: Category[] = [
      {
        id: newsletterCatId,
        title: 'Newsletter & Content',
        description: "Choose the types of content you'd like to receive.",
        type: 'checkbox',
        required: false,
        cardStyleIndex: randStyle(),
        options: [
          { key: 'general-news', label: 'General News', description: 'Industry news and updates', mailGroupId: 'general-news' },
          { key: 'weekly-digest', label: 'Weekly Digest', description: 'A curated round-up every Friday', mailGroupId: 'weekly-digest' },
          { key: 'research', label: 'Research Digest', description: 'In-depth reports and insights', mailGroupId: 'demo-research' },
        ],
      },
      {
        id: productCatId,
        title: 'Product Updates',
        description: "Stay up to date with what we're building.",
        type: 'checkbox',
        required: false,
        cardStyleIndex: randStyle(),
        options: [
          { key: 'product-announcements', label: 'Product Announcements', description: 'New features and releases', mailGroupId: 'product-announcements' },
          { key: 'beta-program', label: 'Beta Program', description: 'Early access to new features', mailGroupId: 'beta-program' },
        ],
      },
      {
        id: partnerCatId,
        title: 'Partner Communications',
        description: 'Select the types of partner communications you are happy to receive.',
        type: 'radio',
        required: false,
        cardStyleIndex: randStyle(),
        // Only shown when the user has subscribed to at least one newsletter
        visibleWhen: [{ fieldId: newsletterCatId, operator: 'hasValue' } as FieldVisibilityRule],
        options: [
          { key: 'partner-offers', label: 'Partner Offers', description: 'Exclusive deals from our partners', mailGroupId: 'partner-offers' },
          { key: 'affiliate-program', label: 'Affiliate Program', description: 'Earn rewards through our affiliate program', mailGroupId: 'affiliate-program' },
        ],
      },
    ]

    setCentre((prev) =>
      prev
        ? {
            ...prev,
            mailGroups: mergedMailGroups,
            profileFieldSections,
            categories,
            sectionOrder: [detailsId, newsletterCatId, aboutId, productCatId, commsId, partnerCatId],
          }
        : prev
    )
  }

  const handleClearForm = () => {
    const defaultSectionId = crypto.randomUUID()
    setCentre((prev) =>
      prev
        ? {
            ...prev,
            profileFieldSections: [
              {
                id: defaultSectionId,
                title: 'Your Details',
                fields: [{ id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com', locked: true }],
              },
            ],
            categories: [],
            sectionOrder: [defaultSectionId],
            mailGroups: defaultMailGroups.map((g) => ({ ...g })),
          }
        : prev
    )
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
    clearDraft(centre.id)
    setSavedSnapshot(JSON.stringify(centre))
    toast.success('Saved')
  }
  // Keep the ⌘S handler pointing at the latest save function each render
  saveRef.current = isDirty ? handleSave : null

  const handleDelete = () => {
    deleteCentre(centre.id)
    clearDraft(centre.id)
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
      layout: {
        fieldArrangement: centre.formLayout,
        labelWidth: centre.formLayout === 'inline' ? centre.formLabelWidth : undefined,
        cardPresentation: centre.formCardMode,
      },
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
        <div className="mx-auto max-w-7xl px-4 py-3">
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
              <button
                type="button"
                onClick={handlePopulateForm}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-violet-500 px-3 text-xs font-medium text-white transition-colors hover:bg-violet-600"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Demo form
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-violet-100 px-3 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-200"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear form
              </button>
              <div className="h-5 w-px bg-border" />
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={isDirty ? -1 : 0}>
                    <Button size="sm" onClick={handleSave} disabled={!isDirty} className="bg-[#43b3ae] hover:bg-[#3a9e99] focus-visible:ring-[#43b3ae] text-white">
                      Save
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isDirty && <TooltipContent>No unsaved changes</TooltipContent>}
              </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 pt-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="shrink-0 md:w-44">
            <nav className="flex flex-col gap-1 md:fixed md:top-[85px] md:w-44 md:left-[max(1rem,calc(50%-40rem))]">
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
                contentBlocks={centre.contentBlocks ?? []}
                onContentBlocksChange={handleContentBlocksChange}
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
                onContentBlocksChange={handleContentBlocksChange}
                onBannerChange={handleBannerChange}
                onFooterChange={handleFooterChange}
                submitButtonText={centre.submitButtonText}
                submitButtonStyleIndex={centre.submitButtonStyleIndex}
                submitButtonAlignment={centre.submitButtonAlignment}
                onSubmitButtonTextChange={handleSubmitButtonTextChange}
                onSubmitButtonStyleIndexChange={handleSubmitButtonStyleIndexChange}
                onSubmitButtonAlignmentChange={handleSubmitButtonAlignmentChange}
                formLayout={centre.formLayout}
                formLabelWidth={centre.formLabelWidth}
                formCardMode={centre.formCardMode}
                singleCardStyleIndex={centre.singleCardStyleIndex}
                onFormLayoutChange={handleFormLayoutChange}
                onFormLabelWidthChange={handleFormLabelWidthChange}
                onFormCardModeChange={handleFormCardModeChange}
                onSingleCardStyleIndexChange={handleSingleCardStyleIndexChange}
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

          {showPreviewPanel && (
            <div className="hidden lg:block lg:w-[380px] shrink-0">
              <div className="sticky top-[85px] max-h-[calc(100vh-100px)] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Live preview</p>
                <FormLivePreview centre={centre} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
