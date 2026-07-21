'use client'

import {
  type Category,
  type CategoryAnswers,
  type CustomProfileField,
  type ProfileFieldSection,
  type SubscriberProfile,
  getBuiltInFieldOptions,
  isCategoryAnswered,
  isCategoryVisible,
  isProfileFieldAnswered,
  isProfileFieldVisible,
  isSectionVisible,
} from '@/lib/subscription-types'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { getReadableTextColor, getStylePreviews, type StylePreview } from '@/lib/style-previews'
import { renderFormattedText } from '@/lib/format-text'
import { richTextContentClass } from '@/components/rich-text-editor'
import { AnimatedVisibility } from '@/components/animated-visibility'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { MultiSelect } from '@/components/multi-select'
import { RatingInput } from '@/components/rating-input'
import { cn } from '@/lib/utils'
import { RenderedContentBlock } from '@/components/rendered-content-block'
import { getCardSpacingClass, getCardStyleCss } from '@/lib/card-style'

const STANDARD_PROFILE_FIELDS = ['email', 'firstName', 'lastName', 'phone', 'company', 'jobTitle']

interface SubscriptionCentreWidgetProps {
  centre: SubscriptionCentre
  profile: SubscriberProfile
  onProfileChange: (updater: (prev: SubscriberProfile) => SubscriberProfile) => void
  answers: CategoryAnswers
  onAnswersChange: (updater: (prev: CategoryAnswers) => CategoryAnswers) => void
}

const RequiredAsterisk = () => (
  <>
    <span aria-hidden="true" className="ml-px text-destructive">*</span>
    <span className="sr-only">(required)</span>
  </>
)

function getProfileFieldValue(field: CustomProfileField, profile: SubscriberProfile) {
  const isStandardField = STANDARD_PROFILE_FIELDS.includes(field.id)
  return isStandardField
    ? (profile[field.id as keyof Omit<SubscriberProfile, 'customFields'>] as string)
    : ((profile.customFields[field.id] as string | string[] | boolean | number | undefined) ?? '')
}

// Shared by the real subscribe/manage-preferences forms (via SubscriptionCentreWidget below)
// and the builder's Preview tab, so both render fields identically -- one rendering function,
// not two copies that could drift apart.
export function renderProfileField(
  field: CustomProfileField,
  headingColor: string,
  profile: SubscriberProfile,
  onProfileChange: (updater: (prev: SubscriberProfile) => SubscriberProfile) => void,
  showValidation = false,
  formLayout?: 'stacked' | 'inline',
  formLabelWidth?: number
) {
  // Inline layout: label left at configurable %, input fills the rest.
  // Display-only types (heading/paragraph) and multi-option types (checkboxGroup,
  // radio, toggle) always render stacked — they don't make sense in a label/input row.
  const INLINE_EXCLUDED = ['heading', 'paragraph']
  const useInline = formLayout === 'inline' && !INLINE_EXCLUDED.includes(field.type)
  const labelWidthPct = formLabelWidth ?? 30
  const updateProfile = (fieldKey: keyof Omit<SubscriberProfile, 'customFields'>, value: string) => {
    onProfileChange((prev) => ({ ...prev, [fieldKey]: value }))
  }

  const updateCustomField = (fieldId: string, value: string | string[] | boolean | number) => {
    onProfileChange((prev) => ({ ...prev, customFields: { ...prev.customFields, [fieldId]: value } }))
  }

  {
    const isStandardField = STANDARD_PROFILE_FIELDS.includes(field.id)
    const value = getProfileFieldValue(field, profile)
    const fieldId = `field-${field.id}`
    const label = (
      <Label htmlFor={fieldId} className="sc-field-label" style={{ color: headingColor }}>
        {field.label}
        {field.required && <RequiredAsterisk />}
      </Label>
    )
    const helpTextId = field.helpText ? `${fieldId}-help` : undefined
    const errorId = `${fieldId}-error`
    const isInvalid = showValidation && field.required && !isProfileFieldAnswered(field, profile)
    const describedBy = [helpTextId, isInvalid ? errorId : undefined].filter(Boolean).join(' ') || undefined
    const helpText = field.helpText && (
      <p id={helpTextId} className="sc-field-help-text text-sm" style={{ color: headingColor }}>{field.helpText}</p>
    )

    const handleTextChange = (next: string) =>
      isStandardField
        ? updateProfile(field.id as keyof Omit<SubscriberProfile, 'customFields'>, next)
        : updateCustomField(field.id, next)

    // In inline mode, label sits in a left column at formLabelWidth% and the input fills the rest.
    const wrapField = (input: React.ReactNode, stacked = false) => {
      if (useInline && !stacked) {
        return (
          <div className="flex items-start gap-4">
            <div className="shrink-0 pt-2 space-y-1" style={{ width: `${labelWidthPct}%` }}>
              {label}
              {helpText}
            </div>
            <div className="min-w-0 flex-1">{input}</div>
          </div>
        )
      }
      return (
        <div className="space-y-2">
          {label}
          {helpText}
          {input}
        </div>
      )
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id}>
            {wrapField(
              <Input
                id={fieldId}
                type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                placeholder={field.placeholder}
                value={(value as string) || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                required={field.required}
                aria-required={field.required || undefined}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                className="bg-white"
                controlColor={headingColor}
              />
            )}
          </div>
        )

      case 'number':
        return (
          <div key={field.id}>
            {wrapField(
              <Input
                id={fieldId}
                type="number"
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
                value={typeof value === 'number' ? value : (value as string) || ''}
                onChange={(e) => updateCustomField(field.id, e.target.value === '' ? '' : Number(e.target.value))}
                required={field.required}
                aria-required={field.required || undefined}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                className="bg-white"
                controlColor={headingColor}
              />
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id}>
            {wrapField(
              <Textarea
                id={fieldId}
                placeholder={field.placeholder}
                value={(value as string) || ''}
                onChange={(e) => updateCustomField(field.id, e.target.value)}
                required={field.required}
                aria-required={field.required || undefined}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                className="bg-white"
                controlColor={headingColor}
              />
            )}
          </div>
        )

      case 'select':
      case 'country':
      case 'state_au': {
        const options = field.options?.length ? field.options : getBuiltInFieldOptions(field.type) || []
        return (
          <div key={field.id}>
            {wrapField(
              <Select value={(value as string) || ''} onValueChange={(v) => updateCustomField(field.id, v)}>
                <SelectTrigger id={fieldId} className="w-full bg-white" controlColor={headingColor} aria-required={field.required || undefined} aria-invalid={isInvalid || undefined} aria-describedby={describedBy}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )
      }

      case 'multiSelect': {
        const selectedValues = (value as string[]) || []
        return (
          <div key={field.id}>
            {wrapField(
              <MultiSelect
                id={fieldId}
                options={field.options || []}
                selected={selectedValues}
                onChange={(next) => updateCustomField(field.id, next)}
                placeholder="Select options"
                className={cn('bg-white', isInvalid && 'ring-1 ring-destructive')}
                controlColor={headingColor}
              />
            )}
          </div>
        )
      }

      case 'radio':
        return (
          <div key={field.id}>
            {wrapField(
              <RadioGroup value={(value as string) || ''} onValueChange={(v) => updateCustomField(field.id, v)}>
                <div className={cn('space-y-2 rounded-md', isInvalid && 'ring-1 ring-destructive')}>
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center gap-3">
                      <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} controlColor={headingColor} />
                      <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer font-normal" style={{ color: headingColor }}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>
        )

      case 'checkboxGroup': {
        const checkedValues = (profile.customFields[field.id] as string[]) || []
        return (
          <div key={field.id}>
            {wrapField(
              <div className={cn('space-y-2 rounded-md', isInvalid && 'ring-1 ring-destructive')}>
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center gap-3">
                    <Checkbox
                      id={`${field.id}-${option.value}`}
                      checked={checkedValues.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...checkedValues, option.value]
                          : checkedValues.filter((v) => v !== option.value)
                        updateCustomField(field.id, next)
                      }}
                      controlColor={headingColor}
                      indicatorColor={getReadableTextColor(headingColor)}
                    />
                    <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer font-normal" style={{ color: headingColor }}>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      case 'checkbox': {
        const checkboxEl = (
          <Checkbox
            id={fieldId}
            className="mt-0.5"
            checked={Boolean(profile.customFields[field.id])}
            onCheckedChange={(checked) => updateCustomField(field.id, checked as boolean)}
            controlColor={headingColor}
            indicatorColor={getReadableTextColor(headingColor)}
          />
        )
        if (useInline) {
          return (
            <div key={field.id}>
              {wrapField(checkboxEl)}
            </div>
          )
        }
        return (
          <div key={field.id} className="flex items-start gap-3">
            {checkboxEl}
            <div className="space-y-1">
              {label}
              {helpText}
            </div>
          </div>
        )
      }

      case 'toggle': {
        const checkedValues = (profile.customFields[field.id] as string[]) || []
        return (
          <div key={field.id}>
            {wrapField(
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center justify-between gap-3">
                    <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer font-normal" style={{ color: headingColor }}>
                      {option.label}
                    </Label>
                    <Switch
                      id={`${field.id}-${option.value}`}
                      checked={checkedValues.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...checkedValues, option.value]
                          : checkedValues.filter((v) => v !== option.value)
                        updateCustomField(field.id, next)
                      }}
                      controlColor={headingColor}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      case 'date':
        return (
          <div key={field.id}>
            {wrapField(
              <Input
                id={fieldId}
                type="date"
                value={(value as string) || ''}
                onChange={(e) => updateCustomField(field.id, e.target.value)}
                required={field.required}
                aria-required={field.required || undefined}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                className="bg-white"
                controlColor={headingColor}
              />
            )}
          </div>
        )

      case 'range': {
        const min = field.min ?? 0
        const max = field.max ?? 100
        const step = field.step ?? 1
        const numValue = typeof value === 'number' ? value : min
        return (
          <div key={field.id}>
            {wrapField(
              <div className="flex items-center gap-3 pt-2">
                <Slider
                  id={fieldId}
                  value={[numValue]}
                  min={min}
                  max={max}
                  step={step}
                  onValueChange={([v]) => updateCustomField(field.id, v)}
                  controlColor={headingColor}
                />
                <span className="w-10 shrink-0 text-right text-sm" style={{ color: headingColor }}>{numValue}</span>
              </div>
            )}
          </div>
        )
      }

      case 'rating': {
        const numValue = typeof value === 'number' ? value : 0
        return (
          <div key={field.id}>
            {wrapField(
              <RatingInput id={fieldId} value={numValue} max={field.ratingMax || 5} onChange={(v) => updateCustomField(field.id, v)} color={headingColor} />
            )}
          </div>
        )
      }

      case 'heading':
        return (
          <div key={field.id}>
            <h3 className="sc-heading-h3 text-lg font-semibold" style={{ color: headingColor }}>{renderFormattedText(field.label)}</h3>
          </div>
        )

      case 'paragraph':
        return (
          <div
            key={field.id}
            className={cn('space-y-2 text-sm', richTextContentClass)}
            style={{ color: headingColor }}
            dangerouslySetInnerHTML={{ __html: field.label }}
          />
        )
    }
  }
}

export interface RenderedCategoryProps {
  category: Category
  stylePreview: StylePreview
  answers: CategoryAnswers
  onAnswersChange: (updater: (prev: CategoryAnswers) => CategoryAnswers) => void
  showValidation?: boolean
  embedded?: boolean
}

// Shared by SubscriptionCentreWidget and the builder's Preview tab -- see renderProfileField.
export function RenderedCategory({ category, stylePreview, answers, onAnswersChange, showValidation, embedded }: RenderedCategoryProps) {
  const updateCheckboxAnswer = (categoryId: string, optionKey: string, checked: boolean) => {
    onAnswersChange((prev) => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] as Record<string, boolean>), [optionKey]: checked },
    }))
  }

  const updateRadioAnswer = (categoryId: string, value: string) => {
    onAnswersChange((prev) => ({ ...prev, [categoryId]: value }))
  }

  const header = (category.title.trim() || category.description.trim()) ? (
    <div className={embedded ? 'mb-4' : undefined}>
      {category.title.trim() && (
        <h3
          id={`sc-category-title-${category.id}`}
          className="sc-category-title text-base font-semibold leading-none"
          style={{ color: stylePreview.heading }}
        >
          {category.title}
          {category.required && <RequiredAsterisk />}
        </h3>
      )}
      {category.description.trim() && (
        <p className="sc-category-description mt-1 text-sm" style={{ color: stylePreview.heading }}>
          {category.description}
        </p>
      )}
    </div>
  ) : null

  const options = category.type === 'checkbox' ? (
    <div
      role="group"
      aria-labelledby={category.title.trim() ? `sc-category-title-${category.id}` : undefined}
      aria-required={category.required || undefined}
      className="space-y-4"
    >
      {category.options.map((option) => (
        <div key={option.key} className="sc-category-option space-y-1" data-option-key={option.key}>
          <div className="flex items-center gap-3">
            <Checkbox
              id={`${category.id}-${option.key}`}
              checked={(answers[category.id] as Record<string, boolean>)?.[option.key] || false}
              onCheckedChange={(checked) => updateCheckboxAnswer(category.id, option.key, checked as boolean)}
              controlColor={stylePreview.heading}
              indicatorColor={getReadableTextColor(stylePreview.heading)}
            />
            <Label htmlFor={`${category.id}-${option.key}`} className="cursor-pointer font-medium" style={{ color: stylePreview.heading }}>
              {option.label}
            </Label>
          </div>
          {option.description && <p className="pl-7 text-sm" style={{ color: stylePreview.heading }}>{option.description}</p>}
        </div>
      ))}
    </div>
  ) : (
    <RadioGroup
      value={(answers[category.id] as string) || ''}
      onValueChange={(value) => updateRadioAnswer(category.id, value)}
      aria-labelledby={category.title.trim() ? `sc-category-title-${category.id}` : undefined}
      aria-required={category.required || undefined}
    >
      <div className="space-y-4">
        {category.options.map((option) => (
          <div key={option.key} className="sc-category-option space-y-1" data-option-key={option.key}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value={option.key} id={`${category.id}-${option.key}`} controlColor={stylePreview.heading} />
              <Label htmlFor={`${category.id}-${option.key}`} className="cursor-pointer font-medium" style={{ color: stylePreview.heading }}>
                {option.label}
              </Label>
            </div>
            {option.description && <p className="pl-7 text-sm" style={{ color: stylePreview.heading }}>{option.description}</p>}
          </div>
        ))}
      </div>
    </RadioGroup>
  )

  const validationError = showValidation && category.required && !isCategoryAnswered(category, answers) ? (
    <p role="alert" className="mt-2 text-xs font-medium text-destructive">Please make a selection.</p>
  ) : null

  if (embedded) {
    return (
      <div id={`sc-category-${category.id}`} data-category-id={category.id} className="sc-category">
        {header}
        {options}
        {validationError}
      </div>
    )
  }

  return (
    <Card
      key={category.id}
      id={`sc-category-${category.id}`}
      data-category-id={category.id}
      className="sc-category"
      style={{
        backgroundColor: stylePreview.background,
        ...(stylePreview.cardBorder ? { borderColor: stylePreview.cardBorder, borderWidth: 1 } : {}),
      }}
    >
      {(category.title.trim() || category.description.trim()) && (
        <CardHeader>
          {category.title.trim() && (
            <h3
              id={`sc-category-title-${category.id}`}
              className="sc-category-title text-base font-semibold leading-none"
              style={{ color: stylePreview.heading }}
            >
              {category.title}
              {category.required && <RequiredAsterisk />}
            </h3>
          )}
          {category.description.trim() && (
            <p className="sc-category-description text-sm text-muted-foreground" style={{ color: stylePreview.heading }}>
              {category.description}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent>
        {options}
        {validationError}
      </CardContent>
    </Card>
  )
}

export interface RenderedSectionProps {
  section: ProfileFieldSection
  stylePreview: StylePreview
  profile: SubscriberProfile
  onProfileChange: (updater: (prev: SubscriberProfile) => SubscriberProfile) => void
  visible: boolean
  showValidation?: boolean
  formLayout?: 'stacked' | 'inline'
  formLabelWidth?: number
  embedded?: boolean
}

// Shared by SubscriptionCentreWidget and the builder's Preview tab -- see renderProfileField.
// `visible` is computed by the caller (first-section/conditional-visibility rules differ
// slightly between contexts, e.g. the Preview tab evaluates them against scratch answers).
export function RenderedSection({ section, stylePreview, profile, onProfileChange, visible, showValidation, formLayout, formLabelWidth, embedded }: RenderedSectionProps) {
  const fields = (
    <>
      {(section.title.trim() || section.description?.trim()) && (
        <div className={embedded ? 'mb-4' : undefined}>
          {section.title.trim() && (
            <h2 className="sc-section-title text-lg font-semibold leading-none" style={{ color: stylePreview.heading }}>
              {section.title}
            </h2>
          )}
          {section.description?.trim() && (
            <p className="sc-section-description mt-1 text-sm" style={{ color: stylePreview.heading }}>
              {section.description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {section.fields.map((field) => (
          <AnimatedVisibility key={field.id} visible={isProfileFieldVisible(field, profile)}>
            <div id={`sc-field-${field.id}`} data-field-id={field.id} className={`sc-field sc-field--${field.type}`}>
              {renderProfileField(field, stylePreview.heading, profile, onProfileChange, showValidation, formLayout, formLabelWidth)}
              {showValidation && field.required && !isProfileFieldAnswered(field, profile) && (
                <p id={`field-${field.id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-destructive">This field is required.</p>
              )}
            </div>
          </AnimatedVisibility>
        ))}
      </div>
    </>
  )

  if (embedded) {
    return (
      <AnimatedVisibility key={section.id} visible={visible}>
        <div id={`sc-section-${section.id}`} data-section-id={section.id} className="sc-section">
          {fields}
        </div>
      </AnimatedVisibility>
    )
  }

  return (
    <AnimatedVisibility key={section.id} visible={visible}>
      <Card
        id={`sc-section-${section.id}`}
        data-section-id={section.id}
        className="sc-section"
        style={{
          backgroundColor: stylePreview.background,
          ...(stylePreview.cardBorder ? { borderColor: stylePreview.cardBorder, borderWidth: 1 } : {}),
        }}
      >
        {(section.title.trim() || section.description?.trim()) && (
          <CardHeader>
            {section.title.trim() && (
              <h2 className="sc-section-title text-lg font-semibold leading-none" style={{ color: stylePreview.heading }}>
                {section.title}
              </h2>
            )}
            {section.description?.trim() && (
              <p className="sc-section-description text-sm text-muted-foreground" style={{ color: stylePreview.heading }}>
                {section.description}
              </p>
            )}
          </CardHeader>
        )}
        <CardContent className="space-y-6">
          {section.fields.map((field) => (
            <AnimatedVisibility key={field.id} visible={isProfileFieldVisible(field, profile)}>
              <div id={`sc-field-${field.id}`} data-field-id={field.id} className={`sc-field sc-field--${field.type}`}>
                {renderProfileField(field, stylePreview.heading, profile, onProfileChange, showValidation, formLayout, formLabelWidth)}
                {showValidation && field.required && !isProfileFieldAnswered(field, profile) && (
                  <p id={`field-${field.id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-destructive">This field is required.</p>
                )}
              </div>
            </AnimatedVisibility>
          ))}
        </CardContent>
      </Card>
    </AnimatedVisibility>
  )
}

export function SubscriptionCentreWidget({
  centre,
  profile,
  onProfileChange,
  answers,
  onAnswersChange,
}: SubscriptionCentreWidgetProps) {
  // The first Form Fields section in display order is never conditional -- enforced here too
  // (not just in the builder UI) so a subscriber is always left with at least one section to
  // fill in, even if a centre's saved data somehow has a rule on it.
  const firstSectionId = centre.sectionOrder.find((id) => centre.profileFieldSections.some((s) => s.id === id))

  return (
    // Scoped to this subtree (not <html>) so the centre's theme colors only affect the
    // rendered form -- the rest of the app (builder chrome, page background) keeps its
    // own default appearance regardless of which theme the centre is set to.
    <>
    {centre.cardStyle && <style dangerouslySetInnerHTML={{ __html: getCardStyleCss(centre.cardStyle) }} />}
    <div data-color-theme={centre.themePresetId} data-card-canvas className={getCardSpacingClass(centre.cardStyle)}>
      {centre.sectionOrder.map((id) => {
        const section = centre.profileFieldSections.find((s) => s.id === id)
        if (section) {
          const isFirstSection = section.id === firstSectionId
          const hasVisibleField = section.fields.length === 0 || section.fields.some((field) => isProfileFieldVisible(field, profile))
          const visible = (isFirstSection || isSectionVisible(section, profile, answers)) && hasVisibleField
          const stylePreview = getStylePreviews(centre.themePresetId)[section.cardStyleIndex ?? 0]
          return (
            <RenderedSection
              key={id}
              section={section}
              stylePreview={stylePreview}
              profile={profile}
              onProfileChange={onProfileChange}
              visible={visible}
              formLayout={centre.formLayout}
              formLabelWidth={centre.formLabelWidth}
            />
          )
        }

        const category = centre.categories.find((c) => c.id === id)
        if (category) {
          const stylePreview = getStylePreviews(centre.themePresetId)[category.cardStyleIndex ?? 0]
          return (
            <AnimatedVisibility key={category.id} visible={isCategoryVisible(category, profile, answers)}>
              <RenderedCategory category={category} stylePreview={stylePreview} answers={answers} onAnswersChange={onAnswersChange} />
            </AnimatedVisibility>
          )
        }

        const contentBlock = (centre.contentBlocks ?? []).find((b) => b.id === id)
        if (contentBlock) {
          return <RenderedContentBlock key={id} block={contentBlock} />
        }

        return null
      })}
    </div>
    </>
  )
}
