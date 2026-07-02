'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChevronDown, ChevronRight, MailPlus, MailX, Plus, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import type { StatusPageContent, StatusPages, UnsubscribeFeedbackForm, UnsubscribeFeedbackType } from '@/lib/subscription-centre'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatusPagesEditorProps {
  statusPages: StatusPages
  onStatusPagesChange: (statusPages: StatusPages) => void
  unsubscribeFeedback: UnsubscribeFeedbackForm
  onUnsubscribeFeedbackChange: (feedback: UnsubscribeFeedbackForm) => void
}

interface PageMeta {
  group: keyof StatusPages
  key: string
  title: string
  description: string
}

const GROUPS: { group: keyof StatusPages; title: string; description: string; pages: PageMeta[] }[] = [
  {
    group: 'subscribe',
    title: 'Subscribe',
    description: 'Shown when someone signs up.',
    pages: [
      { group: 'subscribe', key: 'success', title: 'Subscribe Success', description: 'Shown after someone successfully subscribes.' },
      {
        group: 'subscribe',
        key: 'alreadySubscribed',
        title: 'Already Subscribed',
        description: 'Shown when someone tries to subscribe with an email that already has an active subscription.',
      },
    ],
  },
  {
    group: 'managePreferences',
    title: 'Manage Preferences',
    description: 'Shown when someone visits or updates their preferences via their unique link.',
    pages: [
      { group: 'managePreferences', key: 'saved', title: 'Preferences Saved', description: 'Shown after preference changes are saved.' },
      { group: 'managePreferences', key: 'notFound', title: 'Link Not Found', description: 'Shown when a preferences link is invalid or expired.' },
    ],
  },
  {
    group: 'manageRequest',
    title: 'Manage Preferences Request',
    description: "Shown on the public manage-preferences page for someone who doesn't have their personalised link handy.",
    pages: [
      { group: 'manageRequest', key: 'intro', title: 'Request Intro', description: 'Shown before someone enters their email to request a link.' },
      { group: 'manageRequest', key: 'sent', title: 'Link Sent', description: 'Shown after a link has been emailed to them.' },
      {
        group: 'manageRequest',
        key: 'alreadyUnsubscribed',
        title: 'Already Unsubscribed',
        description: 'Shown when the email entered is already unsubscribed from everything.',
      },
    ],
  },
  {
    group: 'unsubscribe',
    title: 'Unsubscribe',
    description: 'Shown when someone opts out of all communications.',
    pages: [
      { group: 'unsubscribe', key: 'success', title: 'Unsubscribe Success', description: 'Shown after someone has been unsubscribed.' },
      { group: 'unsubscribe', key: 'error', title: 'Unsubscribe Error', description: 'Shown if something goes wrong while unsubscribing someone.' },
    ],
  },
  {
    group: 'unsubscribeRequest',
    title: 'Unsubscribe Request',
    description: "Shown on the public unsubscribe page for someone who doesn't have their personalised link handy.",
    pages: [
      { group: 'unsubscribeRequest', key: 'intro', title: 'Request Intro', description: 'Shown before someone enters their email to request a link.' },
      { group: 'unsubscribeRequest', key: 'sent', title: 'Link Sent', description: 'Shown after a link has been emailed to them.' },
      {
        group: 'unsubscribeRequest',
        key: 'alreadyUnsubscribed',
        title: 'Already Unsubscribed',
        description: 'Shown when the email entered is already unsubscribed from everything.',
      },
    ],
  },
  {
    group: 'resubscribe',
    title: 'Resubscribe',
    description: 'Shown when an unsubscribed person comes back.',
    pages: [
      { group: 'resubscribe', key: 'prompt', title: 'Resubscribe Prompt', description: 'Shown when an inactive subscriber opens their preferences link.' },
      { group: 'resubscribe', key: 'success', title: 'Resubscribe Success', description: 'Shown after someone successfully resubscribes.' },
      { group: 'resubscribe', key: 'error', title: 'Resubscribe Error', description: 'Shown if something goes wrong while resubscribing someone.' },
    ],
  },
]

// Icon + color per flow, purely to make the six groups scannable at a glance, grouped by
// category rather than one-color-per-group: Manage Preferences and its Request variant share
// a treatment, as do Unsubscribe and its Request variant -- they're the same outcome, just
// reached with or without a personalised link in hand. Subscribe and Resubscribe each stand
// alone since neither has a "request" counterpart.
const GROUP_STYLES: Record<keyof StatusPages, { icon: typeof MailPlus; iconBg: string; iconColor: string; border: string }> = {
  subscribe: { icon: MailPlus, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-400' },
  managePreferences: { icon: SlidersHorizontal, iconBg: 'bg-blue-100 dark:bg-blue-950', iconColor: 'text-blue-600 dark:text-blue-400', border: 'border-l-blue-400' },
  manageRequest: { icon: SlidersHorizontal, iconBg: 'bg-blue-100 dark:bg-blue-950', iconColor: 'text-blue-600 dark:text-blue-400', border: 'border-l-blue-400' },
  unsubscribe: { icon: MailX, iconBg: 'bg-red-100 dark:bg-red-950', iconColor: 'text-red-600 dark:text-red-400', border: 'border-l-red-400' },
  unsubscribeRequest: { icon: MailX, iconBg: 'bg-red-100 dark:bg-red-950', iconColor: 'text-red-600 dark:text-red-400', border: 'border-l-red-400' },
  resubscribe: { icon: RotateCcw, iconBg: 'bg-violet-100 dark:bg-violet-950', iconColor: 'text-violet-600 dark:text-violet-400', border: 'border-l-violet-400' },
}

const FEEDBACK_TYPE_OPTIONS: { value: UnsubscribeFeedbackType; label: string }[] = [
  { value: 'checkbox', label: 'Checkbox (pick any)' },
  { value: 'radio', label: 'Radio (pick one)' },
]

export function StatusPagesEditor({
  statusPages,
  onStatusPagesChange,
  unsubscribeFeedback,
  onUnsubscribeFeedbackChange,
}: StatusPagesEditorProps) {
  // Collapsed by default so the four flows are scannable at a glance -- expand only the
  // one you actually want to edit rather than scrolling past everything else.
  const [expandedGroups, setExpandedGroups] = useState<Set<keyof StatusPages>>(new Set())

  const toggleGroup = (group: keyof StatusPages) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const getPage = (group: keyof StatusPages, key: string): StatusPageContent =>
    (statusPages[group] as Record<string, StatusPageContent>)[key]

  const updatePage = (group: keyof StatusPages, key: string, field: 'heading' | 'message', value: string) => {
    onStatusPagesChange({
      ...statusPages,
      [group]: { ...statusPages[group], [key]: { ...getPage(group, key), [field]: value } },
    })
  }

  const updateFeedbackOption = (key: string, label: string) => {
    onUnsubscribeFeedbackChange({
      ...unsubscribeFeedback,
      options: unsubscribeFeedback.options.map((o) => (o.key === key ? { ...o, label } : o)),
    })
  }

  const addFeedbackOption = () => {
    onUnsubscribeFeedbackChange({
      ...unsubscribeFeedback,
      options: [...unsubscribeFeedback.options, { key: uuidv4(), label: '' }],
    })
  }

  const removeFeedbackOption = (key: string) => {
    onUnsubscribeFeedbackChange({
      ...unsubscribeFeedback,
      options: unsubscribeFeedback.options.filter((o) => o.key !== key),
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Status Pages</h2>
        <p className="text-sm text-muted-foreground">Edit the heading and message shown at each step of the subscribe, manage, and unsubscribe flows.</p>
      </div>

      {GROUPS.map(({ group, title, description, pages }) => {
        const isOpen = expandedGroups.has(group)
        const style = GROUP_STYLES[group]
        return (
          <div key={group} className="rounded-lg border bg-card">
            <button
              type="button"
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/40"
              onClick={() => toggleGroup(group)}
            >
              {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <span className="text-muted-foreground" aria-hidden>·</span>
                  <span className="text-xs text-muted-foreground">
                    {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                  </span>
                </div>
                {isOpen && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', style.iconBg)}>
                <style.icon className={cn('h-4 w-4', style.iconColor)} />
              </div>
            </button>
            {isOpen && (
              <div className="space-y-4 border-t bg-muted/20 p-4">
                {pages.map(({ key, title: pageTitle, description: pageDescription }, pageIndex) => {
                  const page = getPage(group, key)
                  const fieldId = `${group}-${key}`
                  return (
                    <Card key={fieldId}>
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold', style.iconBg, style.iconColor)}>
                            {pageIndex + 1}
                          </span>
                          <div>
                            <CardTitle className="text-base">{pageTitle}</CardTitle>
                            <CardDescription className="mt-0.5">{pageDescription}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`${fieldId}-heading`}>Heading</Label>
                          <Input
                            id={`${fieldId}-heading`}
                            value={page.heading}
                            onChange={(e) => updatePage(group, key, 'heading', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${fieldId}-message`}>Message</Label>
                          <Textarea
                            id={`${fieldId}-message`}
                            value={page.message}
                            onChange={(e) => updatePage(group, key, 'message', e.target.value)}
                            rows={2}
                          />
                        </div>

                        {group === 'unsubscribe' && key === 'success' && (
                          <div className="space-y-4 rounded-lg border bg-muted/30 p-3">
                            <div>
                              <h4 className="text-sm font-semibold">Unsubscribe Feedback</h4>
                              <p className="text-sm text-muted-foreground">
                                Optionally ask someone why they&apos;re leaving before they confirm.
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <Label htmlFor="unsubscribe-feedback-toggle" className="cursor-pointer">
                                Ask for feedback before unsubscribing
                              </Label>
                              <Switch
                                id="unsubscribe-feedback-toggle"
                                checked={unsubscribeFeedback.enabled}
                                onCheckedChange={(enabled) => onUnsubscribeFeedbackChange({ ...unsubscribeFeedback, enabled })}
                              />
                            </div>

                            {unsubscribeFeedback.enabled && (
                              <>
                                <div className="space-y-2">
                                  <Label>Answer type</Label>
                                  <div className="flex gap-1">
                                    {FEEDBACK_TYPE_OPTIONS.map((option) => (
                                      <Button
                                        key={option.value}
                                        type="button"
                                        variant={unsubscribeFeedback.type === option.value ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(unsubscribeFeedback.type === option.value && 'pointer-events-none')}
                                        onClick={() => onUnsubscribeFeedbackChange({ ...unsubscribeFeedback, type: option.value })}
                                      >
                                        {option.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Answers</Label>
                                  <div className="space-y-2">
                                    {unsubscribeFeedback.options.map((option) => (
                                      <div key={option.key} className="flex items-center gap-2">
                                        <Input
                                          value={option.label}
                                          onChange={(e) => updateFeedbackOption(option.key, e.target.value)}
                                          placeholder="e.g., Too many emails"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                          onClick={() => removeFeedbackOption(option.key)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addFeedbackOption}>
                                    <Plus className="h-4 w-4" />
                                    Add Answer
                                  </Button>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                  <Label htmlFor="unsubscribe-feedback-other" className="cursor-pointer">
                                    Include &quot;Other&quot; with a free-text box
                                  </Label>
                                  <Switch
                                    id="unsubscribe-feedback-other"
                                    checked={unsubscribeFeedback.allowOther}
                                    onCheckedChange={(allowOther) => onUnsubscribeFeedbackChange({ ...unsubscribeFeedback, allowOther })}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
