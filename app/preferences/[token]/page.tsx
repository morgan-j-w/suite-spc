import { notFound } from 'next/navigation'
import { getSubscriberByToken } from '@/lib/subscriber-store'
import { ManagePreferencesForm } from '@/components/manage-preferences-form'

export const metadata = {
  title: 'Manage Preferences - Preference Centre',
  description: 'Update your subscription preferences and communication settings.',
}

interface PreferencesPageProps {
  params: Promise<{ token: string }>
}

export default async function PreferencesPage({ params }: PreferencesPageProps) {
  const { token } = await params
  const subscriber = await getSubscriberByToken(token)

  if (!subscriber) {
    notFound()
  }

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Manage Your Preferences
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Update your profile and customise what communications you receive from us.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Subscriber since{' '}
            {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <ManagePreferencesForm subscriber={subscriber} />
      </div>
    </div>
  )
}
