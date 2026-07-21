import { NextRequest, NextResponse } from 'next/server'
import { createSubscriber, getSubscriberByEmail } from '@/lib/subscriber-store'
import { buildDefaultAnswers } from '@/lib/subscription-types'
import { getCentre } from '@/lib/subscription-centre-store'

const DEMO_EMAIL = 'preview@spc-builder.local'

// Returns (or creates) a stable demo subscriber for the given centre so the builder's
// "View Live" panel can link to personalised pages like /preferences/[token].
export async function GET(request: NextRequest) {
  const centreId = request.nextUrl.searchParams.get('centreId')
  if (!centreId) {
    return NextResponse.json({ error: 'centreId required' }, { status: 400 })
  }

  const existing = await getSubscriberByEmail(centreId, DEMO_EMAIL)
  if (existing) {
    return NextResponse.json({ token: existing.token })
  }

  const centre = getCentre(centreId)
  const defaultAnswers = centre ? buildDefaultAnswers(centre.categories) : {}

  const subscriber = await createSubscriber(
    centreId,
    {
      email: DEMO_EMAIL,
      firstName: 'Preview',
      lastName: 'User',
      phone: '',
      company: '',
      jobTitle: '',
      customFields: {},
    },
    defaultAnswers
  )

  return NextResponse.json({ token: subscriber.token })
}
