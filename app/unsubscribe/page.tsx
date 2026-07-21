import { RequestLinkForm } from '@/components/request-link-form'
import { CentrePageShell } from '@/components/centre-page-shell'

export const metadata = {
  title: 'Unsubscribe - Preference Centre',
  description: 'Request a link to unsubscribe from our communications.',
}

export default function UnsubscribeRequestPage() {
  return (
    <CentrePageShell flowKey="unsubscribeRequest">
      <div className="px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <RequestLinkForm type="unsubscribe" />
        </div>
      </div>
    </CentrePageShell>
  )
}
