import { SubscriptionForm } from '@/components/subscription-form'

export const metadata = {
  title: 'Subscribe - Preference Centre',
  description: 'Subscribe to our communications and customize your preferences.',
}

export default function SubscribePage() {
  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Subscribe to Our Updates
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Stay informed with the latest news, updates, and exclusive content. Customize your preferences to receive
            only what matters to you.
          </p>
        </div>

        <SubscriptionForm />
      </div>
    </div>
  )
}
