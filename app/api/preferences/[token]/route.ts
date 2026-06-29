import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberByToken, updateSubscriberProfile, updateSubscriptionPreferences } from '@/lib/subscriber-store'
import { CategoryAnswers, SubscriberProfile } from '@/lib/subscription-types'

interface RouteParams {
  params: Promise<{ token: string }>
}

// GET - Retrieve subscriber preferences
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const subscriber = await getSubscriberByToken(token)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ subscriber })
  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve preferences' },
      { status: 500 }
    )
  }
}

// PUT - Update subscriber profile and preferences
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const body = await request.json()
    const { profile, preferences } = body as {
      profile: SubscriberProfile
      preferences: CategoryAnswers
    }

    // Check subscriber exists
    const existingSubscriber = await getSubscriberByToken(token)
    if (!existingSubscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    // Update profile
    if (profile) {
      await updateSubscriberProfile(token, profile)
    }

    // Update preferences
    if (preferences) {
      await updateSubscriptionPreferences(token, preferences)
    }

    // Get updated subscriber
    const subscriber = await getSubscriberByToken(token)

    return NextResponse.json({
      success: true,
      subscriber,
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
