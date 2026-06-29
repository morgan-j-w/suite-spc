'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getCentre } from '@/lib/subscription-centre-store'
import { type CategoryAnswers, type SubscriberProfile, buildDefaultAnswers } from '@/lib/subscription-types'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { SubscriptionCentreWidget } from '@/components/subscription-centre-widget'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'

interface BuilderPreviewPageProps {
  params: Promise<{ id: string }>
}

const EMPTY_PROFILE: SubscriberProfile = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  jobTitle: '',
  customFields: {},
}

export default function BuilderPreviewPage({ params }: BuilderPreviewPageProps) {
  const { id } = use(params)
  const [centre, setCentre] = useState<SubscriptionCentre | null | undefined>(undefined)
  const [profile, setProfile] = useState<SubscriberProfile>(EMPTY_PROFILE)
  const [answers, setAnswers] = useState<CategoryAnswers>({})

  useEffect(() => {
    const loaded = getCentre(id)
    setCentre(loaded)
    if (loaded) setAnswers(buildDefaultAnswers(loaded.categories))
  }, [id])

  if (centre === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (centre === null) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-foreground">This subscription centre could not be found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/builder">Back</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href={`/builder/${centre.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Builder
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">Preview — nothing here is saved or submitted</span>
        </div>

        <SubscriptionCentreWidget
          centre={centre}
          profile={profile}
          onProfileChange={setProfile}
          answers={answers}
          onAnswersChange={setAnswers}
        />

        <SubmitButton centre={centre} type="button" onClick={(e) => e.preventDefault()} />
      </div>
    </div>
  )
}
