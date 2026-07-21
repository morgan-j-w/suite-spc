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
import { type TemplateConfig, makeFull } from '@/components/template-picker-dialog'
import { LivePreviewPanel } from '@/components/live-preview-panel'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ArrowLeft, Check, Copy, Download, Eraser, ExternalLink, FileText, FlaskConical, Globe, Layers, Loader2, Mail, Paintbrush, Share2 } from 'lucide-react'
import { EmailsEditor } from '@/components/emails-editor'
import { generateEmailBannerHtml, generateEmailFooterHtml } from '@/lib/email-layouts'
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
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [demoToken, setDemoToken] = useState<string | null>(null)
  const [demoTokenLoading, setDemoTokenLoading] = useState(false)
  const saveRef = useRef<(() => void) | null>(null)

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
          }
        : prev
    )
  }

  const handleDemoForm = () => {
    const template = makeFull()
    setCentre((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        profileFieldSections: template.profileFieldSections,
        categories: template.categories,
        sectionOrder: template.sectionOrder,
        mailGroups: template.mailGroupsToAdd,
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
        banner: { layout: 'brand-band' as const, fullWidth: false },
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

  const hasCatchAllMailGroup = Boolean(centre.catchAllMailGroupId)
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
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-700 dark:text-purple-400 dark:hover:border-purple-600 dark:hover:bg-purple-950/40 dark:hover:text-purple-300" onClick={handleDemoForm}>
                <FlaskConical className="h-3.5 w-3.5" />
                Demo form
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-700 dark:text-purple-400 dark:hover:border-purple-600 dark:hover:bg-purple-950/40 dark:hover:text-purple-300" onClick={handleClearForm}>
                <Eraser className="h-3.5 w-3.5" />
                Clear form
              </Button>
              <div className="hidden sm:block h-5 w-px bg-border" />
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-700 dark:text-purple-400 dark:hover:border-purple-600 dark:hover:bg-purple-950/40 dark:hover:text-purple-300" onClick={handleExportSpec}>
                <Download className="h-4 w-4" />
                Export for Dev
              </Button>
<Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={isDirty ? -1 : 0}>
                    <Button size="sm" onClick={handlePublish} disabled={!isDirty} className="bg-[#43b3ae] hover:bg-[#3a9e99] focus-visible:ring-[#43b3ae] text-white">
                      Publish
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isDirty && <TooltipContent>Already published</TooltipContent>}
              </Tooltip>

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

      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 pt-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="shrink-0 md:w-44">
            <nav className="flex flex-col gap-1 md:fixed md:top-[85px] md:w-44 md:left-[max(1rem,calc(50%-40rem))]">
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
          </div>

          <div className="min-w-0 flex-1">
            {activeSection === 'build' && (
              <div className="flex gap-6">
                <div className="min-w-0 flex-1">
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
                </div>
                <LivePreviewPanel centre={centre} className="hidden w-80 shrink-0 xl:block" />
              </div>
            )}

            {activeSection === 'design' && (
              <div className="flex gap-6">
                <div className="min-w-0 flex-1">
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
                    onNavigateToPagesTab={() => setActiveSection('pages')}
                  />
                </div>
                <LivePreviewPanel centre={centre} className="hidden w-80 shrink-0 xl:block" />
              </div>
            )}

            {activeSection === 'emails' && (() => {
              const emailCfg = centre.emailConfig ?? defaultEmailConfig
              return (
                <div className="space-y-6">
                  <Card className="gap-0 py-0">
                    <CardContent className="px-6 py-6">
                      <EmailsEditor
                        section={emailSection}
                        emailConfig={emailCfg}
                        onEmailConfigChange={handleEmailConfigChange}
                        brand={centre.brand}
                        themeId={centre.themePresetId}
                        onThemeChange={handleThemeChange}
                      />
                    </CardContent>
                  </Card>

                  {emailSection === 'banner' && emailCfg.bannerEnabled && emailCfg.bannerLayout && (
                    <div className="overflow-hidden rounded-lg border p-4" style={{ backgroundColor: emailCfg.emailBodyBgColor ?? '#f4f4f4' }}>
                      <div
                        className="mx-auto overflow-x-auto bg-white shadow-sm"
                        style={{ width: 650, maxWidth: '100%' }}
                        dangerouslySetInnerHTML={{
                          __html: generateEmailBannerHtml(
                            emailCfg.bannerLayout,
                            centre.brand ?? {},
                            { bgColor: emailCfg.bannerBgColor, textColor: emailCfg.bannerTextColor, heading: emailCfg.bannerHeading, subheading: emailCfg.bannerSubheading, logoMaxWidth: emailCfg.bannerLogoMaxWidth, logoMaxHeight: emailCfg.bannerLogoMaxHeight, logoPosition: emailCfg.bannerLogoPosition }
                          ),
                        }}
                      />
                    </div>
                  )}

                  {emailSection === 'footer' && emailCfg.footerEnabled && emailCfg.footerLayout && (
                    <div className="overflow-hidden rounded-lg border p-4" style={{ backgroundColor: emailCfg.emailBodyBgColor ?? '#f4f4f4' }}>
                      <div
                        className="mx-auto overflow-x-auto bg-white shadow-sm"
                        style={{ width: 650, maxWidth: '100%' }}
                        dangerouslySetInnerHTML={{
                          __html: generateEmailFooterHtml(
                            emailCfg.footerLayout,
                            centre.brand ?? {},
                            { bgColor: emailCfg.footerBgColor, textColor: emailCfg.footerTextColor, logoMaxWidth: emailCfg.footerLogoMaxWidth, logoMaxHeight: emailCfg.footerLogoMaxHeight, logoPosition: emailCfg.footerLogoPosition }
                          ),
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })()}

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
        </div>
      </div>
    </div>
  )
}
