import { notFound } from 'next/navigation'
import { getSubscriberByToken } from '@/lib/subscriber-store'
import { ManagePreferencesForm } from '@/components/manage-preferences-form'
import { CentrePageShell } from '@/components/centre-page-shell'

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
    <CentrePageShell flowKey="managePreferences">
      <div className="px-4 py-8">
        <ManagePreferencesForm subscriber={subscriber} />
      </div>
    </CentrePageShell>
  )
}
