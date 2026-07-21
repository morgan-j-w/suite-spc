'use client'

import { useState, type ReactNode } from 'react'
import { AlignCenter, AlignLeft, AlignRight, ChevronDown, ChevronRight, ChevronUp, Code2, Eye, EyeOff, MailCheck, MailOpen, MailX, RefreshCw } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import type { Brand, EmailBannerLayout, EmailFooterLayout } from '@/lib/subscription-centre'
import { defaultEmailConfig, type EmailConfig, type EmailTemplate } from '@/lib/subscription-centre'
import { generateEmailBannerHtml, generateEmailFooterHtml } from '@/lib/email-layouts'
import { ColorRow } from '@/components/colour-row'
import { getThemeBrandColors } from '@/lib/style-previews'
import { RichTextEditor, richTextContentClass } from '@/components/rich-text-editor'
import { SettingGroup, SettingRow } from '@/components/setting-row'
import { Segmented } from '@/components/ui/segmented'
import { UnitInput } from '@/components/ui/unit-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { defaultTheme, type ColorTheme } from '@/lib/brand-config'
import { ThemePresetPicker } from '@/components/theme-preset-picker'

// ─── Layout thumbnail component ────────────────────────────────────────────────

function EmailThumb({
  children,
  label,
  selected,
  onClick,
}: {
  children: React.ReactNode
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 text-center transition-colors',
        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
      )}
    >
      <div className="h-14 w-full overflow-hidden rounded bg-muted/30">{children}</div>
      <span className="text-[10px] font-medium leading-tight text-muted-foreground">{label}</span>
    </button>
  )
}

// ─── Banner layout thumbnails ──────────────────────────────────────────────────

const EMAIL_BANNER_LAYOUTS: { id: EmailBannerLayout; label: string; sketch: React.ReactNode }[] = [
  {
    id: 'logo-centered',
    label: 'Logo',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-card px-2 pt-2 pb-1">
        <div className="h-2.5 w-12 rounded bg-muted" />
        <div className="mt-auto h-px w-full bg-border" />
      </div>
    ),
  },
  {
    id: 'logo-left',
    label: 'Logo left',
    sketch: (
      <div className="flex h-full flex-col bg-card">
        <div className="flex flex-1 items-center justify-between px-2 py-2">
          <div className="h-2 w-8 rounded bg-muted" />
          <div className="h-1.5 w-10 rounded bg-muted-foreground/20" />
        </div>
        <div className="h-px w-full bg-border" />
      </div>
    ),
  },
  {
    id: 'heading-band',
    label: 'Heading band',
    sketch: (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-foreground/80 px-2 py-1.5">
        <div className="h-2 w-8 rounded bg-background/50" />
        <div className="mt-0.5 h-px w-full bg-background/20" />
        <div className="h-2 w-16 rounded bg-background/70" />
        <div className="h-1.5 w-12 rounded bg-background/40" />
      </div>
    ),
  },
]

// ─── Footer layout thumbnails ──────────────────────────────────────────────────

const EMAIL_FOOTER_LAYOUTS: { id: EmailFooterLayout; label: string; sketch: React.ReactNode }[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    sketch: (
      <div className="flex h-full flex-col justify-end bg-card px-2 pb-2">
        <div className="border-t border-border pt-1.5 text-center">
          <div className="mx-auto h-1.5 w-20 rounded bg-muted-foreground/20" />
        </div>
      </div>
    ),
  },
  {
    id: 'links-copyright',
    label: 'Links + copyright',
    sketch: (
      <div className="flex h-full flex-col justify-between bg-card px-2 pb-2 pt-2">
        <div className="h-2 w-6 rounded bg-muted" />
        <div className="border-t border-border pt-1.5 space-y-1">
          <div className="h-1 w-16 rounded bg-muted-foreground/20" />
          <div className="h-1 w-12 rounded bg-muted-foreground/20" />
        </div>
      </div>
    ),
  },
  {
    id: 'address-footer',
    label: 'Address + legal',
    sketch: (
      <div className="flex h-full flex-col justify-end bg-card px-2 pb-2">
        <div className="border-t border-border pt-1.5 space-y-1">
          <div className="h-1 w-20 rounded bg-muted-foreground/20" />
          <div className="h-1 w-16 rounded bg-muted-foreground/20" />
          <div className="h-1 w-14 rounded bg-muted-foreground/20" />
        </div>
      </div>
    ),
  },
]

// ─── Segment toggle ────────────────────────────────────────────────────────────

function SourceToggle({ sourceMode, onToggle }: { sourceMode: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="flex gap-1 rounded-md bg-muted p-0.5">
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={cn(
          'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
          !sourceMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Visual
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={cn(
          'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
          sourceMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Code2 className="h-3 w-3" />
        HTML
      </button>
    </div>
  )
}

// ─── Email layout section editor ───────────────────────────────────────────────

interface EmailLayoutSectionProps {
  section: 'banner' | 'footer'
  layouts: { id: string; label: string; sketch: React.ReactNode }[]
  selectedLayout?: string
  bgColor?: string
  textColor?: string
  linkColor?: string
  htmlValue: string
  cssValue: string
  themeId?: ColorTheme
  // Text content (banner only, for text-based layouts)
  heading?: string
  subheading?: string
  onHeadingChange?: (v: string) => void
  onSubheadingChange?: (v: string) => void
  // Logo controls
  logoMaxWidth?: number
  logoMaxHeight?: number
  logoPosition?: 'left' | 'center' | 'right'
  onLogoMaxWidthChange: (v: number | undefined) => void
  onLogoMaxHeightChange: (v: number | undefined) => void
  onLogoPositionChange: (v: 'left' | 'center' | 'right' | undefined) => void
  onSelectLayout: (id: string) => void
  onBgColorChange: (color: string | undefined) => void
  onTextColorChange: (color: string | undefined) => void
  onLinkColorChange: (color: string | undefined) => void
  onHtmlChange: (html: string) => void
  onCssChange: (css: string) => void
  onPopulate: () => void
  preview?: ReactNode
}

function EmailLayoutSection({
  section,
  layouts,
  selectedLayout,
  bgColor,
  textColor,
  linkColor,
  htmlValue,
  cssValue,
  themeId,
  heading,
  subheading,
  onHeadingChange,
  onSubheadingChange,
  logoMaxWidth,
  logoMaxHeight,
  logoPosition,
  onLogoMaxWidthChange,
  onLogoMaxHeightChange,
  onLogoPositionChange,
  onSelectLayout,
  onBgColorChange,
  onTextColorChange,
  onLinkColorChange,
  onHtmlChange,
  onCssChange,
  onPopulate,
  preview,
}: EmailLayoutSectionProps) {
  const [showCustomHtml, setShowCustomHtml] = useState(false)
  const [showCustomCss, setShowCustomCss] = useState(false)

  return (
    <div className="space-y-4">
      {/* Layout */}
      <SettingGroup title="Layout" collapsible>
        <div className="grid grid-cols-3 gap-2">
          {layouts.map(({ id, label, sketch }) => (
            <EmailThumb
              key={id}
              label={label}
              selected={selectedLayout === id}
              onClick={() => onSelectLayout(id)}
            >
              {sketch}
            </EmailThumb>
          ))}
        </div>
      </SettingGroup>

      {preview}

      {/* Text — heading/subheading. Always available for parity with Design > Banner;
          only the Heading band layout renders it, same as some Design banner layouts
          (Minimal, Logo only, Logo band) not rendering heading/blurb either. */}
      {section === 'banner' && selectedLayout && onHeadingChange && (
        <SettingGroup title="Text" collapsible>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Heading</Label>
              <Input
                value={heading ?? ''}
                onChange={(e) => onHeadingChange(e.target.value)}
                placeholder="Email from us"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Subheading</Label>
              <Input
                value={subheading ?? ''}
                onChange={(e) => onSubheadingChange?.(e.target.value)}
                placeholder="Optional subheading"
                className="text-sm"
              />
            </div>
          </div>
        </SettingGroup>
      )}

      {/* Logo — banner: all layouts; footer: links-copyright only */}
      {selectedLayout && (section === 'banner' || (section === 'footer' && selectedLayout === 'links-copyright')) && (
        <SettingGroup title="Logo" collapsible>
          <SettingRow label="Max size">
            <UnitInput prefix="W" min={20} max={600} placeholder="auto" value={logoMaxWidth} onChange={onLogoMaxWidthChange} />
            <UnitInput prefix="H" min={16} max={300} placeholder="auto" value={logoMaxHeight} onChange={onLogoMaxHeightChange} />
          </SettingRow>
          {/* Position only makes sense for layouts where the logo isn't already anchored by
              the layout itself (logo-left is always left; heading-band is always centred) */}
          {(section !== 'banner' || selectedLayout === 'logo-centered') && (
            <SettingRow label="Position">
              <Segmented
                options={[
                  { value: 'left', icon: AlignLeft, title: 'Left' },
                  { value: 'center', icon: AlignCenter, title: 'Centre' },
                  { value: 'right', icon: AlignRight, title: 'Right' },
                ]}
                value={logoPosition ?? 'center'}
                onChange={(v) => onLogoPositionChange(v)}
              />
            </SettingRow>
          )}
        </SettingGroup>
      )}

      {/* Colours (shown when a layout is selected) */}
      {selectedLayout && (
        <SettingGroup title="Colours" collapsible>
          <div className="space-y-1">
            <ColorRow
              label="Background"
              value={bgColor}
              onChange={(v) => onBgColorChange(v || undefined)}
              themeId={themeId ?? defaultTheme}
            />
            <ColorRow
              label="Text"
              value={textColor}
              onChange={(v) => onTextColorChange(v || undefined)}
              themeId={themeId ?? defaultTheme}
            />
            <ColorRow
              label="Links"
              value={linkColor}
              onChange={(v) => onLinkColorChange(v || undefined)}
              themeId={themeId ?? defaultTheme}
            />
          </div>
        </SettingGroup>
      )}

      <SettingGroup title="Advanced" collapsible>
      {/* Custom HTML */}
      <div>
        <button
          type="button"
          onClick={() => setShowCustomHtml((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Code2 className="h-3.5 w-3.5" />
          Custom HTML
          {htmlValue && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-500" />}
          {showCustomHtml ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showCustomHtml && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-muted-foreground">Overrides the generated HTML for this {section}. Leave empty to use the layout generator.</p>
            {selectedLayout && !htmlValue && (
              <button
                type="button"
                onClick={onPopulate}
                className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Populate from current layout
              </button>
            )}
            {htmlValue && (
              <button
                type="button"
                onClick={() => onHtmlChange('')}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Reset to layout
              </button>
            )}
            <Textarea
              value={htmlValue}
              onChange={(e) => onHtmlChange(e.target.value)}
              spellCheck={false}
              placeholder={`<table width="650">…</table>`}
              className="font-mono text-xs"
              rows={8}
            />
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <div>
        <button
          type="button"
          onClick={() => setShowCustomCss((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Code2 className="h-3.5 w-3.5" />
          Custom CSS
          {cssValue && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-500" />}
          {showCustomCss ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showCustomCss && (
          <Textarea
            value={cssValue}
            onChange={(e) => onCssChange(e.target.value)}
            spellCheck={false}
            placeholder=".my-class { color: red; }"
            className="mt-2 font-mono text-xs"
            rows={5}
          />
        )}
      </div>
      </SettingGroup>
    </div>
  )
}

// ─── Per-template editor ────────────────────────────────────────────────────────

const TEMPLATE_META: Record<
  keyof Pick<EmailConfig, 'doubleOptIn' | 'confirmation' | 'unsubscribed'>,
  { title: string; description: string; icon: React.ElementType; iconBg: string; iconColor: string }
> = {
  doubleOptIn: {
    title: 'Double opt-in',
    description: "Sent after sign-up to confirm the subscriber's email address.",
    icon: MailOpen,
    iconBg: 'bg-violet-100 dark:bg-violet-950',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  confirmation: {
    title: 'Confirmation',
    description: 'Sent once the subscriber has confirmed and is fully subscribed.',
    icon: MailCheck,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  unsubscribed: {
    title: 'Unsubscribed',
    description: 'Sent after a subscriber successfully unsubscribes.',
    icon: MailX,
    iconBg: 'bg-orange-100 dark:bg-orange-950',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
}

interface EmailTemplateCardProps {
  templateKey: keyof typeof TEMPLATE_META
  template: EmailTemplate
  emailConfig: EmailConfig
  brand?: Brand
  themeId?: ColorTheme
  onChange: (patch: Partial<EmailTemplate>) => void
}

function EmailTemplateCard({ templateKey, template, emailConfig, brand, themeId, onChange }: EmailTemplateCardProps) {
  const [open, setOpen] = useState(false)
  const [sourceMode, setSourceMode] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const meta = TEMPLATE_META[templateKey]
  const MetaIcon = meta.icon

  // Derive theme palette so unset email colors fall back to something that looks right
  const themeColors = getThemeBrandColors(themeId ?? defaultTheme)
  const themeBrand = themeColors[5]?.hex ?? '#2F5FB3'  // 'brand' role color
  const themeLight = themeColors[0]?.hex ?? '#FFFFFF'  // 'white' role color
  const themeDark  = themeColors[7]?.hex ?? '#111111'  // 'dark' role color

  const previewWrapperBg = emailConfig.emailBodyBgColor ?? '#f4f4f4'

  // Always generate banner/footer for the preview — use configured layout or a sensible default
  const previewBannerHtml = emailConfig.bannerHtml
    || generateEmailBannerHtml(emailConfig.bannerLayout ?? 'logo-centered', brand ?? {}, {
        bgColor:    emailConfig.bannerBgColor   ?? themeBrand,
        textColor:  emailConfig.bannerTextColor ?? themeLight,
        linkColor:  emailConfig.bannerLinkColor,
        heading:    emailConfig.bannerHeading,
        subheading: emailConfig.bannerSubheading,
        logoMaxWidth:  emailConfig.bannerLogoMaxWidth,
        logoMaxHeight: emailConfig.bannerLogoMaxHeight,
        logoPosition:  emailConfig.bannerLogoPosition,
      })
  const previewFooterHtml = emailConfig.footerHtml
    || generateEmailFooterHtml(emailConfig.footerLayout ?? 'minimal', brand ?? {}, {
        bgColor:   emailConfig.footerBgColor,
        textColor: emailConfig.footerTextColor,
        linkColor: emailConfig.footerLinkColor,
        logoMaxWidth:  emailConfig.footerLogoMaxWidth,
        logoMaxHeight: emailConfig.footerLogoMaxHeight,
        logoPosition:  emailConfig.footerLogoPosition,
      })

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-6 py-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 py-4 text-left"
        >
          {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{meta.title}</p>
            <p className="text-xs text-muted-foreground">{meta.description}</p>
          </div>
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', meta.iconBg)}>
            <MetaIcon className={cn('h-4 w-4', meta.iconColor)} />
          </div>
        </button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 px-6 pb-6 pt-0">
          <div className="space-y-1.5">
            <Label className="text-xs">Subject line</Label>
            <Input
              value={template.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="Email subject…"
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Body</Label>
              <SourceToggle sourceMode={sourceMode} onToggle={setSourceMode} />
            </div>
            {sourceMode ? (
              <textarea
                value={template.bodyHtml}
                onChange={(e) => onChange({ bodyHtml: e.target.value })}
                spellCheck={false}
                placeholder="<p>Email body HTML…</p>"
                className="h-48 w-full rounded-md border bg-background px-3 py-2 font-mono text-xs focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-ring/50"
              />
            ) : (
              <RichTextEditor
                value={template.bodyHtml}
                onChange={(bodyHtml) => onChange({ bodyHtml })}
                placeholder="Write your email body…"
              />
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
            className="self-start"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? 'Hide email preview' : 'Show email preview'}
          </Button>

          {showPreview && (
            <div className="overflow-hidden rounded-md border p-4" style={{ background: previewWrapperBg }}>
              <div className="mx-auto overflow-x-auto bg-white shadow-sm" style={{ width: 650, maxWidth: '100%' }}>
                {previewBannerHtml && (
                  <div dangerouslySetInnerHTML={{ __html: previewBannerHtml }} />
                )}
                <div
                  className={cn('px-6 py-6 text-sm', richTextContentClass)}
                  dangerouslySetInnerHTML={{ __html: template.bodyHtml || '<p class="text-gray-400 italic">No body content yet.</p>' }}
                />
                {previewFooterHtml && (
                  <div dangerouslySetInnerHTML={{ __html: previewFooterHtml }} />
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// ─── Main editor ───────────────────────────────────────────────────────────────

export type EmailSection = 'banner' | 'footer' | 'messages' | 'design'

interface EmailsEditorProps {
  section: EmailSection
  emailConfig: EmailConfig
  onEmailConfigChange: (config: EmailConfig) => void
  brand?: Brand
  themeId?: ColorTheme
  onThemeChange?: (t: ColorTheme) => void
}

export function EmailsEditor({ section, emailConfig, onEmailConfigChange, brand, themeId, onThemeChange }: EmailsEditorProps) {
  const cfg = emailConfig ?? defaultEmailConfig
  const patch = (update: Partial<EmailConfig>) => onEmailConfigChange({ ...cfg, ...update })

  const patchTemplate = (
    key: keyof Pick<EmailConfig, 'doubleOptIn' | 'confirmation' | 'unsubscribed'>,
    update: Partial<EmailTemplate>
  ) => patch({ [key]: { ...cfg[key], ...update } })

  const populateBanner = () => {
    if (!cfg.bannerLayout) return
    patch({
      bannerHtml: generateEmailBannerHtml(cfg.bannerLayout, brand ?? {}, {
        bgColor: cfg.bannerBgColor,
        textColor: cfg.bannerTextColor,
        linkColor: cfg.bannerLinkColor,
        heading: cfg.bannerHeading,
        subheading: cfg.bannerSubheading,
        logoMaxWidth: cfg.bannerLogoMaxWidth,
        logoMaxHeight: cfg.bannerLogoMaxHeight,
        logoPosition: cfg.bannerLogoPosition,
      }),
    })
  }

  const populateFooter = () => {
    if (!cfg.footerLayout) return
    patch({
      footerHtml: generateEmailFooterHtml(cfg.footerLayout, brand ?? {}, {
        bgColor: cfg.footerBgColor,
        textColor: cfg.footerTextColor,
        linkColor: cfg.footerLinkColor,
        logoMaxWidth: cfg.footerLogoMaxWidth,
        logoMaxHeight: cfg.footerLogoMaxHeight,
        logoPosition: cfg.footerLogoPosition,
      }),
    })
  }

  // Rendered banner/footer preview — falls back to the layout generator when no custom
  // HTML override is set, same as the Messages sub-section's per-template preview.
  const previewHtmlWrapper = (html: string) => (
    <div className="overflow-hidden rounded-lg border p-4" style={{ backgroundColor: cfg.emailBodyBgColor ?? '#f4f4f4' }}>
      <div className="mx-auto overflow-x-auto bg-white shadow-sm" style={{ width: 650, maxWidth: '100%' }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )

  const bannerPreviewHtml = cfg.bannerLayout
    ? cfg.bannerHtml || generateEmailBannerHtml(cfg.bannerLayout, brand ?? {}, {
        bgColor: cfg.bannerBgColor,
        textColor: cfg.bannerTextColor,
        linkColor: cfg.bannerLinkColor,
        heading: cfg.bannerHeading,
        subheading: cfg.bannerSubheading,
        logoMaxWidth: cfg.bannerLogoMaxWidth,
        logoMaxHeight: cfg.bannerLogoMaxHeight,
        logoPosition: cfg.bannerLogoPosition,
      })
    : undefined

  const footerPreviewHtml = cfg.footerLayout
    ? cfg.footerHtml || generateEmailFooterHtml(cfg.footerLayout, brand ?? {}, {
        bgColor: cfg.footerBgColor,
        textColor: cfg.footerTextColor,
        linkColor: cfg.footerLinkColor,
        logoMaxWidth: cfg.footerLogoMaxWidth,
        logoMaxHeight: cfg.footerLogoMaxHeight,
        logoPosition: cfg.footerLogoPosition,
      })
    : undefined

  return (
    <div className="space-y-4">

      {section === 'messages' && (
        <div>
          <p className="text-sm font-semibold">Messages</p>
          <p className="text-xs text-muted-foreground">Configure the subject, preview text, and body for each transactional email.</p>
        </div>
      )}

      {/* Banner sub-section */}
      {section === 'banner' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Email banner</p>
              <p className="text-xs text-muted-foreground">Header shown above the body in every outbound email.</p>
            </div>
            <Switch
              checked={!!cfg.bannerEnabled}
              onCheckedChange={(on) => patch({ bannerEnabled: on })}
            />
          </div>
          {cfg.bannerEnabled && (
            <EmailLayoutSection
              section="banner"
              layouts={EMAIL_BANNER_LAYOUTS}
              selectedLayout={cfg.bannerLayout}
              bgColor={cfg.bannerBgColor}
              textColor={cfg.bannerTextColor}
              linkColor={cfg.bannerLinkColor}
              htmlValue={cfg.bannerHtml}
              themeId={themeId ?? defaultTheme}
              heading={cfg.bannerHeading}
              subheading={cfg.bannerSubheading}
              onHeadingChange={(bannerHeading) => patch({ bannerHeading })}
              onSubheadingChange={(bannerSubheading) => patch({ bannerSubheading })}
              logoMaxWidth={cfg.bannerLogoMaxWidth}
              logoMaxHeight={cfg.bannerLogoMaxHeight}
              logoPosition={cfg.bannerLogoPosition}
              onLogoMaxWidthChange={(v) => patch({ bannerLogoMaxWidth: v })}
              onLogoMaxHeightChange={(v) => patch({ bannerLogoMaxHeight: v })}
              onLogoPositionChange={(v) => patch({ bannerLogoPosition: v })}
              onSelectLayout={(id) => patch({ bannerLayout: id as EmailBannerLayout })}
              onBgColorChange={(v) => patch({ bannerBgColor: v })}
              onTextColorChange={(v) => patch({ bannerTextColor: v })}
              onLinkColorChange={(v) => patch({ bannerLinkColor: v })}
              onHtmlChange={(bannerHtml) => patch({ bannerHtml })}
              onCssChange={(bannerCustomCss) => patch({ bannerCustomCss })}
              cssValue={cfg.bannerCustomCss ?? ''}
              onPopulate={() => populateBanner()}
              preview={bannerPreviewHtml ? previewHtmlWrapper(bannerPreviewHtml) : undefined}
            />
          )}
        </>
      )}

      {/* Footer sub-section */}
      {section === 'footer' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Email footer</p>
              <p className="text-xs text-muted-foreground">Footer shown below the body in every outbound email. Emails render at 650px wide.</p>
            </div>
            <Switch
              checked={!!cfg.footerEnabled}
              onCheckedChange={(on) => patch({ footerEnabled: on })}
            />
          </div>
          {cfg.footerEnabled && (
            <EmailLayoutSection
              section="footer"
              layouts={EMAIL_FOOTER_LAYOUTS}
              selectedLayout={cfg.footerLayout}
              bgColor={cfg.footerBgColor}
              textColor={cfg.footerTextColor}
              linkColor={cfg.footerLinkColor}
              htmlValue={cfg.footerHtml}
              themeId={themeId ?? defaultTheme}
              logoMaxWidth={cfg.footerLogoMaxWidth}
              logoMaxHeight={cfg.footerLogoMaxHeight}
              logoPosition={cfg.footerLogoPosition}
              onLogoMaxWidthChange={(v) => patch({ footerLogoMaxWidth: v })}
              onLogoMaxHeightChange={(v) => patch({ footerLogoMaxHeight: v })}
              onLogoPositionChange={(v) => patch({ footerLogoPosition: v })}
              onSelectLayout={(id) => patch({ footerLayout: id as EmailFooterLayout })}
              onBgColorChange={(v) => patch({ footerBgColor: v })}
              onTextColorChange={(v) => patch({ footerTextColor: v })}
              onLinkColorChange={(v) => patch({ footerLinkColor: v })}
              onHtmlChange={(footerHtml) => patch({ footerHtml })}
              onCssChange={(footerCustomCss) => patch({ footerCustomCss })}
              cssValue={cfg.footerCustomCss ?? ''}
              onPopulate={() => populateFooter()}
              preview={footerPreviewHtml ? previewHtmlWrapper(footerPreviewHtml) : undefined}
            />
          )}
        </>
      )}

      {/* Messages sub-section */}
      {section === 'messages' && (
        <div className="space-y-3">
          {(['doubleOptIn', 'confirmation', 'unsubscribed'] as const).map((key) => (
            <EmailTemplateCard
              key={key}
              templateKey={key}
              template={cfg[key]}
              emailConfig={cfg}
              brand={brand}
              themeId={themeId}
              onChange={(update) => patchTemplate(key, update)}
            />
          ))}
        </div>
      )}

      {/* Style sub-section */}
      {section === 'design' && (
        <>
          <div>
            <p className="text-sm font-semibold">Email style</p>
            <p className="text-xs text-muted-foreground">Global settings applied across every outbound email.</p>
          </div>
          <SettingGroup title="Theme">
            <ThemePresetPicker value={themeId ?? defaultTheme} onChange={onThemeChange ?? (() => {})} />
          </SettingGroup>
          <SettingGroup title="Colours">
            <ColorRow
              label="Body background"
              value={cfg.emailBodyBgColor}
              onChange={(v) => patch({ emailBodyBgColor: v || undefined })}
              themeId={themeId ?? defaultTheme}
            />
          </SettingGroup>
        </>
      )}
    </div>
  )
}
