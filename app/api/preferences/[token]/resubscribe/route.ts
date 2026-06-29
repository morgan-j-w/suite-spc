import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberByToken, resubscribe } from '@/lib/subscriber-store'

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    
    // Check subscriber exists
    const subscriber = await getSubscriberByToken(token)
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    // Resubscribe
    const success = await resubscribe(token)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to resubscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully resubscribed',
    })
  } catch (error) {
    console.error('Resubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to process resubscribe request' },
      { status: 500 }
    )
  }
}
