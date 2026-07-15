'use client'

import { useEffect, useState } from 'react'
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
import { getStylePreviews } from '@/lib/style-previews'
import { RenderedSection, RenderedCategory } from '@/components/subscription-centre-widget'
import { SubmitButtonPreview } from '@/components/submit-button-preview'
import { AnimatedVisibility } from '@/components/animated-visibility'
import { Card, CardContent } from '@/components/ui/card'
import { RenderedContentBlock } from '@/components/rendered-content-block'
import { richTextContentClass } from '@/components/rich-text-editor'
import { cn } from '@/lib/utils'

const EMPTY_PROFILE: SubscriberProfile = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  jobTitle: '',
  customFields: {},
}

interface FormLivePreviewProps {
  centre: SubscriptionCentre
}

// Read-only interactive preview of the form — identical rendering to the Preview tab's
// "Preview" mode. Owns its own scratch profile/answers state so interactions (conditional
// visibility, required highlighting) work without touching the builder state.
export function FormLivePreview({ centre }: FormLivePreviewProps) {
  const [profile, setProfile] = useState<SubscriberProfile>(EMPTY_PROFILE)
  const [answers, setAnswers] = useState<CategoryAnswers>(() => buildDefaultAnswers(centre.categories))
  const [submitted, setSubmitted] = useState(false)

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

  return (
    <div data-color-theme={centre.themePresetId}>
      {centre.banner?.html && (
        <div className={cn('py-3 text-sm', richTextContentClass, centre.banner.fullWidth ? '' : 'px-1')}>
          <div dangerouslySetInnerHTML={{ __html: centre.banner.html }} />
        </div>
      )}
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
            <div className="space-y-6">{blocks}</div>
            {submitButton}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {blocks}
          {submitButton}
        </div>
      )}
      {centre.footer?.html && (
        <div className={cn('py-3 text-sm', richTextContentClass, centre.footer.fullWidth ? '' : 'px-1')}>
          <div dangerouslySetInnerHTML={{ __html: centre.footer.html }} />
        </div>
      )}
    </div>
  )
}
