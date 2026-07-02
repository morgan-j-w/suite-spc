'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Subscriber } from '@/lib/subscriber-store'
import { SubscriberProfile, CategoryAnswers, flattenProfileFields, isCategoryAnswered, isCategoryVisible, isProfileFieldAnswered, isProfileFieldVisible } from '@/lib/subscription-types'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { ensureSeedCentre, getCentre } from '@/lib/subscription-centre-store'
import { SubscriptionCentreWidget } from '@/components/subscription-centre-widget'
import { Button } from '@/components/ui/button'
import { Save, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ManagePreferencesFormProps {
  subscriber: Subscriber
}

export function ManagePreferencesForm({ subscriber: initialSubscriber }: ManagePreferencesFormProps) {
  const [subscriber, setSubscriber] = useState(initialSubscriber)
  const [centre, setCentre] = useState<SubscriptionCentre | null>(null)
  const [profile, setProfile] = useState<SubscriberProfile>(initialSubscriber.profile)
  const [answers, setAnswers] = useState<CategoryAnswers>(initialSubscriber.preferences)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCentre(getCentre(subscriber.centreId) || ensureSeedCentre())
  }, [subscriber.centreId])

  if (!centre) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isFormValid =
    flattenProfileFields(centre.profileFieldSections)
      .filter((field) => isProfileFieldVisible(field, profile))
      .every((field) => !field.required || isProfileFieldAnswered(field, profile)) &&
    centre.categories
      .filter((category) => isCategoryVisible(category, profile, answers))
      .every((category) => !category.required || isCategoryAnswered(category, answers))

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/preferences/${subscriber.token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, preferences: answers }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences')
      }

      setSuccessMessage(centre.statusPages.managePreferences.saved.message)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResubscribe = async () => {
    setError(null)

    try {
      const response = await fetch(`/api/preferences/${subscriber.token}/resubscribe`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resubscribe')
      }

      setSubscriber((prev) => ({ ...prev, isActive: true }))
      setSuccessMessage(centre.statusPages.resubscribe.success.message)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch {
      setError(centre.statusPages.resubscribe.error.message)
    }
  }

  if (!subscriber.isActive) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-left text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}
        <div className="rounded-lg border bg-card p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-semibold">{centre.statusPages.resubscribe.prompt.heading}</h2>
          <p className="mt-2 text-muted-foreground">{centre.statusPages.resubscribe.prompt.message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={handleResubscribe}>Resubscribe</Button>
            <Button variant="outline" asChild>
              <Link href="/subscribe">Subscribe with new preferences</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div role="form" aria-label="Manage your preferences" className="sc-form">
        <SubscriptionCentreWidget
          centre={centre}
          profile={profile}
          onProfileChange={setProfile}
          answers={answers}
          onAnswersChange={setAnswers}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <Button variant="destructive" asChild>
          <Link href={`/preferences/${subscriber.token}/unsubscribe`}>Unsubscribe from all</Link>
        </Button>

        <Button onClick={handleSave} disabled={isSaving || !isFormValid}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
