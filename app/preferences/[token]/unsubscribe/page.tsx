'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, MailX, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react'
import type { Subscriber } from '@/lib/subscriber-store'
import { defaultStatusPages, defaultUnsubscribeFeedback, type StatusPageContent, type UnsubscribeFeedbackForm } from '@/lib/subscription-centre'
import { ensureSeedCentre, getCentre } from '@/lib/subscription-centre-store'

interface UnsubscribePageProps {
  params: Promise<{ token: string }>
}

export default function UnsubscribePage({ params }: UnsubscribePageProps) {
  const { token } = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnsubscribed, setIsUnsubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriberEmail, setSubscriberEmail] = useState<string>('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [unsubscribeContent, setUnsubscribeContent] = useState<StatusPageContent>(defaultStatusPages.unsubscribeConfirm)
  const [errorContent, setErrorContent] = useState<StatusPageContent>(defaultStatusPages.error)
  const [feedbackConfig, setFeedbackConfig] = useState<UnsubscribeFeedbackForm>(defaultUnsubscribeFeedback)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [otherText, setOtherText] = useState('')

  useEffect(() => {
    const fetchSubscriber = async () => {
      try {
        const response = await fetch(`/api/preferences/${token}`)
        if (!response.ok) {
          setErrorContent(ensureSeedCentre().statusPages.error)
          if (response.status === 404) {
            setError('Subscription not found. The link may be invalid or expired.')
          } else {
            setError('Failed to load subscription details.')
          }
          return
        }
        const { subscriber } = (await response.json()) as { subscriber: Subscriber }
        setSubscriberEmail(subscriber.profile.email)
        const centre = getCentre(subscriber.centreId) || ensureSeedCentre()
        setUnsubscribeContent(centre.statusPages.unsubscribeConfirm)
        setFeedbackConfig(centre.unsubscribeFeedback)
        if (!subscriber.isActive) {
          setIsUnsubscribed(true)
        }
      } catch {
        setError('Something went wrong. Please try again later.')
        setErrorContent(ensureSeedCentre().statusPages.error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriber()
  }, [token])

  const handleUnsubscribe = async () => {
    if (!confirmChecked) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/preferences/${token}/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackConfig.enabled
            ? { reasons: selectedReasons, otherText: otherText.trim() || undefined }
            : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unsubscribe')
      }

      setIsUnsubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (error && !subscriberEmail) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>{errorContent.heading}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/subscribe">Subscribe Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isUnsubscribed) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>You&apos;ve been unsubscribed</CardTitle>
            <CardDescription className="text-balance">
              {subscriberEmail} has been removed from all mailing lists. We&apos;re sorry to see you go.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-sm text-muted-foreground">
              Changed your mind? You can resubscribe at any time.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline">
                <Link href={`/preferences/${token}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Manage Preferences
                </Link>
              </Button>
              <Button asChild>
                <Link href="/subscribe">Resubscribe</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <MailX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>{unsubscribeContent.heading}</CardTitle>
          <CardDescription className="text-balance">
            {unsubscribeContent.message} You are about to unsubscribe{' '}
            <span className="font-medium text-foreground">{subscriberEmail}</span> from all our communications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              If you just want to reduce the number of emails you receive, you can{' '}
              <Link href={`/preferences/${token}`} className="font-medium underline underline-offset-4">
                manage your preferences
              </Link>{' '}
              instead.
            </p>
          </div>

          {feedbackConfig.enabled && (
            <div className="space-y-3 rounded-lg border p-4 text-left">
              <Label className="text-sm font-medium">Before you go, can you tell us why?</Label>
              {feedbackConfig.type === 'checkbox' ? (
                <div className="space-y-2">
                  {feedbackConfig.options.map((option) => (
                    <div key={option.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`feedback-${option.key}`}
                        checked={selectedReasons.includes(option.key)}
                        onCheckedChange={(checked) =>
                          setSelectedReasons((prev) =>
                            checked ? [...prev, option.key] : prev.filter((key) => key !== option.key)
                          )
                        }
                      />
                      <Label htmlFor={`feedback-${option.key}`} className="cursor-pointer text-sm font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup value={selectedReasons[0] || ''} onValueChange={(value) => setSelectedReasons([value])}>
                  <div className="space-y-2">
                    {feedbackConfig.options.map((option) => (
                      <div key={option.key} className="flex items-center gap-2">
                        <RadioGroupItem value={option.key} id={`feedback-${option.key}`} />
                        <Label htmlFor={`feedback-${option.key}`} className="cursor-pointer text-sm font-normal">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
              {feedbackConfig.allowOther && (
                <div className="space-y-1">
                  <Label htmlFor="feedback-other" className="text-sm font-normal text-muted-foreground">
                    Other
                  </Label>
                  <Input
                    id="feedback-other"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Tell us more (optional)"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-3">
            <Checkbox
              id="confirm"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
            />
            <Label htmlFor="confirm" className="cursor-pointer text-sm leading-relaxed">
              I understand that I will stop receiving all emails, including important updates and notifications.
            </Label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/preferences/${token}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleUnsubscribe}
              disabled={!confirmChecked || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unsubscribing...
                </>
              ) : (
                'Unsubscribe'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
