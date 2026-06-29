import { CategoryAnswers, SubscriberProfile } from './subscription-types'
import { v4 as uuidv4 } from 'uuid'

export interface UnsubscribeFeedbackAnswer {
  reasons: string[]
  otherText?: string
}

// Full subscriber data
export interface Subscriber {
  id: string
  token: string
  centreId: string
  profile: SubscriberProfile
  preferences: CategoryAnswers
  subscribedAt: string
  updatedAt: string
  isActive: boolean
  unsubscribeFeedback?: UnsubscribeFeedbackAnswer
}

// In-memory store for demo purposes — replace with a real database later.
// Pinned to globalThis because Next.js bundles Route Handlers and Page Server
// Components as separate module instances; a plain module-level Map would not
// be shared between e.g. /api/subscribe and the /preferences/[token] page.
const globalForSubscribers = globalThis as unknown as { __subscribers?: Map<string, Subscriber> }
const subscribers = globalForSubscribers.__subscribers ?? new Map<string, Subscriber>()
globalForSubscribers.__subscribers = subscribers

// Helper to generate a unique token for URL access
function generateToken(): string {
  return uuidv4().replace(/-/g, '')
}

// Create a new subscriber
export async function createSubscriber(
  centreId: string,
  profile: SubscriberProfile,
  preferences: CategoryAnswers
): Promise<Subscriber> {
  const id = uuidv4()
  const token = generateToken()
  const now = new Date().toISOString()

  const subscriber: Subscriber = {
    id,
    token,
    centreId,
    profile,
    preferences,
    subscribedAt: now,
    updatedAt: now,
    isActive: true,
  }

  subscribers.set(token, subscriber)
  return subscriber
}

// Get subscriber by token (for URL access)
export async function getSubscriberByToken(token: string): Promise<Subscriber | null> {
  return subscribers.get(token) || null
}

// Get subscriber by email
export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  for (const subscriber of subscribers.values()) {
    if (subscriber.profile.email.toLowerCase() === email.toLowerCase()) {
      return subscriber
    }
  }
  return null
}

// Update subscriber profile
export async function updateSubscriberProfile(
  token: string,
  profile: Partial<SubscriberProfile>
): Promise<Subscriber | null> {
  const subscriber = subscribers.get(token)
  if (!subscriber) return null

  subscriber.profile = { ...subscriber.profile, ...profile }
  subscriber.updatedAt = new Date().toISOString()
  subscribers.set(token, subscriber)
  return subscriber
}

// Update subscription preferences
export async function updateSubscriptionPreferences(
  token: string,
  preferences: CategoryAnswers
): Promise<Subscriber | null> {
  const subscriber = subscribers.get(token)
  if (!subscriber) return null

  subscriber.preferences = preferences
  subscriber.updatedAt = new Date().toISOString()
  subscribers.set(token, subscriber)
  return subscriber
}

// Unsubscribe (soft delete)
export async function unsubscribe(token: string, feedback?: UnsubscribeFeedbackAnswer): Promise<boolean> {
  const subscriber = subscribers.get(token)
  if (!subscriber) return false

  subscriber.isActive = false
  subscriber.updatedAt = new Date().toISOString()
  if (feedback) subscriber.unsubscribeFeedback = feedback
  subscribers.set(token, subscriber)
  return true
}

// Resubscribe
export async function resubscribe(token: string): Promise<boolean> {
  const subscriber = subscribers.get(token)
  if (!subscriber) return false

  subscriber.isActive = true
  subscriber.updatedAt = new Date().toISOString()
  subscribers.set(token, subscriber)
  return true
}
