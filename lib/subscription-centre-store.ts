import { v4 as uuidv4 } from 'uuid'
import {
  createSubscriptionCentre,
  defaultStatusPages,
  defaultSubmitButtonAlignment,
  defaultSubmitButtonStyleIndex,
  defaultSubmitButtonText,
  defaultUnsubscribeFeedback,
  type BannerConfig,
  type FooterConfig,
  type StatusPageContent,
  type StatusPages,
  type SubscriptionCentre,
} from '@/lib/subscription-centre'

const STORAGE_KEY = 'preference-centre-subscription-centres'
const ACTIVE_KEY = 'preference-centre-active-centre-id'
const DEFAULT_CENTRE_NAME = 'Default Subscription Centre'
const DRAFT_PREFIX = 'preference-centre-draft-'

// Draft storage — builder work-in-progress that survives refresh but does NOT affect
// the live /subscribe and /preferences pages (those read from STORAGE_KEY only).
export function getDraft(id: string): SubscriptionCentre | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(`${DRAFT_PREFIX}${id}`)
  if (!raw) return null
  try { return normalizeCentre(JSON.parse(raw)) } catch { return null }
}

export function saveDraft(centre: SubscriptionCentre) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(`${DRAFT_PREFIX}${centre.id}`, JSON.stringify(centre))
}

export function clearDraft(id: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(`${DRAFT_PREFIX}${id}`)
}

// Centres saved before the 14-style catalogue have a `cardStyleId` of 'style-1'/'style-2'/
// 'style-3' from the old 3-option system. Map those onto the new numeric style index.
function migrateCardStyleIndex(raw: { cardStyleId?: string; cardStyleIndex?: number }): number | undefined {
  if (typeof raw.cardStyleIndex === 'number') return raw.cardStyleIndex
  if (raw.cardStyleId === 'style-2') return 1
  if (raw.cardStyleId === 'style-3') return 2
  if (raw.cardStyleId === 'style-1') return 0
  return undefined
}

// Centres saved before status pages were grouped by flow have a flat shape (success/
// alreadyUnsubscribed/unsubscribeConfirm/error) instead of today's subscribe/
// managePreferences/unsubscribe/resubscribe groups. Map the old fields onto their closest
// new home, and fill in anything that has no old equivalent (e.g. the new "saved
// preferences" message) from the defaults.
function migrateStatusPages(raw: any): StatusPages {
  const old = raw as Partial<{
    success: StatusPageContent
    alreadyUnsubscribed: StatusPageContent
    unsubscribeConfirm: StatusPageContent
    error: StatusPageContent
  }>

  if (raw?.subscribe?.success) {
    // Already the new shape -- still merge over defaults in case a future field gets
    // added and this centre predates it.
    return {
      subscribe: { ...defaultStatusPages.subscribe, ...raw.subscribe },
      managePreferences: { ...defaultStatusPages.managePreferences, ...raw.managePreferences },
      unsubscribe: { ...defaultStatusPages.unsubscribe, ...raw.unsubscribe },
      resubscribe: { ...defaultStatusPages.resubscribe, ...raw.resubscribe },
      unsubscribeRequest: { ...defaultStatusPages.unsubscribeRequest, ...raw.unsubscribeRequest },
      manageRequest: { ...defaultStatusPages.manageRequest, ...raw.manageRequest },
    }
  }

  return {
    subscribe: {
      intro: defaultStatusPages.subscribe.intro,
      success: old?.success ?? defaultStatusPages.subscribe.success,
      alreadySubscribed: defaultStatusPages.subscribe.alreadySubscribed,
    },
    managePreferences: {
      saved: defaultStatusPages.managePreferences.saved,
      notFound: old?.error ?? defaultStatusPages.managePreferences.notFound,
    },
    unsubscribe: {
      success: defaultStatusPages.unsubscribe.success,
      error: defaultStatusPages.unsubscribe.error,
    },
    resubscribe: {
      prompt: old?.alreadyUnsubscribed ?? defaultStatusPages.resubscribe.prompt,
      success: defaultStatusPages.resubscribe.success,
      error: defaultStatusPages.resubscribe.error,
    },
    unsubscribeRequest: defaultStatusPages.unsubscribeRequest,
    manageRequest: defaultStatusPages.manageRequest,
  }
}

// Old layout names → new BannerLayout slugs
const BANNER_LAYOUT_MAP: Record<string, string> = {
  centred: 'centred',
  split: 'bar-cta',
  'logo-body': 'centred',
  minimal: 'minimal',
  'footer-links': 'centred', // was a footer layout, just default to centred for banners
  // new slugs pass through unchanged
  'bar-cta': 'bar-cta',
  'brand-band': 'brand-band',
  'split-image': 'split-image',
  'with-socials': 'with-socials',
  'nav-strip': 'nav-strip',
  'image-background': 'feature-hero', // migrated: layout removed, imageBackground toggle replaces it
  'logo-only': 'logo-only',
  'announcement-bar': 'centred',      // migrated: layout removed
  'editorial-split': 'editorial-split',
  'triple-row': 'triple-row',
  'feature-hero': 'feature-hero',
}
const FOOTER_LAYOUT_MAP: Record<string, string> = {
  centred: 'centred-stack',
  split: 'split-cta',
  'logo-body': 'centred-stack',
  minimal: 'minimal-line',
  'footer-links': 'minimal-line',
  // new slugs pass through unchanged
  'centred-stack': 'centred-stack',
  'multi-column': 'multi-column',
  'dark-band': 'dark-band',
  'minimal-line': 'minimal-line',
  'split-cta': 'split-cta',
  'unsubscribe-focus': 'unsubscribe-focus',
  'two-col': 'two-col',
  'social-focused': 'social-focused',
  'stacked-card': 'stacked-card',
  'brand-statement': 'minimal-line',  // migrated: layout removed
  'inline-logo': 'inline-logo',
  'left-panel': 'left-panel',
}

function migrateBanner(raw: any): BannerConfig | null {
  if (!raw) return null
  const rawLayout = raw.layout
  const layout = (BANNER_LAYOUT_MAP[rawLayout] ?? 'centred') as BannerConfig['layout']
  if (rawLayout && BANNER_LAYOUT_MAP[rawLayout]) {
    return {
      layout,
      // Accept both old field names (colorOverride was used in early builds, backgroundColor in later)
      backgroundColor: raw.backgroundColor ?? raw.colorOverride,
      headingColor: raw.headingColor,
      bodyColor: raw.bodyColor,
      linkColor: raw.linkColor,
      iconColor: raw.iconColor,
      accentColor: raw.accentColor,
      buttonBgColor: raw.buttonBgColor,
      buttonTextColor: raw.buttonTextColor,
      padding: typeof raw.padding === 'string'
        ? (raw.padding === 'compact' ? 20 : raw.padding === 'spacious' ? 70 : 40)
        : raw.padding,
      logoPosition: raw.logoPosition,
      logoSize: raw.logoSize,
      logoMaxWidth: raw.logoMaxWidth,
      logoMaxHeight: raw.logoMaxHeight,
      // When migrating from the old image-background layout, enable the imageBackground toggle
      imageBackground: raw.imageBackground ?? (rawLayout === 'image-background' ? true : undefined),
      imageUrl: raw.imageUrl,
      imageOverlayColor: raw.imageOverlayColor,
      imageOverlayOpacity: raw.imageOverlayOpacity,
      backgroundSize: raw.backgroundSize,
      backgroundRepeat: raw.backgroundRepeat,
      fullWidth: raw.fullWidth ?? false,
      customHtml: raw.customHtml,
      customCss: raw.customCss,
    }
  }
  return { layout: 'centred', fullWidth: raw.fullWidth ?? false, customHtml: raw.html || undefined }
}

function migrateFooter(raw: any): FooterConfig | null {
  if (!raw) return null
  const layout = (FOOTER_LAYOUT_MAP[raw.layout] ?? 'minimal-line') as FooterConfig['layout']
  if (raw.layout && FOOTER_LAYOUT_MAP[raw.layout]) {
    return {
      layout,
      backgroundColor: raw.backgroundColor ?? raw.colorOverride,
      headingColor: raw.headingColor,
      bodyColor: raw.bodyColor,
      linkColor: raw.linkColor,
      iconColor: raw.iconColor,
      accentColor: raw.accentColor,
      buttonBgColor: raw.buttonBgColor,
      buttonTextColor: raw.buttonTextColor,
      imageBackground: raw.imageBackground,
      imageUrl: raw.imageUrl,
      imageOverlayColor: raw.imageOverlayColor,
      imageOverlayOpacity: raw.imageOverlayOpacity,
      backgroundSize: raw.backgroundSize,
      backgroundRepeat: raw.backgroundRepeat,
      links: raw.links,
      quickLinks: raw.quickLinks,
      padding: typeof raw.padding === 'string'
        ? (raw.padding === 'compact' ? 20 : raw.padding === 'spacious' ? 70 : 40)
        : raw.padding,
      fullWidth: raw.fullWidth ?? false,
      customHtml: raw.customHtml,
      customCss: raw.customCss,
    }
  }
  return { layout: 'minimal-line', fullWidth: raw.fullWidth ?? false, customHtml: raw.html || undefined }
}

// Centres saved before Form Field sections existed have a flat `profileFields` array and no
// `sectionOrder`. Lift those into the new shape so older localStorage data keeps working.
function normalizeCentre(raw: any): SubscriptionCentre {
  let centre = raw

  if (Array.isArray(raw.profileFields) && !Array.isArray(raw.profileFieldSections)) {
    const { profileFields, profileFieldsCardStyleId, ...rest } = raw
    centre = {
      ...rest,
      profileFieldSections:
        profileFields.length > 0
          ? [
              {
                id: uuidv4(),
                title: 'Your Details',
                description: '',
                fields: profileFields,
                cardStyleIndex: migrateCardStyleIndex({ cardStyleId: profileFieldsCardStyleId }),
              },
            ]
          : [],
    }
  }

  centre = {
    ...centre,
    profileFieldSections: centre.profileFieldSections.map((s: { cardStyleId?: string; cardStyleIndex?: number }) => {
      const { cardStyleId, ...rest } = s
      return { ...rest, cardStyleIndex: migrateCardStyleIndex(s) }
    }),
    categories: centre.categories.map((c: { cardStyleId?: string; cardStyleIndex?: number }) => {
      const { cardStyleId, ...rest } = c
      return { ...rest, cardStyleIndex: migrateCardStyleIndex(c) }
    }),
  }

  const validIds = new Set([
    ...centre.profileFieldSections.map((s: { id: string }) => s.id),
    ...centre.categories.map((c: { id: string }) => c.id),
  ])
  const kept = Array.isArray(centre.sectionOrder) ? centre.sectionOrder.filter((id: string) => validIds.has(id)) : []
  const keptSet = new Set(kept)
  const missing = [...centre.profileFieldSections.map((s: { id: string }) => s.id), ...centre.categories.map((c: { id: string }) => c.id)].filter(
    (id: string) => !keptSet.has(id)
  )

  // Mail groups saved before folders existed are missing `folder` — backfill so the
  // folder-narrowed mailgroup picker has something to group them under.
  const mailGroups = Array.isArray(centre.mailGroups)
    ? centre.mailGroups.map((group: { id: string; name: string; folder?: string }) => ({
        ...group,
        folder: group.folder || 'General',
      }))
    : []

  return {
    ...centre,
    sectionOrder: [...kept, ...missing],
    mailGroups,
    brand: (() => {
      const b = centre.brand ?? {}
      // Lift logoUrl from old banner/footer if brand has none yet
      if (!b.logoUrl) b.logoUrl = centre.banner?.logoUrl || centre.footer?.logoUrl || undefined
      return b
    })(),
    pageBackgroundColor: centre.pageBackgroundColor,
    formWidth: centre.formWidth,
    cardStyle: (() => {
      const cs = centre.cardStyle
      if (!cs) return cs
      return {
        ...cs,
        radius: cs.radius === 'default' ? undefined : cs.radius,
        spacing: cs.spacing === 'tight' ? 'compact' : cs.spacing === 'loose' ? 'spacious' : cs.spacing,
      }
    })(),
    banner: migrateBanner(centre.banner),
    footer: migrateFooter(centre.footer),
    catchAllMailGroupId: centre.catchAllMailGroupId ?? null,
    statusPages: migrateStatusPages(centre.statusPages),
    submitButtonText: centre.submitButtonText ?? defaultSubmitButtonText,
    submitButtonStyleIndex: centre.submitButtonStyleIndex ?? defaultSubmitButtonStyleIndex,
    submitButtonAlignment: centre.submitButtonAlignment ?? defaultSubmitButtonAlignment,
    submitButtonBgColor: centre.submitButtonBgColor,
    submitButtonTextColor: centre.submitButtonTextColor,
    formLayout: (centre.formLayout === 'columns' ? 'inline' : centre.formLayout) ?? 'stacked',
    formLabelWidth: centre.formLabelWidth ?? 33,
    formCardMode: centre.formCardMode ?? 'separate',
    singleCardStyleIndex: centre.singleCardStyleIndex ?? 0,
    unsubscribeFeedback: centre.unsubscribeFeedback ?? {
      ...defaultUnsubscribeFeedback,
      options: defaultUnsubscribeFeedback.options.map((o) => ({ ...o })),
    },
  }
}

function readAll(): SubscriptionCentre[] {
  if (typeof window === 'undefined') return []

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    return (JSON.parse(stored) as unknown[]).map(normalizeCentre)
  } catch {
    return []
  }
}

function writeAll(centres: SubscriptionCentre[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(centres))
}

export function listCentres(): SubscriptionCentre[] {
  return readAll()
}

export function getCentre(id: string): SubscriptionCentre | null {
  return readAll().find((centre) => centre.id === id) || null
}

export function saveCentre(centre: SubscriptionCentre): SubscriptionCentre {
  const centres = readAll()
  const index = centres.findIndex((existing) => existing.id === centre.id)
  const updated: SubscriptionCentre = { ...centre, updatedAt: new Date().toISOString() }

  if (index === -1) {
    centres.push(updated)
  } else {
    centres[index] = updated
  }

  writeAll(centres)
  return updated
}

export function createCentre(name: string = 'Untitled Subscription Centre'): SubscriptionCentre {
  const centre = createSubscriptionCentre(name)
  saveCentre(centre)
  setActiveCentreId(centre.id)
  return centre
}

export function deleteCentre(id: string) {
  writeAll(readAll().filter((centre) => centre.id !== id))

  if (getActiveCentreId() === id && typeof window !== 'undefined') {
    window.localStorage.removeItem(ACTIVE_KEY)
  }
}

export function getActiveCentreId(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACTIVE_KEY)
}

export function setActiveCentreId(id: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACTIVE_KEY, id)
}

// Resolves the centre the live /subscribe and /preferences pages should render: whichever
// centre is marked active, falling back to the first one found.
export function getActiveCentre(): SubscriptionCentre | null {
  const centres = readAll()
  const activeId = getActiveCentreId()

  const active = activeId ? centres.find((centre) => centre.id === activeId) : undefined
  return active || centres[0] || null
}

// Ensures there is always at least one centre to render, seeded from the app's original
// hardcoded defaults so existing behavior is preserved on first load.
export function ensureSeedCentre(): SubscriptionCentre {
  const existing = getActiveCentre()
  if (existing) return existing

  return createCentre(DEFAULT_CENTRE_NAME)
}
