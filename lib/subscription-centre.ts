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
  // Mail groups are organised into folders by an external mailing system this tool doesn't
  // manage — folders are just used here to narrow the list when linking a mailgroup option.
  folder: string
}

export interface StatusPageContent {
  heading: string
  message: string
}

// Grouped by the flow a subscriber is actually in, rather than as one flat list -- each
// flow gets the status content relevant to it (Subscribe only ever shows one outcome,
// while Unsubscribe/Resubscribe each have a prompt and a follow-up confirmation).
export interface StatusPages {
  subscribe: {
    success: StatusPageContent
    alreadySubscribed: StatusPageContent
  }
  managePreferences: {
    saved: StatusPageContent
    notFound: StatusPageContent
  }
  unsubscribe: {
    success: StatusPageContent
    error: StatusPageContent
  }
  resubscribe: {
    prompt: StatusPageContent
    success: StatusPageContent
    error: StatusPageContent
  }
  // The public, no-token entry points where someone who doesn't have their link handy can
  // ask for it again by email -- distinct from unsubscribe/managePreferences above, which
  // assume the subscriber already has their personalised link.
  unsubscribeRequest: {
    intro: StatusPageContent
    sent: StatusPageContent
    alreadyUnsubscribed: StatusPageContent
  }
  manageRequest: {
    intro: StatusPageContent
    sent: StatusPageContent
    alreadyUnsubscribed: StatusPageContent
  }
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
  // The mailgroup every subscriber joins automatically, regardless of which (if any)
  // Mailgroup Category options they pick -- it's never shown as a question on the form,
  // so a centre can have a working subscribe form with no mailgroup categories at all.
  catchAllMailGroupId: string | null
  statusPages: StatusPages
  unsubscribeFeedback: UnsubscribeFeedbackForm
  submitButtonText: string
  // Index into getStylePreviews(themePresetId) — which of the 14 reference styles the
  // submit button's colors are drawn from.
  submitButtonStyleIndex: number
  submitButtonAlignment: SubmitButtonAlignment
  // Controls whether profile fields render stacked (label above input) or inline (label left,
  // input right). formLabelWidth is the label column's percentage width in inline mode.
  formLayout: 'stacked' | 'inline'
  formLabelWidth: number
  createdAt: string
  updatedAt: string
}

export type SubmitButtonAlignment = 'left' | 'center' | 'right' | 'full'

export const defaultSubmitButtonText = 'Submit'
export const defaultSubmitButtonStyleIndex = 0
export const defaultSubmitButtonAlignment: SubmitButtonAlignment = 'left'

export const defaultStatusPages: StatusPages = {
  subscribe: {
    success: {
      heading: "You're all set!",
      message: "Thank you for subscribing. We've sent a confirmation email to your inbox.",
    },
    alreadySubscribed: {
      heading: 'You’re already subscribed',
      message: 'You are already subscribed to communications from us. You may manage your preferences if you wish to update your details or subscriptions.',
    },
  },
  managePreferences: {
    saved: {
      heading: 'Preferences saved',
      message: 'Your preferences have been saved successfully.',
    },
    notFound: {
      heading: 'Subscription Not Found',
      message: "We couldn't find a subscription with this link. The link may have expired or is invalid.",
    },
  },
  unsubscribe: {
    success: {
      heading: "You've been unsubscribed",
      message: "You've been successfully unsubscribed. We're sorry to see you go.",
    },
    error: {
      heading: 'Something went wrong',
      message: 'There has been an error unsubscribing you. Please try again.',
    },
  },
  resubscribe: {
    prompt: {
      heading: 'You are currently unsubscribed',
      message: 'You unsubscribed from our communications. Would you like to resubscribe?',
    },
    success: {
      heading: 'Welcome back!',
      message: 'You have been resubscribed successfully.',
    },
    error: {
      heading: 'Something went wrong',
      message: 'There has been an error resubscribing you. Please try again.',
    },
  },
  unsubscribeRequest: {
    intro: {
      heading: 'Unsubscribe',
      message: 'We will send you an email with a personalised link that will allow you to unsubscribe.',
    },
    sent: {
      heading: 'Check your inbox',
      message: 'To protect your personal information, an email has been sent containing a personalised link that will allow you to unsubscribe.',
    },
    alreadyUnsubscribed: {
      heading: 'Already unsubscribed',
      message: 'You have been previously unsubscribed from all our communications. Please use the subscribe page to resubscribe.',
    },
  },
  manageRequest: {
    intro: {
      heading: 'Manage your preferences',
      message: 'We will send you an email with a personalised link that will allow you to update your details and choose which communications you wish to receive.',
    },
    sent: {
      heading: 'Check your inbox',
      message: 'To protect your personal information, an email has been sent containing a personalised link that will allow you to update your details and choose which communications you wish to receive.',
    },
    alreadyUnsubscribed: {
      heading: 'Already unsubscribed',
      message: 'You have been previously unsubscribed from all our communications. Please use the subscribe page to resubscribe.',
    },
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
    sectionOrder: defaultProfileFieldSections.map((section) => section.id),
    mailGroups: defaultMailGroups.map((group) => ({ ...group })),
    catchAllMailGroupId: null,
    statusPages: { ...defaultStatusPages },
    unsubscribeFeedback: { ...defaultUnsubscribeFeedback, options: defaultUnsubscribeFeedback.options.map((o) => ({ ...o })) },
    submitButtonText: defaultSubmitButtonText,
    submitButtonStyleIndex: defaultSubmitButtonStyleIndex,
    submitButtonAlignment: defaultSubmitButtonAlignment,
    formLayout: 'stacked',
    formLabelWidth: 33,
    createdAt: now,
    updatedAt: now,
  }
}
