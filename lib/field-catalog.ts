import { v4 as uuidv4 } from 'uuid'
import type { CustomProfileField, FieldVisibilityRule, ProfileFieldType } from '@/lib/subscription-types'

// The fixed set of custom fields a subscription centre can actually collect data against —
// the profile-field equivalent of standardFieldCatalog (lib/subscription-types.ts), just for
// fields that aren't part of every centre by default. A builder can change how a catalog field
// is *displayed* (its label, help text, placeholder, whether it's required) and which widget
// renders it (any widget whose shape matches — see getFieldShape), but never invent a new
// field or change its options/min/max/step — those are the real system's data shape and
// clients can't be allowed to redefine them out from under existing subscriber records.
//
// Unlike the old field-library-store.ts, this list does not grow at runtime. Adding a new
// reusable field means adding an entry here.
export const fieldCatalog: CustomProfileField[] = [
  { id: 'lib-job-title', label: 'Job Title', type: 'text', required: false, placeholder: 'e.g., Marketing Manager' },
  { id: 'lib-company-name', label: 'Company Name', type: 'text', required: false, placeholder: 'e.g., Your Company' },
  { id: 'lib-work-phone', label: 'Work Phone', type: 'phone', required: false, placeholder: '+61 2 XXXX XXXX' },
  { id: 'lib-additional-comments', label: 'Additional Comments', type: 'textarea', required: false, placeholder: "Anything else you'd like us to know?" },

  // No min/max/step here on purpose -- the real system stores these as plain numbers with
  // no configurable limits, so any bounds would be invented. Slider bounds and star counts
  // are set per-placement in the builder instead (see buildFieldFromCatalog).
  { id: 'lib-employee-count', label: 'Number of Employees', type: 'number', required: false },
  { id: 'lib-annual-revenue', label: 'Annual Revenue', type: 'number', required: false },
  { id: 'lib-team-size', label: 'Team Size', type: 'number', required: false },

  {
    id: 'lib-industry',
    label: 'Industry',
    type: 'select',
    required: false,
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'finance', label: 'Finance' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'retail', label: 'Retail' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'lib-department',
    label: 'Department',
    type: 'select',
    required: false,
    options: [
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'support', label: 'Customer Support' },
    ],
  },
  {
    id: 'lib-preferred-language',
    label: 'Preferred Language',
    type: 'select',
    required: false,
    options: [
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'es', label: 'Spanish' },
    ],
  },
  {
    id: 'lib-how-did-you-hear',
    label: 'How did you hear about us?',
    type: 'radio',
    required: false,
    options: [
      { value: 'social', label: 'Social media' },
      { value: 'word-of-mouth', label: 'Word of mouth' },
      { value: 'search', label: 'Search engine' },
      { value: 'event', label: 'Event or conference' },
    ],
  },
  {
    id: 'lib-topics-of-interest',
    label: 'Topics of interest',
    type: 'checkboxGroup',
    required: false,
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'design', label: 'Design' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'business', label: 'Business strategy' },
    ],
  },
  {
    id: 'lib-contact-preferences',
    label: 'Contact preferences',
    type: 'toggle',
    required: false,
    options: [
      { value: 'newsletter', label: 'Weekly newsletter' },
      { value: 'product-news', label: 'Product news & updates' },
      { value: 'events', label: 'Events & webinars' },
    ],
  },

  { id: 'lib-renewal-date', label: 'Renewal Date', type: 'date', required: false },
  { id: 'lib-birth-date', label: 'Date of Birth', type: 'date', required: false },
]

export function getFieldCatalog(): CustomProfileField[] {
  return fieldCatalog
}

export function getCatalogField(id: string): CustomProfileField | undefined {
  return fieldCatalog.find((f) => f.id === id)
}

// A range slider is unusable without bounds, but the real system doesn't store any -- it
// just saves whatever number comes back. So the builder gets a workable starting range it
// can then tune per placement, rather than the catalog pretending to know one.
const DEFAULT_SLIDER_MIN = 0
const DEFAULT_SLIDER_MAX = 100
const DEFAULT_RATING_MAX = 5

// The one place a real, placeable field gets built from a catalog entry — used by the Add
// Field flow and by the demo templates alike, so both construct catalog-sourced fields the
// same way (fresh instance id, the catalog's label/options, the caller's chosen widget).
// `overrides` covers the things that are genuinely per-placement, matching what the Add Field
// flow leaves editable afterwards: display text/help/placeholder, whether this instance is
// required, a conditional visibility rule, and (demo templates only) a fixed instance id so a
// later visibleWhen rule can reference it.
export function buildFieldFromCatalog(
  catalogFieldId: string,
  widgetType: ProfileFieldType,
  overrides?: {
    id?: string
    label?: string
    helpText?: string
    placeholder?: string
    required?: boolean
    visibleWhen?: FieldVisibilityRule[]
  }
): CustomProfileField {
  const catalogField = getCatalogField(catalogFieldId)
  if (!catalogField) throw new Error(`Unknown catalog field id: ${catalogFieldId}`)
  const isSlider = widgetType === 'range'
  return {
    id: overrides?.id ?? uuidv4(),
    label: overrides?.label ?? catalogField.label,
    type: widgetType,
    required: overrides?.required ?? false,
    placeholder: overrides?.placeholder ?? catalogField.placeholder,
    helpText: overrides?.helpText ?? catalogField.helpText,
    options: catalogField.options?.map((o) => ({ ...o })),
    min: isSlider ? DEFAULT_SLIDER_MIN : undefined,
    max: isSlider ? DEFAULT_SLIDER_MAX : undefined,
    ratingMax: widgetType === 'rating' ? DEFAULT_RATING_MAX : undefined,
    visibleWhen: overrides?.visibleWhen,
  }
}
