'use client'

import { v4 as uuidv4 } from 'uuid'
import { Plus, Trash2 } from 'lucide-react'
import type { Brand, SocialLink, SocialPlatform } from '@/lib/subscription-centre'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from '@/components/image-upload-field'

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
    <Card className="gap-0 py-0">
      <CardHeader className="px-6 pt-4 pb-2">
        <CardTitle className="text-base">Brand</CardTitle>
        <p className="text-sm text-muted-foreground">Logo, social links, and contact details used across banner and footer layouts.</p>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pt-2 pb-6">

        {/* Logo */}
        <ImageUploadField
          label="Logo"
          value={brand.logoUrl}
          onChange={(url) => patch({ logoUrl: url })}
          hint="SVG, PNG or WebP recommended. Max 10 MB."
          previewClassName="max-h-10 max-w-[160px]"
        />

        {/* Back to website */}
        <div className="space-y-1.5">
          <Label>Back to website URL</Label>
          <Input
            placeholder="https://yoursite.com"
            value={brand.backUrl ?? ''}
            onChange={(e) => patch({ backUrl: e.target.value || undefined })}
          />
          <p className="text-xs text-muted-foreground">Used in banner layouts that include a "Back to website" link.</p>
        </div>

        {/* Social links */}
        <div className="space-y-2">
          <Label>Social links</Label>
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                <Select
                  value={link.platform}
                  onValueChange={(val) => updateLink(link.id, { platform: val as SocialPlatform })}
                >
                  <SelectTrigger className="w-36 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addLink} disabled={links.length >= PLATFORMS.length}>
            <Plus className="h-3.5 w-3.5" />
            Add social link
          </Button>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label>Address</Label>
          <Textarea
            placeholder={"123 Example Street\nCity, Country, 00000"}
            value={brand.address ?? ''}
            onChange={(e) => patch({ address: e.target.value || undefined })}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Copyright */}
        <div className="space-y-1.5">
          <Label>Copyright text</Label>
          <Input
            placeholder={`© ${new Date().getFullYear()} Your Company. All rights reserved.`}
            value={brand.copyrightText ?? ''}
            onChange={(e) => patch({ copyrightText: e.target.value || undefined })}
          />
        </div>

      </CardContent>
    </Card>
  )
}
