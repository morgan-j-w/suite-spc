'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ensureSeedCentre } from '@/lib/subscription-centre-store'
import { Loader2 } from 'lucide-react'

// Suite owns the saved library of subscription centres; this tool only edits one at a
// time (embedded as an iframe/modal from Suite). Locally, fall back to the seeded centre.
export default function BuilderEntryPage() {
  const router = useRouter()

  useEffect(() => {
    const centre = ensureSeedCentre()
    router.replace(`/${centre.id}`)
  }, [router])

  return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}
