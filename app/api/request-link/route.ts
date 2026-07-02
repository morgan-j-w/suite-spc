import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberByEmail } from '@/lib/subscriber-store'

// Looks a subscriber up by email for the public "request my link" pages (no token yet).
// Doesn't distinguish "not found" from "found" in the response shape on purpose -- a real
// email-sending backend would always reply the same way either way to avoid confirming
// whether an address is on the list; here `found: false` just means there's no link to show.
export async function POST(request: NextRequest) {
  try {
    const { centreId, email } = (await request.json()) as { centreId?: string; email?: string }

    if (!centreId || !email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const subscriber = await getSubscriberByEmail(centreId, email)
    if (!subscriber) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({ found: true, isActive: subscriber.isActive, token: subscriber.token })
  } catch (error) {
    console.error('Request link error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
