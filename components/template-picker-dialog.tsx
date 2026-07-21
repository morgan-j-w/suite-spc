'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { LayoutTemplate } from 'lucide-react'
import { type Category, type ProfileFieldSection, type FieldVisibilityRule } from '@/lib/subscription-types'
import { defaultMailGroups, type MailGroup } from '@/lib/subscription-centre'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TemplateConfig {
  profileFieldSections: ProfileFieldSection[]
  categories: Category[]
  sectionOrder: string[]
  mailGroupsToAdd: MailGroup[]
}

// ── Template definitions ───────────────────────────────────────────────────────

function makeBlank(): TemplateConfig {
  const sectionId = uuidv4()
  return {
    profileFieldSections: [
      {
        id: sectionId,
        title: '',
        description: '',
        fields: [
          { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com', locked: true },
        ],
      },
    ],
    categories: [],
    sectionOrder: [sectionId],
    mailGroupsToAdd: defaultMailGroups.map((g) => ({ ...g })),
  }
}

function makeNewsletter(): TemplateConfig {
  const detailsId = uuidv4()
  const catId = uuidv4()
  return {
    profileFieldSections: [
      {
        id: detailsId,
        title: 'Your Details',
        description: '',
        fields: [
          { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com', locked: true },
          { id: uuidv4(), label: 'First name', type: 'text', required: false, placeholder: 'Jane' },
          { id: uuidv4(), label: 'Last name', type: 'text', required: false, placeholder: 'Smith' },
        ],
      },
    ],
    categories: [
      {
        id: catId,
        title: 'Newsletter topics',
        description: "Choose the content you'd like to receive.",
        type: 'checkbox',
        required: false,
        options: [
          { key: uuidv4(), label: 'General News', description: 'Industry news and updates', mailGroupId: 'general-news' },
          { key: uuidv4(), label: 'Weekly Digest', description: 'A curated round-up every Friday', mailGroupId: 'weekly-digest' },
          { key: uuidv4(), label: 'Product Announcements', description: 'New features and releases', mailGroupId: 'product-announcements' },
        ],
      },
    ],
    sectionOrder: [detailsId, catId],
    mailGroupsToAdd: defaultMailGroups.map((g) => ({ ...g })),
  }
}

function makeEvents(): TemplateConfig {
  const detailsId = uuidv4()
  const catId = uuidv4()
  const eventsMailGroupId = uuidv4()
  const webinarsMailGroupId = uuidv4()
  const workshopsMailGroupId = uuidv4()
  return {
    profileFieldSections: [
      {
        id: detailsId,
        title: 'Your Details',
        description: '',
        fields: [
          { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com', locked: true },
          { id: uuidv4(), label: 'First name', type: 'text', required: false, placeholder: 'Jane' },
          { id: uuidv4(), label: 'Last name', type: 'text', required: false, placeholder: 'Smith' },
          { id: uuidv4(), label: 'Company', type: 'text', required: false, placeholder: 'Acme Corp' },
          { id: uuidv4(), label: 'Job title', type: 'text', required: false, placeholder: 'Marketing Manager' },
        ],
      },
    ],
    categories: [
      {
        id: catId,
        title: 'Event types',
        description: 'Tell us which kinds of events you would like to hear about.',
        type: 'checkbox',
        required: false,
        options: [
          { key: uuidv4(), label: 'In-person events', description: 'Conferences, meetups and networking', mailGroupId: eventsMailGroupId },
          { key: uuidv4(), label: 'Webinars', description: 'Live and on-demand online sessions', mailGroupId: webinarsMailGroupId },
          { key: uuidv4(), label: 'Workshops', description: 'Hands-on training and deep dives', mailGroupId: workshopsMailGroupId },
        ],
      },
    ],
    sectionOrder: [detailsId, catId],
    mailGroupsToAdd: [
      ...defaultMailGroups.map((g) => ({ ...g })),
      { id: eventsMailGroupId, name: 'In-person Events', folder: 'Events' },
      { id: webinarsMailGroupId, name: 'Webinars', folder: 'Events' },
      { id: workshopsMailGroupId, name: 'Workshops', folder: 'Events' },
    ],
  }
}

export function makeFull(): TemplateConfig {
  const detailsId = uuidv4()
  const aboutId = uuidv4()
  const commsId = uuidv4()
  const newsletterCatId = uuidv4()
  const productCatId = uuidv4()
  const partnerCatId = uuidv4()
  const radioHowDidYouHearId = uuidv4()
  const checkboxDecisionMakerId = uuidv4()
  const toggleOptInId = uuidv4()
  const demoResearchId = uuidv4()
  const suppressNewsletterId = uuidv4()
  const suppressProductId = uuidv4()
  const suppressPartnersId = uuidv4()
  return {
    profileFieldSections: [
      {
        id: detailsId,
        title: 'Your Details',
        description: 'Help us personalise your experience.',
        fields: [
          { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com', locked: true },
          { id: uuidv4(), label: 'First name', type: 'text', required: false, placeholder: 'Jane' },
          { id: uuidv4(), label: 'Last name', type: 'text', required: false, placeholder: 'Smith' },
        ],
      },
      {
        id: aboutId,
        title: 'About You',
        description: '',
        fields: [
          { id: uuidv4(), label: 'Tell us about yourself', type: 'heading', required: false },
          { id: uuidv4(), label: 'Your answers help us tailor our content to what matters most to you.', type: 'paragraph', required: false },
          { id: radioHowDidYouHearId, label: 'How did you hear about us?', type: 'radio', required: false, options: [
            { value: 'social', label: 'Social media' },
            { value: 'word-of-mouth', label: 'Word of mouth' },
            { value: 'search', label: 'Search engine' },
            { value: 'event', label: 'Event or conference' },
          ]},
          { id: uuidv4(), label: 'Which topics interest you?', type: 'checkboxGroup', required: false, options: [
            { value: 'technology', label: 'Technology' },
            { value: 'design', label: 'Design' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'business', label: 'Business strategy' },
          ]},
          { id: checkboxDecisionMakerId, label: 'I work in a decision-making role', type: 'checkbox', required: false, options: [
            { value: 'yes', label: 'Yes' },
          ]},
          { id: uuidv4(), label: 'Team size', type: 'number', required: false, placeholder: '25',
            helpText: 'Approximate number of people in your organisation.',
            visibleWhen: [{ fieldId: checkboxDecisionMakerId, operator: 'hasValue' } as FieldVisibilityRule],
          },
        ],
      },
      {
        id: commsId,
        title: 'Communication Preferences',
        description: 'Tell us how often and in what format you would like to hear from us.',
        visibleWhen: [{ fieldId: radioHowDidYouHearId, operator: 'hasValue' } as FieldVisibilityRule],
        fields: [
          { id: uuidv4(), label: 'Preferred language', type: 'select', required: false, options: [
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'es', label: 'Spanish' },
          ]},
          { id: toggleOptInId, label: 'Opt-in preferences', type: 'toggle', required: false, options: [
            { value: 'newsletter', label: 'Weekly newsletter' },
            { value: 'product-news', label: 'Product news & updates' },
            { value: 'events', label: 'Events & webinars' },
          ]},
          { id: uuidv4(), label: 'Phone', type: 'phone', required: false, placeholder: '+1 555 000 0000',
            visibleWhen: [{ fieldId: toggleOptInId, operator: 'equals', value: 'events' } as FieldVisibilityRule],
          },
          { id: uuidv4(), label: 'Additional comments', type: 'textarea', required: false, placeholder: "Anything else you'd like us to know?" },
        ],
      },
    ],
    categories: [
      {
        id: newsletterCatId,
        title: 'Newsletter & Content',
        description: "Choose the types of content you'd like to receive.",
        type: 'checkbox',
        required: false,
        options: [
          { key: uuidv4(), label: 'General News', description: 'Industry news and updates', mailGroupId: 'general-news', suppressMailGroupId: suppressNewsletterId },
          { key: uuidv4(), label: 'Weekly Digest', description: 'A curated round-up every Friday', mailGroupId: 'weekly-digest', suppressMailGroupId: suppressNewsletterId },
          { key: uuidv4(), label: 'Research Digest', description: 'In-depth reports and insights', mailGroupId: demoResearchId, suppressMailGroupId: suppressNewsletterId },
        ],
      },
      {
        id: productCatId,
        title: 'Product Updates',
        description: "Stay up to date with what we're building.",
        type: 'checkbox',
        required: false,
        options: [
          { key: uuidv4(), label: 'Product Announcements', description: 'New features and releases', mailGroupId: 'product-announcements', suppressMailGroupId: suppressProductId },
          { key: uuidv4(), label: 'Beta Program', description: 'Early access to new features', mailGroupId: 'beta-program', suppressMailGroupId: suppressProductId },
        ],
      },
      {
        id: partnerCatId,
        title: 'Partner Communications',
        description: 'Select the types of partner communications you are happy to receive.',
        type: 'radio',
        required: false,
        visibleWhen: [{ fieldId: newsletterCatId, operator: 'hasValue' } as FieldVisibilityRule],
        options: [
          { key: uuidv4(), label: 'Partner Offers', description: 'Exclusive deals from our partners', mailGroupId: 'partner-offers', suppressMailGroupId: suppressPartnersId },
          { key: uuidv4(), label: 'Affiliate Program', description: 'Earn rewards through our affiliate program', mailGroupId: 'affiliate-program', suppressMailGroupId: suppressPartnersId },
        ],
      },
    ],
    sectionOrder: [detailsId, newsletterCatId, aboutId, productCatId, commsId, partnerCatId],
    mailGroupsToAdd: [
      ...defaultMailGroups.map((g) => ({ ...g })),
      { id: demoResearchId, name: 'Research Digest', folder: 'Content' },
      { id: suppressNewsletterId, name: 'SUPPRESS - Newsletter & Content', folder: 'Suppress' },
      { id: suppressProductId, name: 'SUPPRESS - Product Updates', folder: 'Suppress' },
      { id: suppressPartnersId, name: 'SUPPRESS - Partner Communications', folder: 'Suppress' },
    ],
  }
}

// ── Visual sketches (abstract representations of each template) ────────────────

function BlankSketch() {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <div className="h-px w-full rounded bg-current opacity-10" />
      <div className="h-2 w-8 rounded-sm bg-current opacity-40" />
      <div className="h-1.5 w-full rounded-sm bg-current opacity-10" />
    </div>
  )
}

function NewsletterSketch() {
  return (
    <div className="flex gap-3 py-1">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="h-1.5 w-14 rounded-sm bg-current opacity-40" />
        <div className="h-1 w-10 rounded-sm bg-current opacity-20" />
        <div className="h-1 w-12 rounded-sm bg-current opacity-20" />
        <div className="h-1 w-8 rounded-sm bg-current opacity-20" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="h-1.5 w-16 rounded-sm bg-current opacity-40" />
        <div className="flex gap-1 items-center"><div className="h-1.5 w-1.5 rounded-sm border border-current opacity-30" /><div className="h-1 w-10 rounded-sm bg-current opacity-20" /></div>
        <div className="flex gap-1 items-center"><div className="h-1.5 w-1.5 rounded-sm border border-current opacity-30" /><div className="h-1 w-8 rounded-sm bg-current opacity-20" /></div>
        <div className="flex gap-1 items-center"><div className="h-1.5 w-1.5 rounded-sm border border-current opacity-30" /><div className="h-1 w-12 rounded-sm bg-current opacity-20" /></div>
      </div>
    </div>
  )
}

function EventsSketch() {
  return (
    <div className="flex gap-3 py-1">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="h-1.5 w-14 rounded-sm bg-current opacity-40" />
        <div className="h-1 w-10 rounded-sm bg-current opacity-20" />
        <div className="h-1 w-12 rounded-sm bg-current opacity-20" />
        <div className="h-1 w-8 rounded-sm bg-current opacity-20" />
        <div className="h-1 w-10 rounded-sm bg-current opacity-20" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="h-1.5 w-12 rounded-sm bg-current opacity-40" />
        <div className="flex gap-1 items-center"><div className="h-1.5 w-1.5 rounded-sm border border-current opacity-30" /><div className="h-1 w-14 rounded-sm bg-current opacity-20" /></div>
        <div className="flex gap-1 items-center"><div className="h-1.5 w-1.5 rounded-sm border border-current opacity-30" /><div className="h-1 w-8 rounded-sm bg-current opacity-20" /></div>
        <div className="flex gap-1 items-center"><div className="h-1.5 w-1.5 rounded-sm border border-current opacity-30" /><div className="h-1 w-10 rounded-sm bg-current opacity-20" /></div>
      </div>
    </div>
  )
}

function FullSketch() {
  return (
    <div className="grid grid-cols-3 gap-1.5 py-1">
      {[14, 18, 16, 20, 12, 18].map((w, i) => (
        <div key={i} className="space-y-1">
          <div className="h-1.5 rounded-sm bg-current opacity-40" style={{ width: `${w * 3}px`, maxWidth: '100%' }} />
          <div className="h-1 w-full rounded-sm bg-current opacity-15" />
          <div className="h-1 w-3/4 rounded-sm bg-current opacity-15" />
        </div>
      ))}
    </div>
  )
}

// ── Template card data ─────────────────────────────────────────────────────────

const TEMPLATES: {
  id: string
  name: string
  description: string
  includes: string[]
  make: () => TemplateConfig
  sketch: React.ReactNode
  accent: string
}[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start with a clean slate — just an email field.',
    includes: ['Email field'],
    make: makeBlank,
    sketch: <BlankSketch />,
    accent: 'border-muted-foreground/20 hover:border-muted-foreground/40',
  },
  {
    id: 'newsletter',
    name: 'Newsletter signup',
    description: 'A simple subscribe form with name fields and topic preferences.',
    includes: ['Email, first & last name', 'Newsletter topics category'],
    make: makeNewsletter,
    sketch: <NewsletterSketch />,
    accent: 'border-blue-200 hover:border-blue-400 dark:border-blue-900 dark:hover:border-blue-600',
  },
  {
    id: 'events',
    name: 'Events & webinars',
    description: 'Collect contact details and let subscribers choose which event types interest them.',
    includes: ['Email, name, company, job title', 'Event types category'],
    make: makeEvents,
    sketch: <EventsSketch />,
    accent: 'border-violet-200 hover:border-violet-400 dark:border-violet-900 dark:hover:border-violet-600',
  },
  {
    id: 'full',
    name: 'Full preference centre',
    description: 'A rich, multi-section form with profiling questions, conditional logic, and multiple mailgroup categories.',
    includes: ['3 profile sections', '3 mailgroup categories', 'Conditional visibility rules'],
    make: makeFull,
    sketch: <FullSketch />,
    accent: 'border-emerald-200 hover:border-emerald-400 dark:border-emerald-900 dark:hover:border-emerald-600',
  },
]

// ── Dialog ────────────────────────────────────────────────────────────────────

interface TemplatePickerDialogProps {
  onApply: (config: TemplateConfig) => void
  children: React.ReactNode
}

export function TemplatePickerDialog({ onApply, children }: TemplatePickerDialogProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const handleApply = () => {
    const template = TEMPLATES.find((t) => t.id === selected)
    if (!template) return
    onApply(template.make())
    setOpen(false)
    setSelected(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelected(null) }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            Choose a starting point
          </DialogTitle>
          <DialogDescription>
            Pick a template to pre-fill your form. Every field and category can be customised afterwards.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelected(template.id)}
              className={cn(
                'group flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all',
                selected === template.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : template.accent
              )}
            >
              {/* Mini sketch */}
              <div className="pointer-events-none w-full overflow-hidden rounded-md border bg-muted/40 px-3 py-2 text-foreground">
                {template.sketch}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold">{template.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
              </div>

              <ul className="space-y-0.5">
                {template.includes.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!selected} onClick={handleApply}>
            Use this template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
