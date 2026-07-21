import { v4 as uuidv4 } from 'uuid'
import type { ColorTheme } from '@/lib/brand-config'
import { defaultTheme } from '@/lib/brand-config'
import {
  type Category,
  type ProfileFieldSection,
  defaultCategories,
  defaultProfileFieldSections,
} from '@/lib/subscription-types'

export interface EmailTemplate {
  subject: string
  previewText: string
  bodyHtml: string
}

export type EmailBannerLayout = 'logo-centered' | 'logo-left' | 'heading-band'
export type EmailFooterLayout = 'minimal' | 'links-copyright' | 'address-footer'

export interface EmailConfig {
  // Shared banner/footer rendered in every outbound email (650px width).
  bannerEnabled?: boolean
  bannerHtml: string
  bannerHeading?: string     // editable heading for text-based banner layouts
  bannerSubheading?: string  // editable subheading / tagline
  footerEnabled?: boolean
  footerHtml: string
  emailBodyBgColor?: string      // outer wrapper background shown around the 650px email body
  emailContainerBgColor?: string // background of the 650px content card itself (default white)
  emailTextColor?: string        // body text colour
  emailLinkColor?: string        // link colour within the body content
  emailButtonBgColor?: string    // "Insert button" CTA background
  emailButtonTextColor?: string  // "Insert button" CTA text
  // Email layout selection — drives the layout picker UI and "Populate from layout" generator.
  bannerLayout?: EmailBannerLayout
  bannerBgColor?: string
  bannerTextColor?: string
  bannerLinkColor?: string
  bannerCustomCss?: string
  bannerLogoMaxWidth?: number
  bannerLogoMaxHeight?: number
  bannerLogoPosition?: 'left' | 'center' | 'right'
  footerLayout?: EmailFooterLayout
  footerBgColor?: string
  footerTextColor?: string
  footerLinkColor?: string
  footerCustomCss?: string
  footerLogoMaxWidth?: number
  footerLogoMaxHeight?: number
  footerLogoPosition?: 'left' | 'center' | 'right'
  doubleOptIn: EmailTemplate
  confirmation: EmailTemplate
  unsubscribed: EmailTemplate
}

export const defaultEmailConfig: EmailConfig = {
  bannerHtml: '',
  footerHtml: '',
  doubleOptIn: {
    subject: 'Please confirm your email address',
    previewText: 'Click to confirm your email address and complete your subscription.',
    bodyHtml: '<p>Thank you for subscribing! Please click the button below to confirm your email address and complete your registration.</p>',
  },
  confirmation: {
    subject: "You're now subscribed",
    previewText: "You've successfully subscribed to our communications.",
    bodyHtml: "<p>You've successfully subscribed to our communications. We're glad to have you!</p><p>You can manage your preferences or unsubscribe at any time using the link in this email.</p>",
  },
  unsubscribed: {
    subject: "You've been unsubscribed",
    previewText: "You've been successfully unsubscribed from our communications.",
    bodyHtml: "<p>You've been successfully unsubscribed from our communications. We're sorry to see you go.</p><p>If you change your mind, you can resubscribe at any time.</p>",
  },
}

// ─── Brand ───────────────────────────────────────────────────────────────────

export type SocialPlatform = 'facebook' | 'x' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest' | 'threads'

export interface SocialLink {
  id: string
  platform: SocialPlatform
  url: string
}

// Brand assets shared across all pages — logo, social links, contact info, back URL.
// Separate from the Theme preset (which drives colours/fonts) so both can be composed.
export interface Brand {
  logoUrl?: string
  backUrl?: string
  address?: string
  copyrightText?: string
  socialLinks?: SocialLink[]
}

// ─── Banner / Footer configs ──────────────────────────────────────────────────

export interface BannerLink {
  id: string
  label: string
  url: string
}

// B1–B9 banner layout options. Each inherits font + colour from the active theme
// via CSS variables; per-element colour fields override individual parts when set.
export type BannerLayout =
  | 'centred' | 'bar-cta' | 'brand-band' | 'split-image' | 'minimal'
  | 'with-socials' | 'nav-strip' | 'feature-hero' | 'logo-only'
  | 'editorial-split' | 'triple-row' | 'logo-band'

export interface BannerConfig {
  layout: BannerLayout
  backgroundColor?: string    // section background override (CSS var or hex)
  headingColor?: string       // heading text override
  bodyColor?: string          // body / description text override
  linkColor?: string          // links and back-URL colour override
  iconColor?: string          // social icon colour override
  accentColor?: string        // accent stripe / nav row / decorative border colour
  buttonBgColor?: string      // CTA button background (layouts with buttons)
  buttonTextColor?: string    // CTA button text colour
  imageBackground?: boolean    // apply background image on top of any layout
  imageUrl?: string           // split-image side image / imageBackground URL
  imageOverlayColor?: string  // overlay colour when imageBackground is on (hex, default #000000)
  imageOverlayOpacity?: number // overlay opacity 0–100 when imageBackground is on (default 45)
  backgroundSize?: string     // CSS background-size (cover/contain/auto)
  backgroundRepeat?: string   // CSS background-repeat
  padding?: number                             // vertical section padding in px (undefined = layout default)
  logoPosition?: 'left' | 'center' | 'right' // alignment within logo-only layout
  logoSize?: 'sm' | 'md' | 'lg'              // legacy preset — overridden by logoMaxWidth/logoMaxHeight
  logoMaxWidth?: number                        // px, max-width for logo image
  logoMaxHeight?: number                       // px, max-height for logo image
  fullWidth: boolean
  sticky?: boolean            // fix banner to top of viewport while scrolling
  bannerImageUrl?: string     // edge-to-edge image band below the banner; set = enabled
  bannerImageHeight?: number  // px, default 240
  customHtml?: string
  customCss?: string          // injected as <style> alongside the rendered layout
}

// F1–F9 footer layout options.
export type FooterLayout =
  | 'centred-stack' | 'multi-column' | 'dark-band' | 'minimal-line'
  | 'split-cta' | 'unsubscribe-focus' | 'two-col' | 'social-focused' | 'stacked-card'
  | 'inline-logo' | 'left-panel' | 'logo-cta'

export interface FooterConfig {
  layout: FooterLayout
  backgroundColor?: string // section background override (CSS var or hex)
  headingColor?: string    // column heading colour override
  bodyColor?: string       // body text / address / copyright override
  linkColor?: string       // link colour override
  iconColor?: string       // social icon colour override
  accentColor?: string     // accent stripe / decorative border colour
  buttonBgColor?: string   // CTA button background (layouts with buttons)
  buttonTextColor?: string // CTA button text colour
  imageBackground?: boolean    // apply background image on top of any layout
  imageUrl?: string
  imageOverlayColor?: string
  imageOverlayOpacity?: number
  backgroundSize?: string
  backgroundRepeat?: string
  links?: BannerLink[]     // primary footer nav / legal links
  quickLinks?: BannerLink[] // secondary column (multi-column layout)
  padding?: number          // vertical section padding in px (undefined = layout default)
  fullWidth: boolean
  footerImageUrl?: string     // edge-to-edge image band above the footer; set = enabled
  footerImageHeight?: number  // px, default 240
  customHtml?: string
  customCss?: string       // injected as <style> alongside the rendered layout
}

export type ContentBlockType = 'text' | 'image'

export interface ContentBlock {
  id: string
  type: ContentBlockType
  // text block
  html?: string
  // image block
  imageUrl?: string
  imageAlt?: string
  imageWidth?: 'full' | 'contained'
}

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

// bannerHeading/bannerBlurb on each flow group override the banner text for that
// entire flow (e.g. "Manage your preferences" on the preferences pages). When absent
// the banner renders without a heading/blurb, or with the layout's default placeholder.
export interface StatusPages {
  subscribe: {
    bannerHeading?: string
    bannerBlurb?: string
    intro: StatusPageContent
    success: StatusPageContent
    alreadySubscribed: StatusPageContent
  }
  managePreferences: {
    bannerHeading?: string
    bannerBlurb?: string
    saved: StatusPageContent
    notFound: StatusPageContent
  }
  unsubscribe: {
    bannerHeading?: string
    bannerBlurb?: string
    success: StatusPageContent
    error: StatusPageContent
  }
  resubscribe: {
    bannerHeading?: string
    bannerBlurb?: string
    prompt: StatusPageContent
    success: StatusPageContent
    error: StatusPageContent
  }
  unsubscribeRequest: {
    bannerHeading?: string
    bannerBlurb?: string
    intro: StatusPageContent
    sent: StatusPageContent
    alreadyUnsubscribed: StatusPageContent
  }
  manageRequest: {
    bannerHeading?: string
    bannerBlurb?: string
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

export const CONTENT_WIDTHS = { narrow: 640, default: 896, wide: 1152 } as const
export type FormWidth = keyof typeof CONTENT_WIDTHS
export function getContentMaxWidth(fw?: FormWidth | string): number {
  return CONTENT_WIDTHS[(fw ?? 'default') as FormWidth] ?? 896
}

export type CardShadow = 'on' | 'off'
export type CardPadding = 'compact' | 'normal' | 'spacious'
export type CardSpacing = 'compact' | 'normal' | 'spacious'

export interface CardStyle {
  borderEnabled?: boolean   // undefined = theme default; false = no border
  borderWidth?: number      // px, 1–4
  borderColor?: string      // hex or CSS var
  borderRadius?: number     // px, 0–24
  shadow?: CardShadow
  padding?: CardPadding
  spacing?: CardSpacing
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
  submitButtonBgColor?: string   // overrides the style preset's button background
  submitButtonTextColor?: string // overrides the style preset's button text colour
  // Controls whether profile fields render stacked (label above input) or inline (label left,
  // input right). formLabelWidth is the label column's percentage width in inline mode.
  formLayout: 'stacked' | 'inline'
  formLabelWidth: number
  // Whether each section/category renders as its own card or all share one card.
  formCardMode: 'separate' | 'single'
  singleCardStyleIndex: number
  // Freeform content blocks (text or image) that slot into sectionOrder between form blocks.
  contentBlocks: ContentBlock[]
  // Brand assets (logo, socials, address etc.) used by banner/footer layouts.
  brand: Brand
  // Page background colour override applied behind the form (default is var(--background) from theme).
  pageBackgroundColor?: string
  // Content max-width for form cards and banner/footer content (when fullWidth is off).
  formWidth?: FormWidth
  // Global form card appearance overrides (corners, shadow, padding, spacing).
  cardStyle?: CardStyle
  // Page-level banner and footer rendered above/below the form on all subscriber-facing pages.
  banner: BannerConfig | null
  footer: FooterConfig | null
  // Email template config — content/design for outbound transactional emails.
  emailConfig: EmailConfig
  createdAt: string
  updatedAt: string
}

export type SubmitButtonAlignment = 'left' | 'center' | 'right' | 'full'

export const defaultSubmitButtonText = 'Submit'
export const defaultSubmitButtonStyleIndex = 0
export const defaultSubmitButtonAlignment: SubmitButtonAlignment = 'left'

export const defaultStatusPages: StatusPages = {
  subscribe: {
    bannerHeading: 'Stay in the loop',
    bannerBlurb: 'Choose the communications that matter to you.',
    intro: {
      heading: 'Subscribe to Our Updates',
      message: 'Stay informed with the latest news, updates, and exclusive content. Customise your preferences to receive only what matters to you.',
    },
    success: {
      heading: "You're all set!",
      message: "Thank you for subscribing. We've sent a confirmation email to your inbox.",
    },
    alreadySubscribed: {
      heading: "You're already subscribed",
      message: 'You are already subscribed to communications from us. You may manage your preferences if you wish to update your details or subscriptions.',
    },
  },
  managePreferences: {
    bannerHeading: 'Your preferences',
    bannerBlurb: 'Update your details and choose which communications you receive.',
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
    bannerHeading: 'Unsubscribe',
    bannerBlurb: "We're sorry to see you go.",
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
    bannerHeading: 'Welcome back',
    bannerBlurb: 'Resubscribe to stay in touch.',
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
    bannerHeading: 'Unsubscribe',
    bannerBlurb: "Enter your email and we'll send you a personalised link.",
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
    bannerHeading: 'Manage your preferences',
    bannerBlurb: "Enter your email and we'll send you a personalised link.",
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
    formCardMode: 'separate',
    singleCardStyleIndex: 0,
    contentBlocks: [],
    brand: {},
    banner: {
      layout: 'centred',
      fullWidth: true,
      backgroundColor: 'var(--primary)',
      headingColor: 'var(--primary-foreground)',
      bodyColor: 'var(--primary-foreground)',
    },
    footer: {
      layout: 'minimal-line',
      fullWidth: true,
    },
    emailConfig: { ...defaultEmailConfig },
    createdAt: now,
    updatedAt: now,
  }
}
