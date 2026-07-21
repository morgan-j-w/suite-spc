'use client'

import { v4 as uuidv4 } from 'uuid'
import { AtSign, Building2, Image, Link2, Plus, Trash2 } from 'lucide-react'
import type { Brand, SocialLink, SocialPlatform } from '@/lib/subscription-centre'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from '@/components/image-upload-field'
import { SettingGroup, SettingRow } from '@/components/setting-row'

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: 'facebook',  label: 'Facebook' },
  { value: 'x',         label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'threads',   label: 'Threads' },
]

interface BrandEditorProps {
  brand: Brand
  onChange: (brand: Brand) => void
}

export function BrandEditor({ brand, onChange }: BrandEditorProps) {
  const patch = (update: Partial<Brand>) => onChange({ ...brand, ...update })
  const links = brand.socialLinks ?? []

  const addLink = () => {
    const unused = PLATFORMS.find((p) => !links.some((l) => l.platform === p.value))
    patch({ socialLinks: [...links, { id: uuidv4(), platform: unused?.value ?? 'facebook', url: '' }] })
  }

  const updateLink = (id: string, update: Partial<SocialLink>) => {
    patch({ socialLinks: links.map((l) => (l.id === id ? { ...l, ...update } : l)) })
  }

  const removeLink = (id: string) => {
    patch({ socialLinks: links.filter((l) => l.id !== id) })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Logo, social links, and contact details used across banner, footer, and email layouts.</p>

      <SettingGroup title="Logo" icon={Image} collapsible defaultOpen>
        <ImageUploadField
          value={brand.logoUrl}
          onChange={(url) => patch({ logoUrl: url })}
          hint="SVG, PNG or WebP recommended. Max 10 MB."
          previewClassName="max-h-10 max-w-[160px]"
        />
      </SettingGroup>

      <SettingGroup title="Links" icon={Link2} collapsible defaultOpen>
        <SettingRow label="Website">
          <Input
            placeholder="https://yoursite.com"
            value={brand.backUrl ?? ''}
            onChange={(e) => patch({ backUrl: e.target.value || undefined })}
            className="h-7 flex-1 text-xs"
          />
        </SettingRow>
        <p className="text-xs text-muted-foreground">Used in banner layouts that include a &ldquo;Back to website&rdquo; link.</p>
      </SettingGroup>

      <SettingGroup title="Social" icon={AtSign} collapsible defaultOpen>
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-1.5">
            <Select
              value={link.platform}
              onValueChange={(val) => updateLink(link.id, { platform: val as SocialPlatform })}
            >
              <SelectTrigger className="h-7 w-32 shrink-0 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-7 flex-1 text-xs"
              placeholder="https://..."
              value={link.url}
              onChange={(e) => updateLink(link.id, { url: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removeLink(link.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={addLink} disabled={links.length >= PLATFORMS.length}>
          <Plus className="h-3.5 w-3.5" />
          Add social link
        </Button>
      </SettingGroup>

      <SettingGroup title="Details" icon={Building2} collapsible defaultOpen>
        <SettingRow label="Address" className="items-start">
          <Textarea
            placeholder={"123 Example Street\nSydney NSW 2000, Australia"}
            value={brand.address ?? ''}
            onChange={(e) => patch({ address: e.target.value || undefined })}
            rows={2}
            className="min-h-0 flex-1 resize-none text-xs"
          />
        </SettingRow>
        <SettingRow label="Copyright">
          <Input
            placeholder={`© ${new Date().getFullYear()} Your Company. All rights reserved.`}
            value={brand.copyrightText ?? ''}
            onChange={(e) => patch({ copyrightText: e.target.value || undefined })}
            className="h-7 flex-1 text-xs"
          />
        </SettingRow>
      </SettingGroup>
    </div>
  )
}
