'use client'

import { AlignCenter, AlignLeft, AlignRight, StretchHorizontal } from 'lucide-react'
import type { ColorTheme } from '@/lib/brand-config'
import type { SubmitButtonAlignment } from '@/lib/subscription-centre'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StylePicker } from '@/components/style-picker'
import { cn } from '@/lib/utils'

interface SubmitButtonCardProps {
  theme: ColorTheme
  text: string
  styleIndex: number
  alignment: SubmitButtonAlignment
  onTextChange: (text: string) => void
  onStyleIndexChange: (index: number) => void
  onAlignmentChange: (alignment: SubmitButtonAlignment) => void
}

const ALIGNMENT_OPTIONS: { value: SubmitButtonAlignment; label: string; icon: typeof AlignLeft }[] = [
  { value: 'left', label: 'Left', icon: AlignLeft },
  { value: 'center', label: 'Center', icon: AlignCenter },
  { value: 'right', label: 'Right', icon: AlignRight },
  { value: 'full', label: 'Full width', icon: StretchHorizontal },
]

export function SubmitButtonCard({
  theme,
  text,
  styleIndex,
  alignment,
  onTextChange,
  onStyleIndexChange,
  onAlignmentChange,
}: SubmitButtonCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
        <CardTitle className="text-base font-semibold">Submit Button</CardTitle>
        <StylePicker theme={theme} value={styleIndex} onChange={onStyleIndexChange} className="w-[130px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="submit-button-text">Button Text</Label>
          <Input
            id="submit-button-text"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Submit"
          />
        </div>
        <div className="space-y-2">
          <Label>Alignment</Label>
          <div className="flex gap-1">
            {ALIGNMENT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={alignment === option.value ? 'default' : 'outline'}
                size="sm"
                className={cn('gap-1.5', alignment === option.value && 'pointer-events-none')}
                onClick={() => onAlignmentChange(option.value)}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
