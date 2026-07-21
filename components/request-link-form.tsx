'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, MailCheck, AlertTriangle } from 'lucide-react'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { ensureSeedCentre } from '@/lib/subscription-centre-store'
import { SubmitButton } from '@/components/submit-button'

interface RequestLinkFormProps {
  type: 'unsubscribe' | 'manage'
}

interface RequestLinkResult {
  found: boolean
  isActive?: boolean
  token?: string
}

// Public, no-token entry point for someone who doesn't have their personalised link handy.
// There's no real email system here, so once a link is "sent" it's shown directly on screen
// instead -- same convention the subscribe success page already uses for this prototype.
export function RequestLinkForm({ type }: RequestLinkFormProps) {
  const [centre, setCentre] = useState<SubscriptionCentre | null>(null)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<RequestLinkResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCentre(ensureSeedCentre())
  }, [])

  if (!centre) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const content = type === 'unsubscribe' ? centre.statusPages.unsubscribeRequest : centre.statusPages.manageRequest

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centreId: centre.id, email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResult(data as RequestLinkResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result?.found && result.isActive === false) {
    const alreadyContent = content.alreadyUnsubscribed
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle>{alreadyContent.heading}</CardTitle>
          <CardDescription>{alreadyContent.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <SubmitButton centre={centre} label="Go to Subscribe" type="button" onClick={() => { window.location.href = '/subscribe' }} />
        </CardContent>
      </Card>
    )
  }

  if (result) {
    const sentContent = content.sent
    const linkPath = result.token ? (type === 'unsubscribe' ? `/preferences/${result.token}/unsubscribe` : `/preferences/${result.token}`) : null
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
            <MailCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle>{sentContent.heading}</CardTitle>
          <CardDescription className="text-balance">{sentContent.message}</CardDescription>
        </CardHeader>
        {linkPath && (
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-left">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Your Personalised Link</p>
              <code className="block break-all text-sm text-foreground">{linkPath}</code>
            </div>
            <SubmitButton centre={centre} label="Open Link" type="button" onClick={() => { window.location.href = linkPath }} />
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle>{content.intro.heading}</CardTitle>
        <CardDescription>{content.intro.message}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request-link-email">Email</Label>
            <Input
              id="request-link-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <SubmitButton centre={centre} label="Send Me The Link" isSubmitting={isSubmitting} />
        </form>
      </CardContent>
    </Card>
  )
}
