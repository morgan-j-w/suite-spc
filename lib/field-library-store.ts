import type { CustomProfileField } from '@/lib/subscription-types'

// A standing, global library of reusable custom fields, shared across every Subscription
// Centre -- separate from any one centre's localStorage entry. Grows automatically as the
// user creates custom fields (see upsertFieldInLibrary), so "Add Existing Field" always has
// something to offer once at least one custom field has ever been created, anywhere.
const STORAGE_KEY = 'preference-centre-field-library'

// Seeded on first-ever read so "Add Existing Field" has something to show out of the box --
// one example per question type the real system actually stores (text/number/single
// choice/date), per the field type system the picker already labels them with.
const SEED_FIELD_LIBRARY: CustomProfileField[] = [
  { id: 'lib-job-title', label: 'Job Title', type: 'text', required: false, placeholder: 'e.g., Marketing Manager' },
  { id: 'lib-company-name', label: 'Company Name', type: 'text', required: false, placeholder: 'e.g., Acme Inc' },
  { id: 'lib-employee-count', label: 'Number of Employees', type: 'number', required: false },
  { id: 'lib-annual-revenue', label: 'Annual Revenue', type: 'number', required: false },
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
  { id: 'lib-renewal-date', label: 'Renewal Date', type: 'date', required: false },
  { id: 'lib-birth-date', label: 'Date of Birth', type: 'date', required: false },
]

function readAll(): CustomProfileField[] {
  if (typeof window === 'undefined') return []
  const stored = window.localStorage.getItem(STORAGE_KEY)
  // Seed on the very first read ever (key has never been set) -- but once the user has their
  // own state saved, including an intentionally emptied library, respect it as-is.
  if (stored === null) {
    writeAll(SEED_FIELD_LIBRARY)
    return SEED_FIELD_LIBRARY
  }
  try {
    return JSON.parse(stored) as CustomProfileField[]
  } catch {
    return []
  }
}

function writeAll(fields: CustomProfileField[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
}

export function getFieldLibrary(): CustomProfileField[] {
  return readAll()
}

// Adds a newly created field, or refreshes an existing entry (keyed by id) as the user edits
// it -- so the library reflects a field's latest label/options while it's being set up.
export function upsertFieldInLibrary(field: CustomProfileField) {
  const library = readAll()
  const index = library.findIndex((f) => f.id === field.id)
  if (index === -1) {
    library.push(field)
  } else {
    library[index] = field
  }
  writeAll(library)
}
