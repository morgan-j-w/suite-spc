import { NextRequest, NextResponse } from 'next/server'
import { createSubscriber, getSubscriberByEmail } from '@/lib/subscriber-store'
import { CategoryAnswers, SubscriberProfile } from '@/lib/subscription-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { centreId, profile, preferences } = body as {
      centreId: string
      profile: SubscriberProfile
      preferences: CategoryAnswers
    }

    // Validate required fields
    if (!profile.email || !profile.firstName || !profile.lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingSubscriber = await getSubscriberByEmail(profile.email)
    if (existingSubscriber) {
      return NextResponse.json(
        { 
          error: 'This email is already subscribed',
          token: existingSubscriber.token 
        },
        { status: 409 }
      )
    }

    // Create the subscriber
    const subscriber = await createSubscriber(centreId, profile, preferences)

    return NextResponse.json({
      success: true,
      token: subscriber.token,
      message: 'Successfully subscribed!',
    })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}
