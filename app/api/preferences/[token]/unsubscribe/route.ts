import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberByToken, unsubscribe, type UnsubscribeFeedbackAnswer } from '@/lib/subscriber-store'

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

    const body = await request.json().catch(() => ({}))
    const feedback = body?.feedback as UnsubscribeFeedbackAnswer | undefined

    // Unsubscribe
    const success = await unsubscribe(token, feedback)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    )
  }
}
