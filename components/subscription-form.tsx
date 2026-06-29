'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SubscriberProfile, CategoryAnswers, buildDefaultAnswers, flattenProfileFields, isCategoryAnswered, isCategoryVisible, isProfileFieldAnswered, isProfileFieldVisible } from '@/lib/subscription-types'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { ensureSeedCentre } from '@/lib/subscription-centre-store'
import { SubscriptionCentreWidget } from '@/components/subscription-centre-widget'
import { SubmitButton } from '@/components/submit-button'
import { Loader2 } from 'lucide-react'

const EMPTY_PROFILE: SubscriberProfile = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  jobTitle: '',
  customFields: {},
}

export function SubscriptionForm() {
  const router = useRouter()
  const [centre, setCentre] = useState<SubscriptionCentre | null>(null)
  const [profile, setProfile] = useState<SubscriberProfile>(EMPTY_PROFILE)
  const [answers, setAnswers] = useState<CategoryAnswers>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const active = ensureSeedCentre()
    setCentre(active)
    setAnswers(buildDefaultAnswers(active.categories))
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centreId: centre.id, profile, preferences: answers }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      router.push(`/subscribe/success?token=${data.token}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      <SubscriptionCentreWidget
        centre={centre}
        profile={profile}
        onProfileChange={setProfile}
        answers={answers}
        onAnswersChange={setAnswers}
      />

      {error && <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      <SubmitButton centre={centre} disabled={isSubmitting || !isFormValid} isSubmitting={isSubmitting} />
    </form>
  )
}
