'use client'

import { useRef, useState } from 'react'
import { Image, Trash2, Type, Upload } from 'lucide-react'
import type { ContentBlock } from '@/lib/subscription-centre'
import { RichTextEditor } from '@/components/rich-text-editor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ContentBlockCardProps {
  block: ContentBlock
  onUpdate: (patch: Partial<ContentBlock>) => void
  onRemove: () => void
}

export function ContentBlockCard({ block, onUpdate, onRemove }: ContentBlockCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const { error } = await res.json()
        setUploadError(error || 'Upload failed')
        return
      }
      const { url } = await res.json()
      onUpdate({ imageUrl: url })
    } catch {
      setUploadError('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-md bg-muted p-0.5">
            <button
              type="button"
              onClick={() => onUpdate({ type: 'text' })}
              className={cn(
                'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
                block.type === 'text' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Type className="h-3 w-3" />
              Text
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ type: 'image' })}
              className={cn(
                'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
                block.type === 'image' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Image className="h-3 w-3" />
              Image
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Remove content block"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-4">
        {block.type === 'text' && (
          <RichTextEditor
            value={block.html || ''}
            onChange={(html) => onUpdate({ html })}
            placeholder="Add text, links, formatted copy…"
          />
        )}

        {block.type === 'image' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={block.imageUrl || ''}
                onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                placeholder="https://example.com/image.png"
                className="flex-1 text-sm"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                className="sr-only"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-9 items-center gap-1.5 rounded-md border bg-muted px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>

            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

            {block.imageUrl && (
              <img
                src={block.imageUrl}
                alt={block.imageAlt || ''}
                className="max-h-48 w-auto rounded-md border object-contain"
              />
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Alt text</Label>
              <Input
                value={block.imageAlt || ''}
                onChange={(e) => onUpdate({ imageAlt: e.target.value })}
                placeholder="Describe the image for screen readers"
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Width</Label>
              <div className="flex gap-1 rounded-md bg-muted p-0.5">
                {(['contained', 'full'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onUpdate({ imageWidth: w })}
                    className={cn(
                      'flex-1 rounded px-2 py-1 text-xs font-medium capitalize transition-colors',
                      (block.imageWidth ?? 'contained') === w
                        ? 'bg-background shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
