'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from '@/components/submit-button'
import { defaultStatusPages, type StatusPageContent, type SubscriptionCentre } from '@/lib/subscription-centre'
import { ensureSeedCentre } from '@/lib/subscription-centre-store'

export default function NotFound() {
  const [content, setContent] = useState<StatusPageContent>(defaultStatusPages.managePreferences.notFound)
  const [centre, setCentre] = useState<SubscriptionCentre>(ensureSeedCentre())

  useEffect(() => {
    const c = ensureSeedCentre()
    setCentre(c)
    setContent(c.statusPages.managePreferences.notFound)
  }, [])

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card className="w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl">{content.heading}</CardTitle>
            <CardDescription className="text-base">{content.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please try using the link from your most recent email, or subscribe again below.
            </p>
            <SubmitButton
              centre={centre}
              label="Subscribe Again"
              type="button"
              onClick={() => { window.location.href = '/subscribe' }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
