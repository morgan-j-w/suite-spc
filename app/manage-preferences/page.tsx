import { RequestLinkForm } from '@/components/request-link-form'

export const metadata = {
  title: 'Manage Preferences - Preference Centre',
  description: 'Request a link to manage your communication preferences.',
}

export default function ManagePreferencesRequestPage() {
  return (
    <div className="px-4 py-12">
      <RequestLinkForm type="manage" />
    </div>
  )
}
