// Custom field types
export type ProfileFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiSelect'
  | 'country'
  | 'state_au'
  | 'radio'
  | 'checkbox'
  | 'checkboxGroup'
  | 'toggle'
  | 'date'
  | 'range'
  | 'rating'
  | 'heading'
  | 'paragraph'

export type FieldVisibilityOperator = 'hasValue' | 'equals' | 'contains'

export interface FieldVisibilityRule {
  fieldId: string
  operator: FieldVisibilityOperator
  // 'equals' accepts multiple values (matches if the source value is any one of them);
  // 'contains' and free-text matching still use a single string.
  value?: string | string[]
}

// Custom profile field definition
export interface CustomProfileField {
  id: string
  label: string
  type: ProfileFieldType
  required: boolean
  placeholder?: string
  helpText?: string
  visibleWhen?: FieldVisibilityRule[]
  options?: { value: string; label: string }[] // For select, multiSelect, radio, and checkboxGroup types
  min?: number // For number and range types
  max?: number // For number and range types
  step?: number // For number and range types
  ratingMax?: number // For rating type, defaults to 5
  // Set on fields the builder seeds by default (e.g. Email) that a centre can't function
  // without -- hides the remove control rather than letting it be deleted by mistake.
  locked?: boolean
}

// Field types that are user-defined choice lists (need an options editor). Radio, checkbox,
// and toggle are all "groups" of one or more options — a group with a single option is just
// a single radio/checkbox/toggle, so there's no separate non-group variant of these.
const CHOICE_FIELD_TYPES: ProfileFieldType[] = ['select', 'multiSelect', 'radio', 'checkboxGroup', 'toggle']
export const isChoiceFieldType = (type: ProfileFieldType) => CHOICE_FIELD_TYPES.includes(type)

// Field types with a built-in, non-editable option list
const FIXED_OPTION_FIELD_TYPES: ProfileFieldType[] = ['country', 'state_au']
export const hasFixedOptions = (type: ProfileFieldType) => FIXED_OPTION_FIELD_TYPES.includes(type)

// Display-only content, not an input — never required, never part of submitted data
export const isDisplayFieldType = (type: ProfileFieldType) => type === 'heading' || type === 'paragraph'

// Field types you select/check/toggle rather than type into — the only ones reliable
// enough to drive a conditional "show only when X matches" rule. Free-text types (text,
// email, phone, number, textarea, date, range) produce arbitrary values that are too
// fragile to match against, so they're excluded as condition sources.
const CONDITION_SOURCE_FIELD_TYPES: ProfileFieldType[] = [
  'checkbox', 'checkboxGroup', 'radio', 'select', 'multiSelect', 'country', 'state_au', 'toggle',
]
export const isConditionSourceFieldType = (type: ProfileFieldType) => CONDITION_SOURCE_FIELD_TYPES.includes(type)

// Boolean-valued types where only "has a value" (i.e. is checked/on) is a meaningful condition.
// Toggle is excluded here — it's now a group of options like checkboxGroup, valued as an array.
const BOOLEAN_FIELD_TYPES: ProfileFieldType[] = ['checkbox']
export const isBooleanFieldType = (type: ProfileFieldType) => BOOLEAN_FIELD_TYPES.includes(type)

// The real system this tool models only stores answers as one of these four shapes,
// regardless of which input widget collected them — used to label fields in the
// field-reuse autocomplete the way they'll actually be saved.
export type SimplifiedFieldType = 'Text' | 'Number' | 'Single select' | 'Multi select' | 'Date'

const SIMPLIFIED_FIELD_TYPE_MAP: Partial<Record<ProfileFieldType, SimplifiedFieldType>> = {
  text: 'Text',
  email: 'Text',
  phone: 'Text',
  textarea: 'Text',
  number: 'Number',
  range: 'Number',
  rating: 'Number',
  select: 'Single select',
  multiSelect: 'Multi select',
  country: 'Single select',
  state_au: 'Single select',
  radio: 'Single select',
  checkbox: 'Single select',
  checkboxGroup: 'Single select',
  toggle: 'Single select',
  date: 'Date',
}

export function getSimplifiedFieldType(type: ProfileFieldType): SimplifiedFieldType | null {
  return SIMPLIFIED_FIELD_TYPE_MAP[type] ?? null
}

export const AU_STATE_OPTIONS: { value: string; label: string }[] = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
]

export const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Chad', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba',
  'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius',
  'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore', 'Slovakia',
  'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan',
  'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia',
  'Zimbabwe',
].map((name) => ({ value: name, label: name }))

export function getBuiltInFieldOptions(type: ProfileFieldType): { value: string; label: string }[] | undefined {
  if (type === 'country') return COUNTRY_OPTIONS
  if (type === 'state_au') return AU_STATE_OPTIONS
  return undefined
}

// Subscriber profile fields
export interface SubscriberProfile {
  email: string
  firstName: string
  lastName: string
  phone: string
  company: string
  jobTitle: string
  customFields: Record<string, string | string[] | boolean | number> // Dynamic custom fields
}

// The fixed catalog of "standard" fields — their label/type/options are system-defined and
// cannot be edited; only whether they're present and whether they're required can be changed.
export interface StandardFieldDef {
  id: string
  label: string
  type: ProfileFieldType
  placeholder?: string
  helpText?: string
  options?: { value: string; label: string }[]
  required?: boolean
}

export const standardFieldCatalog: StandardFieldDef[] = [
  {
    id: 'title',
    label: 'Title',
    type: 'select',
    options: ['Mr', 'Mrs', 'Ms', 'Mx', 'Dr', 'Prof'].map((value) => ({ value, label: value })),
  },
  { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'John' },
  { id: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
  },
  { id: 'phone', label: 'Mobile', type: 'phone', placeholder: '+1 (555) 000-0000' },
  { id: 'country', label: 'Country', type: 'country' },
]

export const standardFieldIds = standardFieldCatalog.map((f) => f.id)
export const isStandardFieldId = (id: string) => standardFieldIds.includes(id)

// A card of profile fields shown together in the builder and on the live form. Centres can
// have multiple sections, reorderable alongside mail group categories (e.g. a "Your Details"
// section, then a mail group, then a "Work Info" section further down the form).
export interface ProfileFieldSection {
  id: string
  title: string
  description?: string
  fields: CustomProfileField[]
  // Index into getStylePreviews(themePresetId) for this centre.
  cardStyleIndex?: number
  visibleWhen?: FieldVisibilityRule[]
}

// Every centre needs a way to identify the subscriber, so Email is seeded in and locked
// against removal -- everything else (First Name, Last Name, etc.) stays opt-in via
// "Add Standard Field" rather than being hardcoded in from the start.
export const defaultProfileFieldSections: ProfileFieldSection[] = [
  {
    id: 'default-contact-info',
    title: 'Your Details',
    fields: [{ id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com', locked: true }],
  },
]

export function flattenProfileFields(sections: ProfileFieldSection[]): CustomProfileField[] {
  return sections.flatMap((section) => section.fields)
}

// Used by any code that adds fields in bulk (e.g. future import flows) to strip out
// any incoming field whose id already exists somewhere on the form, preventing duplicate
// id collisions that would break data binding and accessibility label associations.
export function deduplicateIncomingFields(
  incoming: CustomProfileField[],
  existing: CustomProfileField[]
): CustomProfileField[] {
  const existingIds = new Set(existing.map((f) => f.id))
  return incoming.filter((f) => !existingIds.has(f.id))
}

// Answers to categories, keyed by category id. Checkbox categories store a map of
// option key -> selected; radio categories store the selected option key directly.
export type CategoryAnswers = Record<string, Record<string, boolean> | string>

// Category option
export interface CategoryOption {
  key: string
  label: string
  description: string
  // The real mail group/list this option represents, drawn from the centre's mail groups.
  mailGroupId?: string
}

// Category definition (a group of related preference options, e.g. "Newsletter Topics")
export interface Category {
  id: string
  title: string
  description: string
  type: 'checkbox' | 'radio'
  options: CategoryOption[]
  required?: boolean
  visibleWhen?: FieldVisibilityRule[]
  // Index into getStylePreviews(themePresetId) for this centre.
  cardStyleIndex?: number
}

// Mail group categories are entirely optional — a centre starts with none.
export const defaultCategories: Category[] = []

export function buildDefaultAnswers(categories: Category[]): CategoryAnswers {
  const answers: CategoryAnswers = {}
  categories.forEach((category) => {
    if (category.type === 'checkbox') {
      const selections: Record<string, boolean> = {}
      category.options.forEach((option) => {
        selections[option.key] = false
      })
      answers[category.id] = selections
    } else {
      answers[category.id] = category.options[0]?.key || ''
    }
  })
  return answers
}

// Color-coded badge styling for field/category types, shared between the profile field
// editor and the category editor so type names read consistently everywhere.
const blue = 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300'
const purple = 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300'
const emerald = 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
const amber = 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300'
const slate = 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'

export const fieldTypeBadge: Record<ProfileFieldType, { label: string; className: string }> = {
  text: { label: 'Text', className: blue },
  email: { label: 'Email', className: blue },
  phone: { label: 'Phone', className: blue },
  number: { label: 'Number', className: blue },
  textarea: { label: 'Textarea', className: blue },
  select: { label: 'Dropdown', className: purple },
  multiSelect: { label: 'Multi Select', className: purple },
  country: { label: 'Country', className: purple },
  state_au: { label: 'State (AU)', className: purple },
  radio: { label: 'Radio', className: purple },
  checkboxGroup: { label: 'Checkbox', className: purple },
  checkbox: { label: 'Checkbox', className: emerald },
  toggle: { label: 'Toggle', className: purple },
  date: { label: 'Date', className: amber },
  range: { label: 'Range', className: amber },
  rating: { label: 'Rating', className: amber },
  heading: { label: 'Heading', className: slate },
  paragraph: { label: 'Paragraph', className: slate },
}

type AnswerValue = string | string[] | boolean | number | undefined

export function getProfileFieldValue(profile: SubscriberProfile, fieldId: string): AnswerValue {
  if (fieldId in profile && fieldId !== 'customFields') {
    return profile[fieldId as keyof Omit<SubscriberProfile, 'customFields'>]
  }

  return profile.customFields[fieldId]
}

// Normalizes a category answer (radio string, or checkbox option-key->boolean map) into the
// same shape FieldVisibilityRule evaluation expects: a string (radio) or string[] (checkbox).
function categoryAnswerToValue(answer: Record<string, boolean> | string | undefined): AnswerValue {
  if (answer === undefined) return undefined
  if (typeof answer === 'string') return answer
  return Object.keys(answer).filter((key) => answer[key])
}

function isValuePresent(value: AnswerValue) {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return true
  return Boolean(value && value.trim())
}

function evaluateVisibilityRules(rules: FieldVisibilityRule[] | undefined, getValue: (fieldId: string) => AnswerValue) {
  if (!rules || rules.length === 0) return true

  return rules.every((rule) => {
    const currentValue = getValue(rule.fieldId)

    switch (rule.operator) {
      case 'hasValue':
        return isValuePresent(currentValue)
      case 'equals': {
        const ruleValues = Array.isArray(rule.value) ? rule.value : [rule.value || '']
        if (Array.isArray(currentValue)) return currentValue.some((v) => ruleValues.includes(v))
        return ruleValues.includes(String(currentValue || ''))
      }
      case 'contains': {
        const ruleValue = Array.isArray(rule.value) ? rule.value[0] || '' : rule.value || ''
        if (Array.isArray(currentValue)) return currentValue.includes(ruleValue)
        return String(currentValue || '').toLowerCase().includes(ruleValue.toLowerCase())
      }
    }
  })
}

export function isProfileFieldVisible(field: CustomProfileField, profile: SubscriberProfile) {
  return evaluateVisibilityRules(field.visibleWhen, (fieldId) => getProfileFieldValue(profile, fieldId))
}

// Whether a required field has been answered. Display-only fields (section headings) are
// never required; booleans must be true; everything else just needs a non-empty value.
export function isProfileFieldAnswered(field: CustomProfileField, profile: SubscriberProfile) {
  if (isDisplayFieldType(field.type)) return true
  return isValuePresent(getProfileFieldValue(profile, field.id))
}

// A category's visibility rule can reference either a profile field or another category's answer.
export function isCategoryVisible(category: Category, profile: SubscriberProfile, answers: CategoryAnswers) {
  return evaluateVisibilityRules(category.visibleWhen, (fieldId) =>
    fieldId in answers ? categoryAnswerToValue(answers[fieldId]) : getProfileFieldValue(profile, fieldId)
  )
}

// A Form Fields section's visibility rule can reference either a profile field (from another
// section) or a category's answer, same as isCategoryVisible.
export function isSectionVisible(section: ProfileFieldSection, profile: SubscriberProfile, answers: CategoryAnswers) {
  return evaluateVisibilityRules(section.visibleWhen, (fieldId) =>
    fieldId in answers ? categoryAnswerToValue(answers[fieldId]) : getProfileFieldValue(profile, fieldId)
  )
}

export function isCategoryAnswered(category: Category, answers: CategoryAnswers) {
  const answer = answers[category.id]

  if (category.type === 'checkbox') {
    return Object.values((answer as Record<string, boolean>) || {}).some(Boolean)
  }

  return Boolean(answer)
}

export function formatVisibilityRule(rule: FieldVisibilityRule, getFieldLabel: (fieldId: string) => string) {
  const fieldLabel = getFieldLabel(rule.fieldId)

  switch (rule.operator) {
    case 'hasValue':
      return `${fieldLabel} has a value`
    case 'equals': {
      const values = Array.isArray(rule.value) ? rule.value : [rule.value || '']
      return `${fieldLabel} equals “${values.join('” or “')}”`
    }
    case 'contains': {
      const value = Array.isArray(rule.value) ? rule.value[0] || '' : rule.value || ''
      return `${fieldLabel} contains “${value}”`
    }
  }
}
