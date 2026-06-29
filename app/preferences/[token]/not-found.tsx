'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { defaultStatusPages, type StatusPageContent } from '@/lib/subscription-centre'
import { ensureSeedCentre } from '@/lib/subscription-centre-store'

export default function NotFound() {
  const [content, setContent] = useState<StatusPageContent>(defaultStatusPages.error)

  useEffect(() => {
    setContent(ensureSeedCentre().statusPages.error)
  }, [])

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">{content.heading}</CardTitle>
          <CardDescription className="text-base">{content.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please try using the link from your most recent email, or subscribe again
            below.
          </p>

          <Button asChild className="w-full">
            <Link href="/subscribe">Subscribe Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
