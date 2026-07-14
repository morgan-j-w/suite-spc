import Link from 'next/link'
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
          <div className="mb-10 text-center">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Subscribe to Our Updates
            </h1>
            <p className="mt-3 text-pretty text-muted-foreground">
              Stay informed with the latest news, updates, and exclusive content. Customise your preferences to receive
              only what matters to you.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Already a subscriber? You can{' '}
              <Link href="/manage-preferences" className="font-medium underline underline-offset-4">
                manage your preferences
              </Link>{' '}
              or{' '}
              <Link href="/unsubscribe" className="font-medium underline underline-offset-4">
                unsubscribe
              </Link>
              .
            </p>
          </div>
          <SubscriptionForm />
        </div>
      </div>
    </CentrePageShell>
  )
}
