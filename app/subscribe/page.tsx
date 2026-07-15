import { SubscriptionForm } from '@/components/subscription-form'
import { CentrePageShell } from '@/components/centre-page-shell'

export const metadata = {
  title: 'Subscribe - Preference Centre',
  description: 'Subscribe to our communications and customise your preferences.',
}

export default function SubscribePage() {
  return (
    <CentrePageShell>
      <div className="px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <SubscriptionForm />
        </div>
      </div>
    </CentrePageShell>
  )
}
