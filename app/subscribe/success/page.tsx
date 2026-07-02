'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Subscriber } from '@/lib/subscriber-store'
import { defaultStatusPages, type StatusPageContent } from '@/lib/subscription-centre'
import { ensureSeedCentre, getCentre } from '@/lib/subscription-centre-store'

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [content, setContent] = useState<StatusPageContent>(defaultStatusPages.subscribe.success)
  const [isLoading, setIsLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    fetch(`/api/preferences/${token}`)
      .then(async (response) => {
        if (!response.ok) return
        const { subscriber } = (await response.json()) as { subscriber: Subscriber }
        const centre = getCentre(subscriber.centreId) || ensureSeedCentre()
        if (!cancelled) setContent(centre.statusPages.subscribe.success)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl">{content.heading}</CardTitle>
          <CardDescription className="text-base">{content.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can update your preferences anytime using the link below or the link in any of our emails.
          </p>

          {token && (
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Your Preferences Link
              </p>
              <code className="block break-all text-sm text-foreground">/preferences/{token}</code>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            {token && (
              <Button asChild>
                <Link href={`/preferences/${token}`}>
                  Manage Preferences
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/subscribe">Subscribe Another Email</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  )
}
