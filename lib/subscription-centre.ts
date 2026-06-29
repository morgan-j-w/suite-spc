import { v4 as uuidv4 } from 'uuid'
import type { ColorTheme } from '@/lib/brand-config'
import { defaultTheme } from '@/lib/brand-config'
import {
  type Category,
  type ProfileFieldSection,
  defaultCategories,
  defaultProfileFieldSections,
} from '@/lib/subscription-types'

export interface MailGroup {
  id: string
  name: string
  // Mail groups are organized into folders by an external mailing system this tool doesn't
  // manage — folders are just used here to narrow the list when linking a mailgroup option.
  folder: string
}

export interface StatusPageContent {
  heading: string
  message: string
}

export interface StatusPages {
  success: StatusPageContent
  alreadyUnsubscribed: StatusPageContent
  unsubscribeConfirm: StatusPageContent
  error: StatusPageContent
}

export interface UnsubscribeFeedbackOption {
  key: string
  label: string
}

export type UnsubscribeFeedbackType = 'checkbox' | 'radio'

// Optional feedback form shown on the unsubscribe confirmation page, asking why the
// subscriber is leaving before they confirm.
export interface UnsubscribeFeedbackForm {
  enabled: boolean
  type: UnsubscribeFeedbackType
  options: UnsubscribeFeedbackOption[]
  allowOther: boolean
}

export interface SubscriptionCentre {
  id: string
  name: string
  themePresetId: ColorTheme
  profileFieldSections: ProfileFieldSection[]
  categories: Category[]
  // Combined display/drag order across profileFieldSections and categories, by id. Lets a
  // Form Fields section sit above one mail group and below another.
  sectionOrder: string[]
  mailGroups: MailGroup[]
  statusPages: StatusPages
  unsubscribeFeedback: UnsubscribeFeedbackForm
  submitButtonText: string
  // Index into getStylePreviews(themePresetId) — which of the 14 reference styles the
  // submit button's colors are drawn from.
  submitButtonStyleIndex: number
  submitButtonAlignment: SubmitButtonAlignment
  createdAt: string
  updatedAt: string
}

export type SubmitButtonAlignment = 'left' | 'center' | 'right' | 'full'

export const defaultSubmitButtonText = 'Submit'
export const defaultSubmitButtonStyleIndex = 0
export const defaultSubmitButtonAlignment: SubmitButtonAlignment = 'right'

export const defaultStatusPages: StatusPages = {
  success: {
    heading: "You're all set!",
    message: "Thank you for subscribing. We've sent a confirmation email to your inbox.",
  },
  alreadyUnsubscribed: {
    heading: 'You are currently unsubscribed',
    message: 'You unsubscribed from our communications. Would you like to resubscribe?',
  },
  unsubscribeConfirm: {
    heading: 'Unsubscribe',
    message: 'We are sorry to see you go.',
  },
  error: {
    heading: 'Subscription Not Found',
    message: "We couldn't find a subscription with this link. The link may have expired or is invalid.",
  },
}

export const defaultUnsubscribeFeedback: UnsubscribeFeedbackForm = {
  enabled: false,
  type: 'checkbox',
  options: [
    { key: 'too-many-emails', label: 'I receive too many emails' },
    { key: 'not-relevant', label: 'The content is not relevant to me' },
    { key: 'never-signed-up', label: "I don't remember signing up for this" },
  ],
  allowOther: true,
}

export const defaultMailGroups: MailGroup[] = [
  { id: 'general-news', name: 'General News', folder: 'Marketing' },
  { id: 'weekly-digest', name: 'Weekly Digest', folder: 'Marketing' },
  { id: 'product-announcements', name: 'Product Announcements', folder: 'Product' },
  { id: 'beta-program', name: 'Beta Program Updates', folder: 'Product' },
  { id: 'partner-offers', name: 'Partner Offers', folder: 'Partnerships' },
  { id: 'affiliate-program', name: 'Affiliate Program', folder: 'Partnerships' },
]

export function createSubscriptionCentre(name: string): SubscriptionCentre {
  const now = new Date().toISOString()

  return {
    id: uuidv4(),
    name,
    themePresetId: defaultTheme,
    profileFieldSections: defaultProfileFieldSections.map((section) => ({ ...section, fields: [...section.fields] })),
    categories: defaultCategories.map((category) => ({ ...category })),
    sectionOrder: [],
    mailGroups: defaultMailGroups.map((group) => ({ ...group })),
    statusPages: { ...defaultStatusPages },
    unsubscribeFeedback: { ...defaultUnsubscribeFeedback, options: defaultUnsubscribeFeedback.options.map((o) => ({ ...o })) },
    submitButtonText: defaultSubmitButtonText,
    submitButtonStyleIndex: defaultSubmitButtonStyleIndex,
    submitButtonAlignment: defaultSubmitButtonAlignment,
    createdAt: now,
    updatedAt: now,
  }
}
