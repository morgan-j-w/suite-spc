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
  brandLogoUrl?: string
  // What this section is, for the copy: "banner", "footer", "email banner"…
  section: string
}

// Lets a banner/footer either inherit the Brand logo or carry its own image. Most centres
// want one logo everywhere, so Brand stays the default and nothing is stored until someone
// deliberately switches — an untouched section keeps following Design > Brand forever.
export function LogoSourceField({ value, onChange, brandLogoUrl, section }: LogoSourceFieldProps) {
  const mode = value === undefined ? 'brand' : 'custom'

  return (
    <div className="space-y-2.5">
      <SettingRow label="Source">
        <Segmented
          options={[
            { value: 'brand', label: 'Brand logo' },
            { value: 'custom', label: 'Custom image' },
          ]}
          value={mode}
          // Switching to Custom starts empty rather than copying the Brand URL, so "custom"
          // never silently means "a stale copy of the brand logo". Until something is
          // uploaded the section still falls back to Brand, so the preview doesn't go blank.
          onChange={(v) => onChange(v === 'brand' ? undefined : '')}
        />
      </SettingRow>

      {mode === 'brand' ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          {brandLogoUrl ? (
            <>
              <img
                src={brandLogoUrl}
                alt=""
                className="max-h-10 max-w-[120px] rounded border border-border object-contain"
              />
              <p className="text-sm text-muted-foreground">
                Using the logo from Design &gt; Brand. Change it there and this {section} follows.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No logo set in Design &gt; Brand yet — add one there, or switch to Custom image to
              upload one just for this {section}.
            </p>
          )}
        </div>
      ) : (
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
