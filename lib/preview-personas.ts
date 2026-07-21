import {
  buildDefaultAnswers,
  flattenProfileFields,
  getBuiltInFieldOptions,
  isDisplayFieldType,
  type CategoryAnswers,
  type CustomProfileField,
  type SubscriberProfile,
} from '@/lib/subscription-types'
import type { SubscriptionCentre } from '@/lib/subscription-centre'

// Preview personas seed the live preview's scratch profile/answers in one click, so
// exercising conditional visibility doesn't require manually filling the form each time.
//
// - 'new':    a first-time visitor — everything blank, only rule-free blocks visible.
// - 'filled': a typical subscriber — profile complete, first option of each category
//             chosen, so single-answer-dependent rules fire.
// - 'all':    everything selected — maximum conditional visibility; if a block still
//             doesn't appear with this persona, its rule can never pass.
export type PreviewPersona = 'new' | 'filled' | 'all'

export const PREVIEW_PERSONAS: { id: PreviewPersona; label: string; description: string }[] = [
  { id: 'new', label: 'New visitor', description: 'Blank form — nothing filled in yet' },
  { id: 'filled', label: 'Typical subscriber', description: 'Details filled, first option of each category picked' },
  { id: 'all', label: 'Everything selected', description: 'All fields filled and every option ticked' },
]

export const EMPTY_PREVIEW_PROFILE: SubscriberProfile = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  jobTitle: '',
  customFields: {},
}

// Sample value per field type, mirroring the value shapes the real widget writes
// (string[] for multi-choice, boolean for checkbox, number for range/rating).
function sampleCustomFieldValue(field: CustomProfileField, selectAll: boolean): string | string[] | boolean | number | undefined {
  const options = field.options ?? getBuiltInFieldOptions(field.type)
  switch (field.type) {
    case 'text': return 'Sample answer'
    case 'email': return 'jane@example.com'
    case 'phone': return '+61 400 123 456'
    case 'number': return '25'
    case 'textarea': return 'Just a short note to test the layout.'
    case 'select':
    case 'radio':
    case 'country':
    case 'state_au':
      return options?.[0]?.value
    case 'multiSelect':
    case 'checkboxGroup':
    case 'toggle':
      if (!options?.length) return undefined
      return selectAll ? options.map((o) => o.value) : [options[0].value]
    case 'checkbox': return true
    case 'date': return new Date().toISOString().slice(0, 10)
    case 'range': return field.min ?? 50
    case 'rating': return 4
    default: return undefined
  }
}

export function buildPersonaState(centre: SubscriptionCentre, persona: PreviewPersona): { profile: SubscriberProfile; answers: CategoryAnswers } {
  if (persona === 'new') {
    return { profile: { ...EMPTY_PREVIEW_PROFILE, customFields: {} }, answers: buildDefaultAnswers(centre.categories) }
  }

  const selectAll = persona === 'all'

  const profile: SubscriberProfile = {
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+61 400 123 456',
    company: 'Example Co',
    jobTitle: 'Marketing Manager',
    customFields: {},
  }
  for (const field of flattenProfileFields(centre.profileFieldSections)) {
    if (isDisplayFieldType(field.type)) continue
    if (field.id in profile && field.id !== 'customFields') continue // standard fields already set
    const value = sampleCustomFieldValue(field, selectAll)
    if (value !== undefined) profile.customFields[field.id] = value
  }

  const answers: CategoryAnswers = {}
  for (const category of centre.categories) {
    if (category.type === 'checkbox') {
      const selections: Record<string, boolean> = {}
      category.options.forEach((option, i) => {
        selections[option.key] = selectAll || i === 0
      })
      answers[category.id] = selections
    } else {
      answers[category.id] = category.options[0]?.key || ''
    }
  }

  return { profile, answers }
}
