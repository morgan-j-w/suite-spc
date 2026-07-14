import { RequestLinkForm } from '@/components/request-link-form'
import { CentrePageShell } from '@/components/centre-page-shell'

export const metadata = {
  title: 'Manage Preferences - Preference Centre',
  description: 'Request a link to manage your communication preferences.',
}

export default function ManagePreferencesRequestPage() {
  return (
    <CentrePageShell>
      <div className="px-4 py-12">
        <RequestLinkForm type="manage" />
      </div>
    </CentrePageShell>
  )
}
