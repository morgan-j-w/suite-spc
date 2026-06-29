'use client'

import { v4 as uuidv4 } from 'uuid'
import { Plus, X } from 'lucide-react'
import type { StatusPages, UnsubscribeFeedbackForm, UnsubscribeFeedbackType } from '@/lib/subscription-centre'
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

const STATUS_PAGE_META: { key: keyof StatusPages; title: string; description: string }[] = [
  { key: 'success', title: 'Subscribe Success', description: 'Shown after someone successfully subscribes.' },
  { key: 'alreadyUnsubscribed', title: 'Already Unsubscribed', description: 'Shown when an inactive subscriber opens their preferences link.' },
  { key: 'unsubscribeConfirm', title: 'Unsubscribe Confirmation', description: 'Shown before someone confirms they want to unsubscribe.' },
  { key: 'error', title: 'Link Not Found', description: 'Shown when a preferences link is invalid or expired.' },
]

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
  const updatePage = (key: keyof StatusPages, field: 'heading' | 'message', value: string) => {
    onStatusPagesChange({ ...statusPages, [key]: { ...statusPages[key], [field]: value } })
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
    <div className="space-y-4">
      {STATUS_PAGE_META.map(({ key, title, description }) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`${key}-heading`}>Heading</Label>
              <Input id={`${key}-heading`} value={statusPages[key].heading} onChange={(e) => updatePage(key, 'heading', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${key}-message`}>Message</Label>
              <Textarea
                id={`${key}-message`}
                value={statusPages[key].message}
                onChange={(e) => updatePage(key, 'message', e.target.value)}
                rows={2}
              />
            </div>

            {key === 'unsubscribeConfirm' && (
              <div className="space-y-4 rounded-lg border bg-muted/30 p-3">
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
      ))}
    </div>
  )
}
