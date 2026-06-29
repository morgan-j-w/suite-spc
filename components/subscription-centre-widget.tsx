'use client'

import {
  type Category,
  type CategoryAnswers,
  type CustomProfileField,
  type ProfileFieldSection,
  type SubscriberProfile,
  getBuiltInFieldOptions,
  isCategoryVisible,
  isProfileFieldVisible,
  isSectionVisible,
} from '@/lib/subscription-types'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { getReadableTextColor, getStylePreviews } from '@/lib/style-previews'
import { renderFormattedText, renderFormattedBlocks } from '@/lib/format-text'
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
import { RatingInput } from '@/components/rating-input'

const STANDARD_PROFILE_FIELDS = ['email', 'firstName', 'lastName', 'phone', 'company', 'jobTitle']

interface SubscriptionCentreWidgetProps {
  centre: SubscriptionCentre
  profile: SubscriberProfile
  onProfileChange: (updater: (prev: SubscriberProfile) => SubscriberProfile) => void
  answers: CategoryAnswers
  onAnswersChange: (updater: (prev: CategoryAnswers) => CategoryAnswers) => void
}

const RequiredAsterisk = () => <span className="text-destructive">&nbsp;*</span>

export function SubscriptionCentreWidget({
  centre,
  profile,
  onProfileChange,
  answers,
  onAnswersChange,
}: SubscriptionCentreWidgetProps) {

  const getProfileFieldValue = (field: CustomProfileField) => {
    const isStandardField = STANDARD_PROFILE_FIELDS.includes(field.id)
    return isStandardField
      ? (profile[field.id as keyof Omit<SubscriberProfile, 'customFields'>] as string)
      : ((profile.customFields[field.id] as string | string[] | boolean | number | undefined) ?? '')
  }

  const updateProfile = (field: keyof Omit<SubscriberProfile, 'customFields'>, value: string) => {
    onProfileChange((prev) => ({ ...prev, [field]: value }))
  }

  const updateCustomField = (fieldId: string, value: string | string[] | boolean | number) => {
    onProfileChange((prev) => ({ ...prev, customFields: { ...prev.customFields, [fieldId]: value } }))
  }

  const updateCheckboxAnswer = (categoryId: string, optionKey: string, checked: boolean) => {
    onAnswersChange((prev) => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] as Record<string, boolean>), [optionKey]: checked },
    }))
  }

  const updateRadioAnswer = (categoryId: string, value: string) => {
    onAnswersChange((prev) => ({ ...prev, [categoryId]: value }))
  }

  const renderProfileField = (field: CustomProfileField, headingColor: string) => {
    const isStandardField = STANDARD_PROFILE_FIELDS.includes(field.id)
    const value = getProfileFieldValue(field)
    const fieldId = `field-${field.id}`
    const label = (
      <Label htmlFor={fieldId} style={{ color: headingColor }}>
        {field.label}
        {field.required && <RequiredAsterisk />}
      </Label>
    )
    const helpText = field.helpText && <p className="text-sm" style={{ color: headingColor }}>{field.helpText}</p>

    const handleTextChange = (next: string) =>
      isStandardField
        ? updateProfile(field.id as keyof Omit<SubscriberProfile, 'customFields'>, next)
        : updateCustomField(field.id, next)

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            {label}
            {helpText}
            <Input
              id={fieldId}
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              placeholder={field.placeholder}
              value={(value as string) || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              required={field.required}
              className="bg-white"
              controlColor={headingColor}
            />
          </div>
        )

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            {label}
            {helpText}
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
              className="bg-white"
              controlColor={headingColor}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            {label}
            {helpText}
            <Textarea
              id={fieldId}
              placeholder={field.placeholder}
              value={(value as string) || ''}
              onChange={(e) => updateCustomField(field.id, e.target.value)}
              required={field.required}
              className="bg-white"
              controlColor={headingColor}
            />
          </div>
        )

      case 'select':
      case 'country':
      case 'state_au': {
        const options = field.options?.length ? field.options : getBuiltInFieldOptions(field.type) || []
        return (
          <div key={field.id} className="space-y-2">
            {label}
            {helpText}
            <Select value={(value as string) || ''} onValueChange={(v) => updateCustomField(field.id, v)}>
              <SelectTrigger id={fieldId} className="w-full bg-white" controlColor={headingColor}>
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
          </div>
        )
      }

      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            {label}
            {helpText}
            <RadioGroup value={(value as string) || ''} onValueChange={(v) => updateCustomField(field.id, v)}>
              <div className="space-y-2">
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
          </div>
        )

      case 'checkboxGroup': {
        const checkedValues = (profile.customFields[field.id] as string[]) || []
        return (
          <div key={field.id} className="space-y-3">
            {label}
            {helpText}
            <div className="space-y-2">
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
          </div>
        )
      }

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-start gap-3">
            <Checkbox
              id={fieldId}
              className="mt-0.5"
              checked={Boolean(profile.customFields[field.id])}
              onCheckedChange={(checked) => updateCustomField(field.id, checked as boolean)}
              controlColor={headingColor}
              indicatorColor={getReadableTextColor(headingColor)}
            />
            <div className="space-y-1">
              {label}
              {helpText}
            </div>
          </div>
        )

      case 'toggle': {
        const checkedValues = (profile.customFields[field.id] as string[]) || []
        return (
          <div key={field.id} className="space-y-3">
            {label}
            {helpText}
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
          </div>
        )
      }

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            {label}
            {helpText}
            <Input
              id={fieldId}
              type="date"
              value={(value as string) || ''}
              onChange={(e) => updateCustomField(field.id, e.target.value)}
              required={field.required}
              className="bg-white"
              controlColor={headingColor}
            />
          </div>
        )

      case 'range': {
        const min = field.min ?? 0
        const max = field.max ?? 100
        const step = field.step ?? 1
        const numValue = typeof value === 'number' ? value : min
        return (
          <div key={field.id} className="space-y-3">
            {label}
            {helpText}
            <div className="flex items-center gap-3">
              <Slider
                id={fieldId}
                value={[numValue]}
                min={min}
                max={max}
                step={step}
                onValueChange={([v]) => updateCustomField(field.id, v)}
              />
              <span className="w-10 shrink-0 text-right text-sm" style={{ color: headingColor }}>{numValue}</span>
            </div>
          </div>
        )
      }

      case 'rating': {
        const numValue = typeof value === 'number' ? value : 0
        return (
          <div key={field.id} className="space-y-2">
            {label}
            {helpText}
            <RatingInput id={fieldId} value={numValue} max={field.ratingMax || 5} onChange={(v) => updateCustomField(field.id, v)} />
          </div>
        )
      }

      case 'heading':
        return (
          <div key={field.id} className="border-b pb-3">
            <h3 className="text-lg font-semibold" style={{ color: headingColor }}>{renderFormattedText(field.label)}</h3>
          </div>
        )

      case 'paragraph':
        return (
          <div key={field.id} className="space-y-2 text-sm" style={{ color: headingColor, textAlign: field.textAlign }}>
            {renderFormattedBlocks(field.label)}
          </div>
        )
    }
  }

  const renderCategory = (category: Category) => {
    const stylePreview = getStylePreviews(centre.themePresetId)[category.cardStyleIndex ?? 0]
    return (
    <Card
      key={category.id}
      style={{
        backgroundColor: stylePreview.background,
        ...(stylePreview.cardBorder ? { borderColor: stylePreview.cardBorder, borderWidth: 1 } : {}),
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: stylePreview.heading }}>
          {category.title}
          {category.required && <RequiredAsterisk />}
        </CardTitle>
        {category.description && <CardDescription style={{ color: stylePreview.heading }}>{category.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {category.type === 'checkbox' ? (
          <div className="space-y-4">
            {category.options.map((option) => (
              <div key={option.key} className="flex items-start gap-3">
                <Checkbox
                  id={`${category.id}-${option.key}`}
                  checked={(answers[category.id] as Record<string, boolean>)?.[option.key] || false}
                  onCheckedChange={(checked) => updateCheckboxAnswer(category.id, option.key, checked as boolean)}
                  controlColor={stylePreview.heading}
                  indicatorColor={getReadableTextColor(stylePreview.heading)}
                />
                <div className="grid gap-1">
                  <Label htmlFor={`${category.id}-${option.key}`} className="cursor-pointer font-medium" style={{ color: stylePreview.heading }}>
                    {option.label}
                  </Label>
                  {option.description && <p className="text-sm" style={{ color: stylePreview.heading }}>{option.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup
            value={(answers[category.id] as string) || ''}
            onValueChange={(value) => updateRadioAnswer(category.id, value)}
          >
            <div className="space-y-4">
              {category.options.map((option) => (
                <div key={option.key} className="flex items-start gap-3">
                  <RadioGroupItem value={option.key} id={`${category.id}-${option.key}`} controlColor={stylePreview.heading} />
                  <div className="grid gap-1">
                    <Label htmlFor={`${category.id}-${option.key}`} className="cursor-pointer font-medium" style={{ color: stylePreview.heading }}>
                      {option.label}
                    </Label>
                    {option.description && <p className="text-sm" style={{ color: stylePreview.heading }}>{option.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
      </CardContent>
    </Card>
    )
  }

  // The first Form Fields section in display order is never conditional -- enforced here too
  // (not just in the builder UI) so a subscriber is always left with at least one section to
  // fill in, even if a centre's saved data somehow has a rule on it.
  const firstSectionId = centre.sectionOrder.find((id) => centre.profileFieldSections.some((s) => s.id === id))

  const renderSection = (section: ProfileFieldSection) => {
    const isFirstSection = section.id === firstSectionId
    const hasVisibleField = section.fields.length === 0 || section.fields.some((field) => isProfileFieldVisible(field, profile))
    const sectionVisible = (isFirstSection || isSectionVisible(section, profile, answers)) && hasVisibleField
    const stylePreview = getStylePreviews(centre.themePresetId)[section.cardStyleIndex ?? 0]

    return (
      <AnimatedVisibility key={section.id} visible={sectionVisible}>
        <Card
          style={{
            backgroundColor: stylePreview.background,
            ...(stylePreview.cardBorder ? { borderColor: stylePreview.cardBorder, borderWidth: 1 } : {}),
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: stylePreview.heading }}>{section.title}</CardTitle>
            {section.description && <CardDescription style={{ color: stylePreview.heading }}>{section.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {section.fields.map((field) => (
              <AnimatedVisibility key={field.id} visible={isProfileFieldVisible(field, profile)}>
                {renderProfileField(field, stylePreview.heading)}
              </AnimatedVisibility>
            ))}
          </CardContent>
        </Card>
      </AnimatedVisibility>
    )
  }

  return (
    // Scoped to this subtree (not <html>) so the centre's theme colors only affect the
    // rendered form -- the rest of the app (builder chrome, page background) keeps its
    // own default appearance regardless of which theme the centre is set to.
    <div data-color-theme={centre.themePresetId} className="space-y-6">
      {centre.sectionOrder.map((id) => {
        const section = centre.profileFieldSections.find((s) => s.id === id)
        if (section) return renderSection(section)

        const category = centre.categories.find((c) => c.id === id)
        if (category) {
          return (
            <AnimatedVisibility key={category.id} visible={isCategoryVisible(category, profile, answers)}>
              {renderCategory(category)}
            </AnimatedVisibility>
          )
        }

        return null
      })}
    </div>
  )
}
