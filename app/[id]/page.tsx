'use client'

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { clearDraft, getCentre, getDraft, saveCentre, saveDraft } from '@/lib/subscription-centre-store'
import { type Category, type ProfileFieldSection } from '@/lib/subscription-types'
import { defaultEmailConfig, defaultMailGroups, type EmailConfig, type MailGroup, type StatusPages, type SubmitButtonAlignment, type SubscriptionCentre, type UnsubscribeFeedbackForm } from '@/lib/subscription-centre'
import type { ColorTheme } from '@/lib/brand-config'
import { BuildEditor } from '@/components/build-editor'
import { type TemplateConfig, makeFull, makeNewsletter, TemplatePickerDialog } from '@/components/template-picker-dialog'
import { LivePreviewPanel } from '@/components/live-preview-panel'
import { MobilePreviewDialog } from '@/components/mobile-preview-dialog'
import { PreviewEditor } from '@/components/preview-editor'
import { StatusPagesEditor } from '@/components/status-pages-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ArrowLeft, Beaker, Check, Copy, Download, Eraser, ExternalLink, Eye, FileText, FlaskConical, Globe, Layers, LayoutTemplate, Loader2, Mail, MoreHorizontal, Paintbrush, Redo2, Share2, Undo2 } from 'lucide-react'
import { EmailsEditor } from '@/components/emails-editor'
import { ExportEditor } from '@/components/export-editor'

interface BuilderPageProps {
  params: Promise<{ id: string }>
}

type BuilderSection = 'build' | 'design' | 'emails' | 'pages' | 'export'
type DesignSection = 'brand' | 'theme' | 'banner' | 'footer' | 'form'
type EmailSection = 'banner' | 'footer' | 'messages' | 'design'

const SECTIONS: { id: BuilderSection; label: string; icon: typeof Layers }[] = [
  { id: 'build', label: 'Build', icon: Layers },
  { id: 'design', label: 'Design', icon: Paintbrush },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'export', label: 'Export', icon: Share2 },
]

const DESIGN_SUBSECTIONS: { id: DesignSection; label: string }[] = [
  { id: 'theme', label: 'Style' },
  { id: 'form', label: 'Form' },
  { id: 'brand', label: 'Brand' },
  { id: 'banner', label: 'Banner' },
  { id: 'footer', label: 'Footer' },
]

const EMAIL_SUBSECTIONS: { id: EmailSection; label: string }[] = [
  { id: 'design', label: 'Style' },
  { id: 'banner', label: 'Banner' },
  { id: 'footer', label: 'Footer' },
  { id: 'messages', label: 'Messages' },
]

export default function BuilderEditorPage({ params }: BuilderPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [centre, setCentre] = useState<SubscriptionCentre | null | undefined>(undefined)
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<BuilderSection>('build')
  const [designSection, setDesignSection] = useState<DesignSection>('brand')
  const [emailSection, setEmailSection] = useState<EmailSection>('design')
  const [showSuppressErrors, setShowSuppressErrors] = useState(false)
  const [justPublished, setJustPublished] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [demoToken, setDemoToken] = useState<string | null>(null)
  const [demoTokenLoading, setDemoTokenLoading] = useState(false)
  const saveRef = useRef<(() => void) | null>(null)

  // Undo/redo over the whole centre. Snapshots are debounced JSON blobs; time-travel
  // applies a snapshot without re-recording it. historyVersion only exists so the
  // Undo/Redo buttons re-render their disabled state (the stack itself lives in a ref).
  const historyRef = useRef<{ stack: string[]; index: number }>({ stack: [], index: -1 })
  const timeTravellingRef = useRef(false)
  const [, setHistoryVersion] = useState(0)

  const applyHistory = (delta: -1 | 1) => {
    const h = historyRef.current
    const newIndex = h.index + delta
    if (newIndex < 0 || newIndex >= h.stack.length) return
    h.index = newIndex
    timeTravellingRef.current = true
    setCentre(JSON.parse(h.stack[newIndex]))
    setHistoryVersion((v) => v + 1)
  }
  const canUndo = historyRef.current.index > 0
  const canRedo = historyRef.current.index < historyRef.current.stack.length - 1

  const fetchDemoToken = async () => {
    if (demoToken || demoTokenLoading) return
    setDemoTokenLoading(true)
    try {
      const res = await fetch(`/api/demo-subscriber?centreId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setDemoToken(data.token)
      }
    } finally {
      setDemoTokenLoading(false)
    }
  }
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

  // Record undo history. Skipped when the change came from undo/redo itself.
  useEffect(() => {
    if (!centre) return
    if (timeTravellingRef.current) {
      timeTravellingRef.current = false
      return
    }
    const timer = setTimeout(() => {
      const h = historyRef.current
      const snap = JSON.stringify(centre)
      if (h.stack[h.index] === snap) return
      h.stack = h.stack.slice(0, h.index + 1)
      h.stack.push(snap)
      if (h.stack.length > 100) h.stack.shift()
      h.index = h.stack.length - 1
      setHistoryVersion((v) => v + 1)
    }, 400)
    return () => clearTimeout(timer)
  }, [centre])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveRef.current?.()
        return
      }
      // Undo/redo — but never hijack native text-editing undo inside a field.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        const el = e.target as HTMLElement
        const inField = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable
        if (inField) return
        e.preventDefault()
        applyHistory(e.shiftKey ? 1 : -1)
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

  const handleBrandChange = (brand: import('@/lib/subscription-centre').Brand) => {
    setCentre((prev) => (prev ? { ...prev, brand } : prev))
  }

  const handlePageBackgroundColorChange = (pageBackgroundColor: string | undefined) => {
    setCentre((prev) => (prev ? { ...prev, pageBackgroundColor } : prev))
  }

  const handleCardStyleChange = (cardStyle: import('@/lib/subscription-centre').CardStyle) => {
    setCentre((prev) => (prev ? { ...prev, cardStyle } : prev))
  }

  const handleFormWidthChange = (formWidth: import('@/lib/subscription-centre').FormWidth) => {
    setCentre((prev) => (prev ? { ...prev, formWidth } : prev))
  }

  const handleBannerChange = (banner: import('@/lib/subscription-centre').BannerConfig | null) => {
    setCentre((prev) => (prev ? { ...prev, banner } : prev))
  }

  const handleFooterChange = (footer: import('@/lib/subscription-centre').FooterConfig | null) => {
    setCentre((prev) => (prev ? { ...prev, footer } : prev))
  }

  const handleEmailConfigChange = (emailConfig: EmailConfig) => {
    setCentre((prev) => (prev ? { ...prev, emailConfig } : prev))
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

  const handleSubmitButtonBgColorChange = (submitButtonBgColor: string | undefined) => {
    setCentre((prev) => (prev ? { ...prev, submitButtonBgColor } : prev))
  }

  const handleSubmitButtonTextColorChange = (submitButtonTextColor: string | undefined) => {
    setCentre((prev) => (prev ? { ...prev, submitButtonTextColor } : prev))
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
            catchAllMailGroupId: null,
          }
        : prev
    )
  }

  const handleDemoForm = () => {
    const template = makeFull()
    const catchAllMailGroupId = crypto.randomUUID()
    setCentre((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        profileFieldSections: template.profileFieldSections,
        categories: template.categories,
        sectionOrder: template.sectionOrder,
        mailGroups: [...template.mailGroupsToAdd, { id: catchAllMailGroupId, name: 'All Subscribers', folder: 'General' }],
        catchAllMailGroupId,
        brand: {
          logoUrl: 'https://placehold.co/160x48/3b82f6/ffffff?text=Your+Brand&font=inter',
          backUrl: 'https://example.com',
          address: '123 Example Street\nSydney NSW 2000, Australia',
          copyrightText: `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
          socialLinks: [
            { id: crypto.randomUUID(), platform: 'facebook' as const, url: '#' },
            { id: crypto.randomUUID(), platform: 'instagram' as const, url: '#' },
            { id: crypto.randomUUID(), platform: 'linkedin' as const, url: '#' },
          ],
        },
        banner: { layout: 'centred' as const, fullWidth: false },
        footer: {
          layout: 'centred-stack' as const,
          fullWidth: false,
          links: [
            { id: crypto.randomUUID(), label: 'Privacy Policy', url: '#' },
            { id: crypto.randomUUID(), label: 'Terms of Service', url: '#' },
            { id: crypto.randomUUID(), label: 'Contact Us', url: '#' },
          ],
        },
      }
    })
    setActiveSection('build')
  }

  // Same shape as handleDemoForm but with the minimal Newsletter template — one form
  // fields section, one mailgroup category — and a catch-all group so it publishes
  // out of the box without touching brand/banner/footer.
  const handleSimpleDemoForm = () => {
    const template = makeNewsletter()
    const catchAllMailGroupId = crypto.randomUUID()
    setCentre((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        profileFieldSections: template.profileFieldSections,
        categories: template.categories,
        sectionOrder: template.sectionOrder,
        mailGroups: [...template.mailGroupsToAdd, { id: catchAllMailGroupId, name: 'All Subscribers', folder: 'General' }],
        catchAllMailGroupId,
      }
    })
    setActiveSection('build')
  }

  // Shared by the sidebar live preview (xl+) and the header Preview dialog (below xl) —
  // clicking the banner/footer in either jumps to its editor; the dialog additionally
  // needs closing since it's a modal sitting on top of that editor.
  const handleEditRegion = (region: 'banner' | 'footer') => {
    setActiveSection('design')
    setDesignSection(region)
    setPreviewDialogOpen(false)
  }

  const handleApplyTemplate = (config: TemplateConfig) => {
    setCentre((prev) => {
      if (!prev) return prev
      const merged = [
        ...prev.mailGroups,
        ...config.mailGroupsToAdd.filter((mg) => !prev.mailGroups.some((e) => e.id === mg.id)),
      ]
      return {
        ...prev,
        profileFieldSections: config.profileFieldSections,
        categories: config.categories,
        sectionOrder: config.sectionOrder,
        mailGroups: merged,
      }
    })
    setActiveSection('build')
  }

  const isDirty = savedSnapshot !== null && JSON.stringify(centre) !== savedSnapshot

  // Checking the id alone isn't enough — it can go stale (e.g. Clear Form resets
  // mailGroups but a leftover id would still pass a truthiness check) and silently
  // let Publish through with no actual parent mailgroup selected.
  const hasCatchAllMailGroup = centre.mailGroups.some((g) => g.id === centre.catchAllMailGroupId)
  const optionsMissingSuppress = centre.categories.flatMap((c) =>
    c.options.filter((o) => o.mailGroupId && o.suppressMailGroupId === undefined)
  )
  const hasMissingSuppress = optionsMissingSuppress.length > 0

  // Clear suppress errors once all issues are resolved by the user
  if (showSuppressErrors && !hasMissingSuppress) setShowSuppressErrors(false)

  const handlePublish = () => {
    if (!hasCatchAllMailGroup) {
      toast.error('Choose a parent mailgroup in the Build tab before publishing.')
      setActiveSection('build')
      return
    }
    if (hasMissingSuppress) {
      setShowSuppressErrors(true)
      setActiveSection('build')
      const n = optionsMissingSuppress.length
      toast.error(`${n} mailgroup option${n === 1 ? '' : 's'} need a suppress group — highlighted in the Build tab.`)
      return
    }
    setShowSuppressErrors(false)
    saveCentre(centre)
    clearDraft(centre.id)
    setSavedSnapshot(JSON.stringify(centre))
    toast.success('Published')
    setJustPublished(true)
    setTimeout(() => setJustPublished(false), 900)
  }
  // Keep the ⌘S handler pointing at the latest publish function each render
  saveRef.current = isDirty ? handlePublish : null


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
    // App frame: fixed-height shell, header on top, then three independently
    // scrolling columns (nav rail / editor / preview). No sticky offsets anywhere —
    // each region owns its scroll context by construction.
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="z-20 shrink-0 border-b bg-background">
        <div className="px-4 py-3">
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
                className="h-9 w-full bg-background text-base font-semibold md:max-w-md md:flex-1"
              />
              <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="px-2" onClick={() => applyHistory(-1)} disabled={!canUndo} aria-label="Undo" title="Undo (⌘Z)">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="px-2" onClick={() => applyHistory(1)} disabled={!canRedo} aria-label="Redo" title="Redo (⇧⌘Z)">
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2" aria-label="More actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={handleDemoForm}>
                    <FlaskConical className="h-3.5 w-3.5" />
                    Load demo form
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSimpleDemoForm}>
                    <Beaker className="h-3.5 w-3.5" />
                    Load simple demo form
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleClearForm}>
                    <Eraser className="h-3.5 w-3.5" />
                    Clear form
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTemplateDialogOpen(true)}>
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    Form library
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportSpec}>
                    <Download className="h-4 w-4" />
                    Export for dev
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <TemplatePickerDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} onApply={handleApplyTemplate} />
              {(activeSection === 'build' || activeSection === 'design') && (
                <>
                  <Button variant="outline" size="sm" className="gap-2 xl:hidden" onClick={() => setPreviewDialogOpen(true)}>
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <MobilePreviewDialog
                    open={previewDialogOpen}
                    onOpenChange={setPreviewDialogOpen}
                    centre={centre}
                    onEditRegion={handleEditRegion}
                  />
                </>
              )}
              {isDirty ? (
                <>
                  <span className="hidden items-center gap-1.5 text-xs font-medium text-amber-600 lg:flex dark:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Unpublished changes
                  </span>
                  <Button size="sm" onClick={handlePublish}>
                    Publish
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className={cn('gap-1.5 disabled:opacity-100', justPublished && 'animate-pill-pop')}
                >
                  {justPublished ? (
                    <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 12l6 6L20 6"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength="1"
                        className="animate-check-draw"
                      />
                    </svg>
                  ) : (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                  Published
                </Button>
              )}

              <Popover onOpenChange={(open) => { if (open) fetchDemoToken() }}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    View live
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="border-b px-4 py-3">
                    <p className="text-sm font-medium">Live URLs</p>
                    {isDirty ? (
                      <p className="mt-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">Unpublished changes — publish to update the live site.</p>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Last published {new Date(centre.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
                      </p>
                    )}
                  </div>
                  <div className="divide-y">
                    {/* Pages section */}
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pages</p>
                    </div>
                    {(() => {
                      const staticLinks = [
                        { label: 'Subscribe form', path: '/subscribe' },
                        { label: 'Manage preferences request', path: '/manage-preferences' },
                        { label: 'Unsubscribe request', path: '/unsubscribe' },
                      ]
                      const personalLinks = demoToken
                        ? [
                            { label: 'Preferences page (preview user)', path: `/preferences/${demoToken}` },
                            { label: 'Unsubscribe page (preview user)', path: `/preferences/${demoToken}/unsubscribe` },
                          ]
                        : []
                      return [...staticLinks, ...personalLinks].map(({ label, path }) => {
                        const copied = copiedUrl === path
                        return (
                          <div key={path} className="flex items-center justify-between gap-2 px-4 py-2.5">
                            <div className="min-w-0">
                              <p className="text-xs font-medium">{label}</p>
                              <p className="truncate font-mono text-xs text-muted-foreground">{path}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                title="Copy URL"
                                onClick={() => {
                                  const full = `${window.location.origin}${path}`
                                  navigator.clipboard.writeText(full)
                                  setCopiedUrl(path)
                                  setTimeout(() => setCopiedUrl(null), 2000)
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                              <a
                                href={path}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open in new tab"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        )
                      })
                    })()}
                    {demoTokenLoading && (
                      <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading personalised links…
                      </div>
                    )}
                    {/* Emails section */}
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email previews</p>
                    </div>
                    {([
                      { label: 'Double opt-in', template: 'doubleOptIn' },
                      { label: 'Confirmation', template: 'confirmation' },
                      { label: 'Unsubscribed', template: 'unsubscribed' },
                    ] as const).map(({ label, template }) => {
                      const path = `/emails/preview?centreId=${id}&template=${template}`
                      const copied = copiedUrl === path
                      return (
                        <div key={template} className="flex items-center justify-between gap-2 px-4 py-2.5">
                          <div className="min-w-0">
                            <p className="text-xs font-medium">{label}</p>
                            <p className="truncate font-mono text-[10px] text-muted-foreground">/emails/preview?…&template={template}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              title="Copy URL"
                              onClick={() => {
                                const full = `${window.location.origin}${path}`
                                navigator.clipboard.writeText(full)
                                setCopiedUrl(path)
                                setTimeout(() => setCopiedUrl(null), 2000)
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                            <a
                              href={path}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open in new tab"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Nav rail — own scroll region */}
        <nav className="hidden w-48 shrink-0 flex-col gap-1 overflow-y-auto border-r bg-background p-3 md:flex">
              {SECTIONS.map((section) => (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <section.icon className="h-4 w-4 shrink-0" />
                    {section.label}
                  </button>

                  {/* Design sub-navigation — only shown when Design is the active section */}
                  {section.id === 'design' && activeSection === 'design' && (
                    <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
                      {DESIGN_SUBSECTIONS.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setDesignSection(sub.id)}
                          className={cn(
                            'rounded-md px-2.5 py-1.5 text-left text-sm font-medium transition-colors',
                            designSection === sub.id
                              ? 'bg-muted text-foreground'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          )}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Emails sub-navigation — only shown when Emails is the active section */}
                  {section.id === 'emails' && activeSection === 'emails' && (
                    <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
                      {EMAIL_SUBSECTIONS.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setEmailSection(sub.id)}
                          className={cn(
                            'rounded-md px-2.5 py-1.5 text-left text-sm font-medium transition-colors',
                            emailSection === sub.id
                              ? 'bg-muted text-foreground'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          )}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
        </nav>

        {/* Editor column — own scroll region */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {/* Mobile nav — horizontal pills, replaces the rail below md */}
          <div className="flex gap-1 overflow-x-auto border-b bg-background px-3 py-2 md:hidden">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <section.icon className="h-3.5 w-3.5" />
                {section.label}
              </button>
            ))}
          </div>
          {activeSection === 'design' && (
            <div className="flex gap-1 overflow-x-auto border-b bg-background px-3 py-2 md:hidden">
              {DESIGN_SUBSECTIONS.map((sub) => (
                <button key={sub.id} type="button" onClick={() => setDesignSection(sub.id)}
                  className={cn('shrink-0 rounded-md px-3 py-1 text-sm font-medium transition-colors',
                    designSection === sub.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  {sub.label}
                </button>
              ))}
            </div>
          )}
          {activeSection === 'emails' && (
            <div className="flex gap-1 overflow-x-auto border-b bg-background px-3 py-2 md:hidden">
              {EMAIL_SUBSECTIONS.map((sub) => (
                <button key={sub.id} type="button" onClick={() => setEmailSection(sub.id)}
                  className={cn('shrink-0 rounded-md px-3 py-1 text-sm font-medium transition-colors',
                    emailSection === sub.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          <div key={activeSection} className="mx-auto max-w-3xl animate-in fade-in-0 slide-in-from-bottom-1 px-4 py-6 duration-200 md:px-8">
            {activeSection === 'build' && (
                  <BuildEditor
                    profileFieldSections={centre.profileFieldSections}
                    onProfileFieldSectionsChange={handleProfileFieldSectionsChange}
                    categories={centre.categories}
                    onCategoriesChange={handleCategoriesChange}
                    contentBlocks={centre.contentBlocks ?? []}
                    onContentBlocksChange={handleContentBlocksChange}
                    sectionOrder={centre.sectionOrder}
                    onSectionOrderChange={handleSectionOrderChange}
                    mailGroups={centre.mailGroups}
                    onAddMailGroup={handleAddMailGroup}
                    catchAllMailGroupId={centre.catchAllMailGroupId}
                    onCatchAllMailGroupIdChange={handleCatchAllMailGroupIdChange}
                    suppressErrors={showSuppressErrors}
                  />
            )}

            {activeSection === 'design' && (
                  <PreviewEditor
                    centre={centre}
                    designSection={designSection}
                    onDesignSectionChange={setDesignSection}
                    pageBackgroundColor={centre.pageBackgroundColor}
                    onPageBackgroundColorChange={handlePageBackgroundColorChange}
                    onCardStyleChange={handleCardStyleChange}
                    onThemeChange={handleThemeChange}
                    onSectionOrderChange={handleSectionOrderChange}
                    onProfileFieldSectionsChange={handleProfileFieldSectionsChange}
                    onCategoriesChange={handleCategoriesChange}
                    onContentBlocksChange={handleContentBlocksChange}
                    onBrandChange={handleBrandChange}
                    onBannerChange={handleBannerChange}
                    onFooterChange={handleFooterChange}
                    submitButtonText={centre.submitButtonText}
                    submitButtonStyleIndex={centre.submitButtonStyleIndex}
                    submitButtonAlignment={centre.submitButtonAlignment}
                    submitButtonBgColor={centre.submitButtonBgColor}
                    submitButtonTextColor={centre.submitButtonTextColor}
                    onSubmitButtonTextChange={handleSubmitButtonTextChange}
                    onSubmitButtonStyleIndexChange={handleSubmitButtonStyleIndexChange}
                    onSubmitButtonAlignmentChange={handleSubmitButtonAlignmentChange}
                    onSubmitButtonBgColorChange={handleSubmitButtonBgColorChange}
                    onSubmitButtonTextColorChange={handleSubmitButtonTextColorChange}
                    formLayout={centre.formLayout}
                    formLabelWidth={centre.formLabelWidth}
                    formCardMode={centre.formCardMode}
                    singleCardStyleIndex={centre.singleCardStyleIndex}
                    onFormLayoutChange={handleFormLayoutChange}
                    onFormLabelWidthChange={handleFormLabelWidthChange}
                    onFormCardModeChange={handleFormCardModeChange}
                    onSingleCardStyleIndexChange={handleSingleCardStyleIndexChange}
                    onFormWidthChange={handleFormWidthChange}
                    onStatusPagesChange={handleStatusPagesChange}
                  />
            )}

            {activeSection === 'emails' && (
              <Card className="gap-0 py-0">
                <CardContent className="px-6 py-6">
                  <EmailsEditor
                    section={emailSection}
                    emailConfig={centre.emailConfig ?? defaultEmailConfig}
                    onEmailConfigChange={handleEmailConfigChange}
                    brand={centre.brand}
                    themeId={centre.themePresetId}
                    onThemeChange={handleThemeChange}
                  />
                </CardContent>
              </Card>
            )}

            {activeSection === 'pages' && (
              <StatusPagesEditor
                statusPages={centre.statusPages}
                onStatusPagesChange={handleStatusPagesChange}
                unsubscribeFeedback={centre.unsubscribeFeedback}
                onUnsubscribeFeedbackChange={handleUnsubscribeFeedbackChange}
              />
            )}

            {activeSection === 'export' && (
              <ExportEditor centre={centre} />
            )}
          </div>
        </main>

        {/* Preview rail — own scroll region, only where a live preview makes sense */}
        {(activeSection === 'build' || activeSection === 'design') && (
          <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l bg-background p-4 xl:block">
            <LivePreviewPanel
              centre={centre}
              onEditRegion={handleEditRegion}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
