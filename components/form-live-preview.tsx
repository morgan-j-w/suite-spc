'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  buildDefaultAnswers,
  flattenProfileFields,
  isCategoryAnswered,
  isCategoryVisible,
  isProfileFieldAnswered,
  isProfileFieldVisible,
  isSectionVisible,
  type CategoryAnswers,
  type SubscriberProfile,
} from '@/lib/subscription-types'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { getContentMaxWidth } from '@/lib/subscription-centre'
import { buildPersonaState, type PreviewPersona } from '@/lib/preview-personas'
import { getStylePreviews } from '@/lib/style-previews'
import { RenderedSection, RenderedCategory } from '@/components/subscription-centre-widget'
import { SubmitButtonPreview } from '@/components/submit-button-preview'
import { AnimatedVisibility } from '@/components/animated-visibility'
import { Card, CardContent } from '@/components/ui/card'
import { RenderedContentBlock } from '@/components/rendered-content-block'
import { RenderedBanner, RenderedFooter } from '@/components/rendered-banner-footer'
import { getCardSpacingClass, getCardStyleCss } from '@/lib/card-style'

const EMPTY_PROFILE: SubscriberProfile = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  jobTitle: '',
  customFields: {},
}

export type PreviewEditRegion = 'banner' | 'footer'

interface FormLivePreviewProps {
  centre: SubscriptionCentre
  // When set, the banner and footer become click targets that jump to their editors.
  // The form body stays fully interactive (it's used to exercise conditional logic),
  // so it deliberately does not get a click-to-edit wrapper.
  onEditRegion?: (region: PreviewEditRegion) => void
  // Seeds the scratch state when changed. Deliberately only applied on persona *change* —
  // not on every centre edit — so manual tweaks made in the preview aren't wiped mid-testing.
  persona?: PreviewPersona
}

// Read-only interactive preview of the form — identical rendering to the Preview tab's
// "Preview" mode. Owns its own scratch profile/answers state so interactions (conditional
// visibility, required highlighting) work without touching the builder state.
export function FormLivePreview({ centre, onEditRegion, persona }: FormLivePreviewProps) {
  const [profile, setProfile] = useState<SubscriberProfile>(EMPTY_PROFILE)
  const [answers, setAnswers] = useState<CategoryAnswers>(() => buildDefaultAnswers(centre.categories))
  const [submitted, setSubmitted] = useState(false)

  const personaRef = useRef(persona)
  useEffect(() => {
    if (persona === undefined || persona === personaRef.current) return
    personaRef.current = persona
    const seeded = buildPersonaState(centre, persona)
    setProfile(seeded.profile)
    setAnswers(seeded.answers)
    setSubmitted(false)
  }, [persona, centre])

  // Merge in default answers for any categories added after mount, without
  // wiping selections the user has already made in the preview panel.
  useEffect(() => {
    const defaults = buildDefaultAnswers(centre.categories)
    setAnswers((prev) => {
      const merged = { ...prev }
      for (const id of Object.keys(defaults)) {
        if (!(id in merged)) merged[id] = defaults[id]
      }
      return merged
    })
  }, [centre.categories])

  const isFormValid =
    flattenProfileFields(centre.profileFieldSections)
      .filter((field) => isProfileFieldVisible(field, profile))
      .every((field) => !field.required || isProfileFieldAnswered(field, profile)) &&
    centre.categories
      .filter((category) => isCategoryVisible(category, profile, answers))
      .every((category) => !category.required || isCategoryAnswered(category, answers))

  const firstSectionId = centre.sectionOrder.find((id) =>
    centre.profileFieldSections.some((s) => s.id === id)
  )

  const singleStylePreview = getStylePreviews(centre.themePresetId)[centre.singleCardStyleIndex ?? 0]

  const blocks = centre.sectionOrder.map((id) => {
    const section = centre.profileFieldSections.find((s) => s.id === id)
    if (section) {
      const isFirstSection = section.id === firstSectionId
      const hasVisibleField =
        section.fields.length === 0 ||
        section.fields.some((field) => isProfileFieldVisible(field, profile))
      const visible = (isFirstSection || isSectionVisible(section, profile, answers)) && hasVisibleField

      if (centre.formCardMode === 'single') {
        return (
          <RenderedSection
            key={id}
            section={section}
            stylePreview={singleStylePreview}
            profile={profile}
            onProfileChange={setProfile}
            visible={visible}
            showValidation={submitted}
            formLayout={centre.formLayout}
            formLabelWidth={centre.formLabelWidth}
            embedded
          />
        )
      }

      const stylePreview = getStylePreviews(centre.themePresetId)[section.cardStyleIndex ?? 0]
      return (
        <RenderedSection
          key={id}
          section={section}
          stylePreview={stylePreview}
          profile={profile}
          onProfileChange={setProfile}
          visible={visible}
          showValidation={submitted}
          formLayout={centre.formLayout}
          formLabelWidth={centre.formLabelWidth}
        />
      )
    }

    const category = centre.categories.find((c) => c.id === id)
    if (category) {
      if (centre.formCardMode === 'single') {
        return (
          <AnimatedVisibility key={id} visible={isCategoryVisible(category, profile, answers)}>
            <RenderedCategory
              category={category}
              stylePreview={singleStylePreview}
              answers={answers}
              onAnswersChange={setAnswers}
              showValidation={submitted}
              embedded
            />
          </AnimatedVisibility>
        )
      }

      const stylePreview = getStylePreviews(centre.themePresetId)[category.cardStyleIndex ?? 0]
      return (
        <AnimatedVisibility key={id} visible={isCategoryVisible(category, profile, answers)}>
          <RenderedCategory
            category={category}
            stylePreview={stylePreview}
            answers={answers}
            onAnswersChange={setAnswers}
            showValidation={submitted}
          />
        </AnimatedVisibility>
      )
    }

    const contentBlock = (centre.contentBlocks ?? []).find((b) => b.id === id)
    if (contentBlock) {
      return <RenderedContentBlock key={id} block={contentBlock} showPlaceholder />
    }

    return null
  })

  const submitButton = (
    <SubmitButtonPreview
      theme={centre.themePresetId}
      text={centre.submitButtonText}
      styleIndex={centre.submitButtonStyleIndex}
      alignment={centre.submitButtonAlignment}
      onTextChange={() => {}}
      onStyleIndexChange={() => {}}
      onAlignmentChange={() => {}}
      readOnly
      onSubmit={() => {
        setSubmitted(true)
        if (isFormValid) toast.success('Form valid — this is where submission would happen.')
      }}
    />
  )

  const contentMaxWidth = getContentMaxWidth(centre.formWidth)
  const cardSpacingClass = getCardSpacingClass(centre.cardStyle)
  const cardStyleCss = getCardStyleCss(centre.cardStyle)

  // Click-to-edit wrapper for the banner/footer regions: hover shows a teal outline and
  // an "Edit" chip; clicking jumps to that region's editor. preventDefault stops banner
  // links from navigating away when the click was meant for editing.
  const editRegion = (region: PreviewEditRegion, label: string, node: React.ReactNode) =>
    onEditRegion ? (
      <div
        className="group/edit relative cursor-pointer"
        onClick={(e) => { e.preventDefault(); onEditRegion(region) }}
        role="button"
        aria-label={`Edit ${label}`}
      >
        <div className="pointer-events-none absolute inset-0 z-20 hidden ring-2 ring-inset ring-primary/60 group-hover/edit:block" />
        <div className="pointer-events-none absolute right-2 top-2 z-20 hidden group-hover/edit:block">
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm">Edit {label}</span>
        </div>
        {node}
      </div>
    ) : node

  return (
    <div
      data-color-theme={centre.themePresetId}
      className="flex flex-col"
      style={{ background: centre.pageBackgroundColor ?? undefined }}
    >
      {cardStyleCss && <style dangerouslySetInnerHTML={{ __html: cardStyleCss }} />}
      {centre.banner && (
        <div className={centre.banner.sticky ? 'sticky top-0 z-50' : undefined}>
          {editRegion('banner', 'banner',
            <RenderedBanner
              config={centre.banner}
              brand={centre.brand}
              contentMaxWidth={contentMaxWidth}
              heading={centre.statusPages.subscribe.bannerHeading}
              blurb={centre.statusPages.subscribe.bannerBlurb}
            />
          )}
        </div>
      )}
      <div data-card-canvas style={{ maxWidth: contentMaxWidth, margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {centre.formCardMode === 'single' ? (
          <Card
            className="gap-0 py-0"
            style={{
              backgroundColor: singleStylePreview.background,
              ...(singleStylePreview.cardBorder
                ? { borderColor: singleStylePreview.cardBorder, borderWidth: 1 }
                : {}),
            }}
          >
            <CardContent className="space-y-6 p-6">
              <div className={cardSpacingClass}>{blocks}</div>
              {submitButton}
            </CardContent>
          </Card>
        ) : (
          <div className={cardSpacingClass}>
            {blocks}
            {submitButton}
          </div>
        )}
      </div>
      {centre.footer && editRegion('footer', 'footer',
        <RenderedFooter config={centre.footer} brand={centre.brand} contentMaxWidth={contentMaxWidth} />
      )}
    </div>
  )
}
