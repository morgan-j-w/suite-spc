'use client'

import { useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { v4 as uuidv4 } from 'uuid'
import { ChevronDown, ChevronUp, Code2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import type { BannerConfig, BannerLayout, Brand, FooterConfig, FooterLayout, BannerLink } from '@/lib/subscription-centre'
import type { ColorTheme } from '@/lib/brand-config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ImageUploadField } from '@/components/image-upload-field'
import { ColorRow } from '@/components/colour-row'
import { RenderedBanner, RenderedFooter } from '@/components/rendered-banner-footer'
import { SettingGroup, SettingRow } from '@/components/setting-row'
import { Segmented } from '@/components/ui/segmented'
import { cn } from '@/lib/utils'

// ─── Layout thumbnails ────────────────────────────────────────────────────────

function Thumb({ children, label, selected, onClick }: { children: React.ReactNode; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 text-center transition-colors',
        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
      )}
    >
      <div className="h-14 w-full overflow-hidden rounded">{children}</div>
      <span className="text-[10px] font-medium leading-tight text-muted-foreground">{label}</span>
    </button>
  )
}

const B: Record<BannerLayout, { label: string; sketch: React.ReactNode }> = {
  centred: {
    label: 'Centred',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-card p-1">
        <div className="h-2 w-10 rounded bg-muted" />
        <div className="h-1.5 w-16 rounded bg-foreground/30" />
        <div className="h-1 w-12 rounded bg-muted-foreground/30" />
      </div>
    ),
  },
  'bar-cta': {
    label: 'Bar + CTA',
    sketch: (
      <div className="flex h-full flex-col justify-between bg-card p-1.5">
        <div className="flex items-center justify-between">
          <div className="h-2 w-8 rounded bg-muted" />
          <div className="h-1.5 w-10 rounded bg-primary/50" />
        </div>
        <div>
          <div className="mb-0.5 h-1.5 w-14 rounded bg-foreground/30" />
          <div className="h-1 w-10 rounded bg-muted-foreground/30" />
        </div>
      </div>
    ),
  },
  'brand-band': {
    label: 'Brand band',
    sketch: (
      <div className="flex h-full items-center bg-card px-1.5 py-1 gap-2 border-b border-border">
        <div className="flex items-center gap-1 pr-2 border-r border-border self-stretch py-1 flex-shrink-0">
          <div className="w-0.5 self-stretch rounded bg-primary" />
          <div className="h-2 w-6 rounded bg-muted" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="h-1.5 w-14 rounded bg-foreground/40" />
          <div className="h-1 w-10 rounded bg-muted-foreground/30" />
        </div>
      </div>
    ),
  },
  'split-image': {
    label: 'Split image',
    sketch: (
      <div className="flex h-full gap-1 bg-card p-1.5">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <div className="h-1.5 w-6 rounded bg-muted" />
          <div className="h-1.5 w-10 rounded bg-foreground/30" />
          <div className="h-1 w-8 rounded bg-muted-foreground/30" />
        </div>
        <div className="w-1/3 rounded bg-muted" />
      </div>
    ),
  },
  minimal: {
    label: 'Minimal',
    sketch: (
      <div className="flex h-full items-center gap-1.5 bg-card p-1.5">
        <div className="h-2 w-8 rounded bg-muted" />
        <div className="h-1 w-14 rounded bg-muted-foreground/30" />
      </div>
    ),
  },
  'with-socials': {
    label: 'With socials',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-card p-1">
        <div className="h-2 w-10 rounded bg-muted" />
        <div className="h-1.5 w-14 rounded bg-foreground/30" />
        <div className="h-1 w-10 rounded bg-muted-foreground/30" />
        <div className="flex gap-1 pt-0.5">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-2 w-2 rounded bg-muted-foreground/40" />)}
        </div>
      </div>
    ),
  },
  'nav-strip': {
    label: 'Nav strip',
    sketch: (
      <div className="flex h-full flex-col bg-card">
        <div className="flex items-center justify-between border-b border-border px-1.5 py-1">
          <div className="h-1.5 w-8 rounded bg-muted" />
          <div className="h-1 w-8 rounded bg-primary/50" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 bg-muted/30 px-1">
          <div className="h-1.5 w-14 rounded bg-foreground/30" />
          <div className="h-1 w-10 rounded bg-muted-foreground/30" />
        </div>
      </div>
    ),
  },
  'feature-hero': {
    label: 'Feature hero',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-primary/80 p-2">
        <div className="h-2 w-8 rounded bg-white/50" />
        <div className="h-3 w-16 rounded bg-white/90" />
        <div className="h-1.5 w-12 rounded bg-white/55" />
      </div>
    ),
  },
  'logo-only': {
    label: 'Logo only',
    sketch: (
      <div className="flex h-full items-center justify-center bg-card p-2">
        <div className="h-5 w-16 rounded bg-muted" />
      </div>
    ),
  },
  'editorial-split': {
    label: 'Editorial',
    sketch: (
      <div className="flex h-full gap-2 bg-card p-1.5 border-b border-border">
        <div className="flex flex-[3] flex-col justify-center gap-1">
          <div className="h-0.5 w-4 rounded bg-primary mb-0.5" />
          <div className="h-2.5 w-14 rounded bg-foreground/30" />
          <div className="h-1 w-10 rounded bg-muted-foreground/25" />
        </div>
        <div className="flex flex-1 flex-col items-end justify-start gap-1 pt-0.5">
          <div className="h-2 w-7 rounded bg-muted" />
          <div className="h-1 w-5 rounded bg-primary/40" />
        </div>
      </div>
    ),
  },
  'triple-row': {
    label: 'Triple row',
    sketch: (
      <div className="flex h-full flex-col bg-card">
        <div className="flex items-center justify-end bg-muted/60 px-1.5 py-0.5">
          <div className="h-1 w-7 rounded bg-primary/40" />
        </div>
        <div className="flex flex-1 items-center justify-center border-b border-t border-border bg-card">
          <div className="h-2.5 w-10 rounded bg-muted" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-1">
          <div className="h-1.5 w-14 rounded bg-foreground/30" />
          <div className="h-1 w-10 rounded bg-muted-foreground/25" />
        </div>
      </div>
    ),
  },
  'logo-band': {
    label: 'Logo band',
    sketch: (
      <div className="flex h-full items-center justify-center gap-0 bg-card p-2">
        <div className="h-px flex-1 rounded bg-border" />
        <div className="mx-2 h-3 w-10 rounded bg-muted" />
        <div className="h-px flex-1 rounded bg-border" />
      </div>
    ),
  },
}

const F: Record<FooterLayout, { label: string; sketch: React.ReactNode }> = {
  'centred-stack': {
    label: 'Centred',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-card p-1 border-t border-border">
        <div className="h-1.5 w-8 rounded bg-muted" />
        <div className="flex gap-1">{[0,1,2,3].map(i=><div key={i} className="h-1.5 w-1.5 rounded bg-muted-foreground/40"/>)}</div>
        <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="h-1 w-5 rounded bg-muted-foreground/30"/>)}</div>
        <div className="h-1 w-14 rounded bg-muted-foreground/20" />
      </div>
    ),
  },
  'multi-column': {
    label: 'Multi-col',
    sketch: (
      <div className="flex h-full flex-col bg-card p-1.5 border-t border-border">
        <div className="flex gap-1.5 flex-1">
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-1.5 w-6 rounded bg-muted"/>
            <div className="flex gap-0.5 mt-0.5">{[0,1,2].map(i=><div key={i} className="h-1.5 w-1.5 rounded bg-muted-foreground/40"/>)}</div>
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            {[0,1,2].map(i=><div key={i} className="h-1 w-8 rounded bg-muted-foreground/30"/>)}
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            {[0,1,2].map(i=><div key={i} className="h-1 w-6 rounded bg-muted-foreground/30"/>)}
          </div>
        </div>
        <div className="mt-1 border-t border-border pt-1 flex justify-between">
          <div className="flex gap-1">{[0,1].map(i=><div key={i} className="h-1 w-5 rounded bg-muted-foreground/30"/>)}</div>
          <div className="h-1 w-8 rounded bg-muted-foreground/20"/>
        </div>
      </div>
    ),
  },
  'dark-band': {
    label: 'Accent band',
    sketch: (
      <div className="flex h-full items-center justify-between bg-card px-2 py-1.5 gap-1.5 border-t-2 border-primary">
        <div className="h-2 w-6 rounded bg-muted flex-shrink-0" />
        <div className="flex gap-1 flex-shrink-0">{[0,1,2].map(i=><div key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40"/>)}</div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex gap-0.5">{[0,1].map(i=><div key={i} className="h-1 w-3.5 rounded bg-muted-foreground/30"/>)}</div>
          <div className="h-1 w-5 rounded bg-muted-foreground/20"/>
        </div>
      </div>
    ),
  },
  'minimal-line': {
    label: 'Minimal',
    sketch: (
      <div className="flex h-full items-center justify-between bg-card p-1.5 border-t border-border">
        <div className="flex gap-1">{[0,1,2,3].map(i=><div key={i} className="h-1 w-5 rounded bg-muted-foreground/30"/>)}</div>
        <div className="h-1 w-8 rounded bg-muted-foreground/20"/>
      </div>
    ),
  },
  'split-cta': {
    label: 'Split CTA',
    sketch: (
      <div className="flex h-full items-center justify-between bg-card p-1.5 border-t border-border">
        <div className="flex flex-col gap-0.5">
          <div className="h-1.5 w-8 rounded bg-muted"/>
          <div className="h-1 w-10 rounded bg-muted-foreground/30"/>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="h-2 w-10 rounded bg-primary/50"/>
          <div className="flex gap-0.5">{[0,1,2].map(i=><div key={i} className="h-1.5 w-1.5 rounded bg-muted-foreground/40"/>)}</div>
        </div>
      </div>
    ),
  },
  'unsubscribe-focus': {
    label: 'Unsub focus',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-card p-1.5 border-t border-border">
        <div className="h-1 w-20 rounded bg-muted-foreground/25"/>
        <div className="flex gap-1">{[0,1].map(i=><div key={i} className="h-1 w-8 rounded bg-primary/40"/>)}</div>
        <div className="h-1 w-12 rounded bg-muted-foreground/20"/>
      </div>
    ),
  },
  'two-col': {
    label: 'Two col',
    sketch: (
      <div className="flex h-full items-start justify-between bg-card p-1.5 border-t border-border gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="h-1.5 w-8 rounded bg-muted mb-0.5"/>
          <div className="h-1 w-10 rounded bg-muted-foreground/30"/>
          <div className="h-1 w-8 rounded bg-muted-foreground/20"/>
        </div>
        <div className="flex flex-col items-end gap-0.5 pt-0.5">
          {[0,1,2].map(i=><div key={i} className="h-1 w-7 rounded bg-muted-foreground/30"/>)}
        </div>
      </div>
    ),
  },
  'social-focused': {
    label: 'Social',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-card p-1.5 border-t border-border">
        <div className="flex gap-1.5">
          {[0,1,2,3].map(i=><div key={i} className="h-3 w-3 rounded bg-muted-foreground/50"/>)}
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i=><div key={i} className="h-1 w-5 rounded bg-muted-foreground/25"/>)}
        </div>
      </div>
    ),
  },
  'stacked-card': {
    label: 'Card',
    sketch: (
      <div className="flex h-full items-center justify-center bg-background p-1.5 border-t border-border">
        <div className="flex w-full flex-col items-center gap-1 rounded border border-border bg-card p-1.5 shadow-sm">
          <div className="h-1.5 w-8 rounded bg-muted"/>
          <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="h-1.5 w-1.5 rounded bg-muted-foreground/40"/>)}</div>
          <div className="flex gap-1">{[0,1].map(i=><div key={i} className="h-1 w-5 rounded bg-muted-foreground/25"/>)}</div>
        </div>
      </div>
    ),
  },
  'inline-logo': {
    label: 'Inline logo',
    sketch: (
      <div className="flex h-full items-center justify-center gap-1.5 bg-card p-1.5 border-t-2 border-primary">
        <div className="h-1.5 w-6 rounded bg-muted" />
        <div className="h-1 w-0.5 rounded bg-muted-foreground/30" />
        {[0,1,2].map(i => <div key={i} className="h-1 w-4 rounded bg-muted-foreground/30"/>)}
        <div className="h-1 w-0.5 rounded bg-muted-foreground/30" />
        <div className="h-1 w-7 rounded bg-muted-foreground/20"/>
      </div>
    ),
  },
  'left-panel': {
    label: 'Left panel',
    sketch: (
      <div className="flex h-full border-t border-border">
        <div className="flex w-1/4 items-center justify-center bg-primary/70 p-1">
          <div className="h-2 w-6 rounded bg-white/60" />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-0.5 bg-card p-1.5">
          <div className="h-1 w-12 rounded bg-muted-foreground/30" />
          <div className="h-1 w-9 rounded bg-muted-foreground/20" />
          <div className="mt-0.5 flex gap-0.5">{[0,1,2].map(i => <div key={i} className="h-1 w-3.5 rounded bg-primary/40"/>)}</div>
        </div>
      </div>
    ),
  },
  'logo-cta': {
    label: 'Logo + CTA',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-card p-1.5 border-t border-border">
        <div className="h-2 w-8 rounded bg-muted" />
        <div className="flex gap-1 mt-0.5">
          <div className="h-2.5 w-10 rounded bg-primary/50" />
          <div className="h-2.5 w-8 rounded bg-transparent border border-muted-foreground/30" />
        </div>
        <div className="h-1 w-12 rounded bg-muted-foreground/20" />
      </div>
    ),
  },
}

// ─── Links editor ─────────────────────────────────────────────────────────────

function LinksEditor({ links, onChange, label }: { links: BannerLink[]; onChange: (l: BannerLink[]) => void; label: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      {links.map((link) => (
        <div key={link.id} className="flex items-center gap-2">
          <Input
            placeholder="Label"
            value={link.label}
            onChange={(e) => onChange(links.map((l) => l.id === link.id ? { ...l, label: e.target.value } : l))}
            className="flex-1"
          />
          <Input
            placeholder="https://..."
            value={link.url}
            onChange={(e) => onChange(links.map((l) => l.id === link.id ? { ...l, url: e.target.value } : l))}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => onChange(links.filter((l) => l.id !== link.id))}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5"
        onClick={() => onChange([...links, { id: uuidv4(), label: '', url: '' }])}>
        <Plus className="h-3.5 w-3.5" />
        Add link
      </Button>
    </div>
  )
}

// ─── Per-layout colour field definitions ─────────────────────────────────────

type ColourKey = 'backgroundColor' | 'headingColor' | 'bodyColor' | 'linkColor' | 'iconColor' | 'accentColor' | 'buttonBgColor' | 'buttonTextColor'
type ColourField = { key: ColourKey; label: string }

const BANNER_COLOUR_FIELDS: Record<BannerLayout, ColourField[]> = {
  centred:              [{ key: 'backgroundColor', label: 'Background' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }],
  'bar-cta':            [{ key: 'backgroundColor', label: 'Background' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }],
  'brand-band':         [{ key: 'backgroundColor', label: 'Background' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }, { key: 'accentColor', label: 'Accent stripe' }],
  'split-image':        [{ key: 'backgroundColor', label: 'Background' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }],
  minimal:              [{ key: 'backgroundColor', label: 'Background' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }],
  'with-socials':       [{ key: 'backgroundColor', label: 'Background' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'iconColor', label: 'Icons' }],
  'nav-strip':          [{ key: 'accentColor', label: 'Nav background' }, { key: 'backgroundColor', label: 'Band bg' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Nav link' }],
  'feature-hero':       [{ key: 'backgroundColor', label: 'Background' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }],
  'logo-only':          [{ key: 'backgroundColor', label: 'Background' }],
  'editorial-split':    [{ key: 'backgroundColor', label: 'Background' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'accentColor', label: 'Accent stroke' }],
  'triple-row':         [{ key: 'accentColor', label: 'Utility bar bg' }, { key: 'backgroundColor', label: 'Main bg' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }],
  'logo-band':          [{ key: 'backgroundColor', label: 'Background' }, { key: 'accentColor', label: 'Rule colour' }],
}

const FOOTER_COLOUR_FIELDS: Record<FooterLayout, ColourField[]> = {
  'minimal-line':      [{ key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }],
  'centred-stack':     [{ key: 'backgroundColor', label: 'Background' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'iconColor', label: 'Icons' }],
  'split-cta':         [{ key: 'backgroundColor', label: 'Background' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'iconColor', label: 'Icons' }, { key: 'buttonBgColor', label: 'Button bg' }, { key: 'buttonTextColor', label: 'Button text' }],
  'multi-column':      [{ key: 'backgroundColor', label: 'Background' }, { key: 'headingColor', label: 'Heading' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'iconColor', label: 'Icons' }],
  'dark-band':         [{ key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'iconColor', label: 'Icons' }, { key: 'accentColor', label: 'Top border' }],
  'unsubscribe-focus': [{ key: 'backgroundColor', label: 'Background' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }],
  'two-col':           [{ key: 'backgroundColor', label: 'Background' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }],
  'social-focused':    [{ key: 'backgroundColor', label: 'Background' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'iconColor', label: 'Icons' }],
  'stacked-card':      [{ key: 'backgroundColor', label: 'Card bg' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'iconColor', label: 'Icons' }],
  'inline-logo':       [{ key: 'backgroundColor', label: 'Background' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }, { key: 'accentColor', label: 'Top border' }],
  'left-panel':        [{ key: 'accentColor', label: 'Panel bg' }, { key: 'backgroundColor', label: 'Main bg' }, { key: 'bodyColor', label: 'Body' }, { key: 'linkColor', label: 'Links' }],
  'logo-cta':          [{ key: 'backgroundColor', label: 'Background' }, { key: 'buttonBgColor', label: 'Button bg' }, { key: 'buttonTextColor', label: 'Button text' }, { key: 'bodyColor', label: 'Body' }],
}

// ─── Populate HTML helper ─────────────────────────────────────────────────────

function populateBannerHtml(cfg: BannerConfig, brand: Brand): string {
  const container = document.createElement('div')
  const root = createRoot(container)
  flushSync(() =>
    root.render(
      <RenderedBanner
        config={{ ...cfg, customHtml: undefined, customCss: undefined }}
        brand={brand}
        heading="Your page heading"
        blurb="A short description shown on all subscriber-facing pages."
      />
    )
  )
  const html = container.innerHTML
  root.unmount()
  return html
}

function populateFooterHtml(cfg: FooterConfig, brand: Brand): string {
  const container = document.createElement('div')
  const root = createRoot(container)
  flushSync(() =>
    root.render(
      <RenderedFooter
        config={{ ...cfg, customHtml: undefined, customCss: undefined }}
        brand={brand}
      />
    )
  )
  const html = container.innerHTML
  root.unmount()
  return html
}

// ─── Banner editor ────────────────────────────────────────────────────────────

interface BannerEditorProps {
  banner: BannerConfig | null
  onBannerChange: (b: BannerConfig | null) => void
  themeId: ColorTheme
  brand?: Brand
}

export function BannerEditor({ banner, onBannerChange, themeId, brand, preview }: BannerEditorProps & { preview?: ReactNode }) {
  const [showHtml, setShowHtml] = useState(false)
  const [showCss, setShowCss] = useState(false)
  const enabled = !!banner
  const cfg = banner ?? { layout: 'centred' as BannerLayout, fullWidth: false }
  const patch = (u: Partial<BannerConfig>) => onBannerChange({ ...cfg, ...u })

  const needsSplitImage = cfg.layout === 'split-image'
  const isImageBg = !!cfg.imageBackground

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Banner</p>
          <p className="text-xs text-muted-foreground">Shown above the form on all subscriber-facing pages.</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(on) => onBannerChange(on ? { layout: 'centred', fullWidth: false } : null)}
        />
      </div>

      {enabled && (
        <div className="space-y-4">
          {/* Layout */}
          <SettingGroup title="Layout" collapsible defaultOpen>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(B) as [BannerLayout, typeof B[BannerLayout]][]).map(([id, { label, sketch }]) => (
                <Thumb key={id} label={label} selected={cfg.layout === id} onClick={() => patch({ layout: id })}>
                  {sketch}
                </Thumb>
              ))}
            </div>
          </SettingGroup>

          {preview}

          {/* Options */}
          <SettingGroup title="Options" collapsible>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Edge to edge</span>
              <Switch checked={cfg.fullWidth} onCheckedChange={(v) => patch({ fullWidth: v })} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Sticky (fixed to top)</span>
              <Switch checked={!!cfg.sticky} onCheckedChange={(v) => patch({ sticky: v || undefined })} />
            </div>
            <SettingRow label="Section padding">
              <Input
                type="number" min={0} max={200} placeholder="auto"
                value={cfg.padding ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                  patch({ padding: Number.isFinite(v) ? v : undefined })
                }}
                className="h-7 flex-1 text-xs tabular-nums"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </SettingRow>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Background image</span>
              <Switch checked={isImageBg} onCheckedChange={(v) => patch({ imageBackground: v || undefined })} />
            </div>
          </SettingGroup>

          {/* Background image (conditional) */}
          {isImageBg && (
            <SettingGroup title="Background image" collapsible defaultOpen>
              <ImageUploadField
                label="Image"
                value={cfg.imageUrl}
                onChange={(url) => patch({ imageUrl: url })}
                previewClassName="max-h-24 max-w-full"
              />
              <ColorRow label="Overlay colour" value={cfg.imageOverlayColor} onChange={(v) => patch({ imageOverlayColor: v })} themeId={themeId} />
              <SettingRow label="Overlay opacity">
                <input type="range" min={0} max={100} value={cfg.imageOverlayOpacity ?? 45}
                  onChange={(e) => patch({ imageOverlayOpacity: Number(e.target.value) })}
                  className="flex-1 accent-primary" style={{ height: '6px' }} />
                <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">{cfg.imageOverlayOpacity ?? 45}%</span>
              </SettingRow>
              <SettingRow label="Image fit">
                <Segmented
                  options={[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'auto', label: 'Auto' }]}
                  value={(cfg.backgroundSize ?? 'cover') as 'cover' | 'contain' | 'auto'}
                  onChange={(v) => patch({ backgroundSize: v })}
                />
              </SettingRow>
              <SettingRow label="Tiling">
                <Segmented
                  options={[{ value: 'no-repeat', label: 'None' }, { value: 'repeat', label: 'Tile' }, { value: 'repeat-x', label: 'Horiz' }, { value: 'repeat-y', label: 'Vert' }]}
                  value={(cfg.backgroundRepeat ?? 'no-repeat') as 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'}
                  onChange={(v) => patch({ backgroundRepeat: v })}
                />
              </SettingRow>
            </SettingGroup>
          )}

          {/* Banner image — full-width band rendered below the banner layout */}
          <SettingGroup
            title="Banner image"
            action={<Switch checked={!!cfg.bannerImageEnabled} onCheckedChange={(on) => patch({ bannerImageEnabled: on })} />}
          >
            <p className="text-xs text-muted-foreground">An edge-to-edge image shown below the banner, above the page content.</p>
            {cfg.bannerImageEnabled && (
              <>
                <ImageUploadField
                  label="Image"
                  value={cfg.bannerImageUrl}
                  onChange={(url) => patch({ bannerImageUrl: url })}
                  previewClassName="max-h-24 max-w-full"
                />
                <SettingRow label="Height">
                  <Input
                    type="number" min={60} max={600} placeholder="240"
                    value={cfg.bannerImageHeight ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                      patch({ bannerImageHeight: Number.isFinite(v) ? v : undefined })
                    }}
                    className="h-7 flex-1 text-xs tabular-nums"
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </SettingRow>
              </>
            )}
          </SettingGroup>

          {/* Logo (conditional) */}
          {cfg.layout !== 'minimal' && (
            <SettingGroup title="Logo" collapsible>
              <SettingRow label="Max width">
                <Input
                  type="number" min={20} max={600} placeholder="auto"
                  value={cfg.logoMaxWidth ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                    patch({ logoMaxWidth: Number.isFinite(v) ? v : undefined })
                  }}
                  className="h-7 flex-1 text-xs tabular-nums"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </SettingRow>
              <SettingRow label="Max height">
                <Input
                  type="number" min={16} max={300} placeholder="auto"
                  value={cfg.logoMaxHeight ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                    patch({ logoMaxHeight: Number.isFinite(v) ? v : undefined })
                  }}
                  className="h-7 flex-1 text-xs tabular-nums"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </SettingRow>
              {cfg.layout === 'logo-only' && (
                <SettingRow label="Position">
                  <Segmented
                    options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }, { value: 'right', label: 'Right' }]}
                    value={cfg.logoPosition ?? 'center'}
                    onChange={(v) => patch({ logoPosition: v })}
                  />
                </SettingRow>
              )}
            </SettingGroup>
          )}

          {/* Split image (conditional) */}
          {needsSplitImage && (
            <SettingGroup title="Image" collapsible defaultOpen>
              <ImageUploadField
                label="Split image"
                value={cfg.imageUrl}
                onChange={(url) => patch({ imageUrl: url })}
                previewClassName="max-h-24 max-w-full"
              />
            </SettingGroup>
          )}

          {/* Colours */}
          <SettingGroup title="Colours" collapsible>
            <div className="space-y-1">
              {BANNER_COLOUR_FIELDS[cfg.layout].map(({ key, label }) => (
                <ColorRow
                  key={key}
                  label={label}
                  value={cfg[key]}
                  onChange={(v) => patch({ [key]: v })}
                  themeId={themeId}
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup title="Advanced" collapsible>
          {/* Custom HTML */}
          <div>
            <button
              type="button"
              onClick={() => setShowHtml((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Code2 className="h-3.5 w-3.5" />
              Custom HTML
              {cfg.customHtml && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-500" />}
              {showHtml ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showHtml && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Overrides the layout above when set. Leave empty to restore the default layout.
                </p>
                {brand && !cfg.customHtml && (
                  <button
                    type="button"
                    onClick={() => {
                      patch({ customHtml: populateBannerHtml(cfg, brand) })
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Populate from current layout
                  </button>
                )}
                {cfg.customHtml && (
                  <button
                    type="button"
                    onClick={() => patch({ customHtml: undefined })}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset to layout
                  </button>
                )}
                <Textarea
                  className="font-mono text-xs"
                  rows={8}
                  placeholder="<div>Your custom HTML here…</div>"
                  value={cfg.customHtml ?? ''}
                  onChange={(e) => patch({ customHtml: e.target.value || undefined })}
                />
              </div>
            )}
          </div>

          {/* Custom CSS */}
          <div>
            <button
              type="button"
              onClick={() => setShowCss((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Code2 className="h-3.5 w-3.5" />
              Custom CSS
              {cfg.customCss && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-500" />}
              {showCss ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showCss && (
              <Textarea
                className="mt-2 font-mono text-xs"
                rows={5}
                placeholder=".my-class { color: red; }"
                value={cfg.customCss ?? ''}
                onChange={(e) => patch({ customCss: e.target.value || undefined })}
              />
            )}
          </div>
          </SettingGroup>
        </div>
      )}
    </div>
  )
}

// ─── Footer editor ────────────────────────────────────────────────────────────

interface FooterEditorProps {
  footer: FooterConfig | null
  onFooterChange: (f: FooterConfig | null) => void
  themeId: ColorTheme
  brand?: Brand
}

export function FooterEditor({ footer, onFooterChange, themeId, brand, preview }: FooterEditorProps & { preview?: ReactNode }) {
  const [showHtml, setShowHtml] = useState(false)
  const [showCss, setShowCss] = useState(false)
  const enabled = !!footer
  const cfg = footer ?? { layout: 'minimal-line' as FooterLayout, fullWidth: false }
  const patch = (u: Partial<FooterConfig>) => onFooterChange({ ...cfg, ...u })

  const links = cfg.links ?? []
  const quickLinks = cfg.quickLinks ?? []
  const needsQuickLinks = cfg.layout === 'multi-column'
  const isImageBg = !!cfg.imageBackground

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Footer</p>
          <p className="text-xs text-muted-foreground">Shown below the form on all subscriber-facing pages.</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(on) => onFooterChange(on ? { layout: 'minimal-line', fullWidth: false } : null)}
        />
      </div>

      {enabled && (
        <div className="space-y-4">
          {/* Layout */}
          <SettingGroup title="Layout" collapsible defaultOpen>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(F) as [FooterLayout, typeof F[FooterLayout]][]).map(([id, { label, sketch }]) => (
                <Thumb key={id} label={label} selected={cfg.layout === id} onClick={() => patch({ layout: id })}>
                  {sketch}
                </Thumb>
              ))}
            </div>
          </SettingGroup>

          {preview}

          {/* Options */}
          <SettingGroup title="Options" collapsible>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Edge to edge</span>
              <Switch checked={cfg.fullWidth} onCheckedChange={(v) => patch({ fullWidth: v })} />
            </div>
            <SettingRow label="Section padding">
              <Input
                type="number" min={0} max={200} placeholder="auto"
                value={cfg.padding ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                  patch({ padding: Number.isFinite(v) ? v : undefined })
                }}
                className="h-7 flex-1 text-xs tabular-nums"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </SettingRow>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Background image</span>
              <Switch checked={isImageBg} onCheckedChange={(v) => patch({ imageBackground: v || undefined })} />
            </div>
          </SettingGroup>

          {/* Background image (conditional) */}
          {isImageBg && (
            <SettingGroup title="Background image" collapsible defaultOpen>
              <ImageUploadField
                label="Image"
                value={cfg.imageUrl}
                onChange={(url) => patch({ imageUrl: url })}
                previewClassName="max-h-24 max-w-full"
              />
              <ColorRow label="Overlay colour" value={cfg.imageOverlayColor} onChange={(v) => patch({ imageOverlayColor: v })} themeId={themeId} />
              <SettingRow label="Overlay opacity">
                <input type="range" min={0} max={100} value={cfg.imageOverlayOpacity ?? 45}
                  onChange={(e) => patch({ imageOverlayOpacity: Number(e.target.value) })}
                  className="flex-1 accent-primary" style={{ height: '6px' }} />
                <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">{cfg.imageOverlayOpacity ?? 45}%</span>
              </SettingRow>
              <SettingRow label="Image fit">
                <Segmented
                  options={[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'auto', label: 'Auto' }]}
                  value={(cfg.backgroundSize ?? 'cover') as 'cover' | 'contain' | 'auto'}
                  onChange={(v) => patch({ backgroundSize: v })}
                />
              </SettingRow>
              <SettingRow label="Tiling">
                <Segmented
                  options={[{ value: 'no-repeat', label: 'None' }, { value: 'repeat', label: 'Tile' }, { value: 'repeat-x', label: 'Horiz' }, { value: 'repeat-y', label: 'Vert' }]}
                  value={(cfg.backgroundRepeat ?? 'no-repeat') as 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'}
                  onChange={(v) => patch({ backgroundRepeat: v })}
                />
              </SettingRow>
            </SettingGroup>
          )}

          {/* Footer image — full-width band rendered above the footer layout */}
          <SettingGroup
            title="Footer image"
            action={<Switch checked={!!cfg.footerImageEnabled} onCheckedChange={(on) => patch({ footerImageEnabled: on })} />}
          >
            <p className="text-xs text-muted-foreground">An edge-to-edge image shown above the footer, below the page content.</p>
            {cfg.footerImageEnabled && (
              <>
                <ImageUploadField
                  label="Image"
                  value={cfg.footerImageUrl}
                  onChange={(url) => patch({ footerImageUrl: url })}
                  previewClassName="max-h-24 max-w-full"
                />
                <SettingRow label="Height">
                  <Input
                    type="number" min={60} max={600} placeholder="240"
                    value={cfg.footerImageHeight ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                      patch({ footerImageHeight: Number.isFinite(v) ? v : undefined })
                    }}
                    className="h-7 flex-1 text-xs tabular-nums"
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </SettingRow>
              </>
            )}
          </SettingGroup>

          {/* Links */}
          <SettingGroup title="Links" collapsible>
            <LinksEditor
              links={links}
              onChange={(l) => patch({ links: l })}
              label="Footer links (legal, privacy, etc.)"
            />
            {needsQuickLinks && (
              <LinksEditor
                links={quickLinks}
                onChange={(l) => patch({ quickLinks: l })}
                label="Quick links column"
              />
            )}
          </SettingGroup>

          {/* Colours */}
          <SettingGroup title="Colours" collapsible>
            <div className="space-y-1">
              {FOOTER_COLOUR_FIELDS[cfg.layout].map(({ key, label }) => (
                <ColorRow
                  key={key}
                  label={label}
                  value={cfg[key]}
                  onChange={(v) => patch({ [key]: v })}
                  themeId={themeId}
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup title="Advanced" collapsible>
          {/* Custom HTML */}
          <div>
            <button
              type="button"
              onClick={() => setShowHtml((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Code2 className="h-3.5 w-3.5" />
              Custom HTML
              {cfg.customHtml && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-500" />}
              {showHtml ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showHtml && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Overrides the layout above when set. Leave empty to restore the default layout.
                </p>
                {brand && !cfg.customHtml && (
                  <button
                    type="button"
                    onClick={() => {
                      patch({ customHtml: populateFooterHtml(cfg, brand) })
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Populate from current layout
                  </button>
                )}
                {cfg.customHtml && (
                  <button
                    type="button"
                    onClick={() => patch({ customHtml: undefined })}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset to layout
                  </button>
                )}
                <Textarea
                  className="font-mono text-xs"
                  rows={8}
                  placeholder="<div>Your custom HTML here…</div>"
                  value={cfg.customHtml ?? ''}
                  onChange={(e) => patch({ customHtml: e.target.value || undefined })}
                />
              </div>
            )}
          </div>

          {/* Custom CSS */}
          <div>
            <button
              type="button"
              onClick={() => setShowCss((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Code2 className="h-3.5 w-3.5" />
              Custom CSS
              {cfg.customCss && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-500" />}
              {showCss ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showCss && (
              <Textarea
                className="mt-2 font-mono text-xs"
                rows={5}
                placeholder=".my-class { color: red; }"
                value={cfg.customCss ?? ''}
                onChange={(e) => patch({ customCss: e.target.value || undefined })}
              />
            )}
          </div>
          </SettingGroup>
        </div>
      )}
    </div>
  )
}
