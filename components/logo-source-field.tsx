'use client'

import { ImageUploadField } from '@/components/image-upload-field'
import { SettingRow } from '@/components/setting-row'
import { Segmented } from '@/components/ui/segmented'

interface LogoSourceFieldProps {
  // The section's own logo. `undefined` means "follow Design > Brand"; an empty string means
  // "custom, nothing uploaded yet" — both still render the brand logo, but only the first
  // keeps tracking it when Brand changes.
  value?: string
  onChange: (v: string | undefined) => void
  // What this section is, for the copy: "banner", "footer", "email banner"…
  section: string
}

// Lets a banner/footer either inherit the Brand logo or carry its own image. Most centres
// want one logo everywhere, so Brand stays the default and nothing is stored until someone
// deliberately switches — an untouched section keeps following Design > Brand forever.
export function LogoSourceField({ value, onChange, section }: LogoSourceFieldProps) {
  const mode = value === undefined ? 'brand' : 'custom'

  return (
    <div className="space-y-2.5">
      <SettingRow label="Source">
        <Segmented
          options={[
            { value: 'brand', label: 'Brand logo' },
            { value: 'custom', label: 'Custom logo' },
          ]}
          value={mode}
          // Switching to Custom starts empty rather than copying the Brand URL, so "custom"
          // never silently means "a stale copy of the brand logo". Until something is
          // uploaded the section still falls back to Brand, so the preview doesn't go blank.
          onChange={(v) => onChange(v === 'brand' ? undefined : '')}
        />
      </SettingRow>

      {/* Brand mode needs no controls of its own — the live preview already shows what's
          inherited, so a second copy of the logo here was just noise. */}
      {mode === 'custom' && (
        <ImageUploadField
          value={value || undefined}
          // Clearing the image keeps Custom selected with an empty field, rather than snapping
          // the toggle back to Brand mid-edit.
          onChange={(url) => onChange(url ?? '')}
          hint={
            value
              ? `Used for this ${section} only.`
              : `SVG, PNG or WebP recommended. Max 10 MB. Until you add one, the Brand logo is used.`
          }
          previewClassName="max-h-10 max-w-[160px]"
        />
      )}
    </div>
  )
}
