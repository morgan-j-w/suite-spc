'use client'

import { useState } from 'react'
import { Columns2, GalleryVertical, RectangleHorizontal, Rows2 } from 'lucide-react'

type DesignSection = 'brand' | 'theme' | 'banner' | 'footer' | 'form'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import {
  buildDefaultAnswers,
  type CategoryAnswers,
  type ProfileFieldSection,
  type Category,
  type SubscriberProfile,
} from '@/lib/subscription-types'
import type { SubscriptionCentre, SubmitButtonAlignment, ContentBlock, BannerConfig, FooterConfig, Brand, CardStyle, FormWidth } from '@/lib/subscription-centre'
import { getContentMaxWidth } from '@/lib/subscription-centre'
import type { ColorTheme } from '@/lib/brand-config'
import { getStylePreviews } from '@/lib/style-previews'
import { RenderedSection, RenderedCategory } from '@/components/subscription-centre-widget'
import { RenderedContentBlock } from '@/components/rendered-content-block'
import { getCardStyleCss, getCardSpacingClass } from '@/lib/card-style'
import { BrandEditor } from '@/components/brand-editor'
import { BannerEditor, FooterEditor } from '@/components/banner-footer-editor'
import { RenderedBanner, RenderedFooter } from '@/components/rendered-banner-footer'
import { ColorRow } from '@/components/colour-row'
import { SortablePreviewBlock } from '@/components/sortable-preview-block'
import { StylePicker } from '@/components/style-picker'
import { ThemePresetPicker } from '@/components/theme-preset-picker'
import { SubmitButtonPreview } from '@/components/submit-button-preview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const EMPTY_PROFILE: SubscriberProfile = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  jobTitle: '',
  customFields: {},
}

interface PreviewEditorProps {
  centre: SubscriptionCentre
  designSection: DesignSection
  onDesignSectionChange: (section: DesignSection) => void
  pageBackgroundColor?: string
  onPageBackgroundColorChange: (v?: string) => void
  onCardStyleChange: (v: CardStyle) => void
  onFormWidthChange: (v: FormWidth) => void
  onThemeChange: (theme: ColorTheme) => void
  onSectionOrderChange: (order: string[]) => void
  onProfileFieldSectionsChange: (sections: ProfileFieldSection[]) => void
  onCategoriesChange: (categories: Category[]) => void
  onContentBlocksChange: (blocks: ContentBlock[]) => void
  onBrandChange: (brand: Brand) => void
  onBannerChange: (value: BannerConfig | null) => void
  onFooterChange: (value: FooterConfig | null) => void
  submitButtonText: string
  submitButtonStyleIndex: number
  submitButtonAlignment: SubmitButtonAlignment
  submitButtonBgColor?: string
  submitButtonTextColor?: string
  onSubmitButtonTextChange: (text: string) => void
  onSubmitButtonStyleIndexChange: (index: number) => void
  onSubmitButtonAlignmentChange: (alignment: SubmitButtonAlignment) => void
  onSubmitButtonBgColorChange: (v?: string) => void
  onSubmitButtonTextColorChange: (v?: string) => void
  formLayout: 'stacked' | 'inline'
  formLabelWidth: number
  formCardMode: 'separate' | 'single'
  singleCardStyleIndex: number
  onFormLayoutChange: (layout: 'stacked' | 'inline') => void
  onFormLabelWidthChange: (width: number) => void
  onFormCardModeChange: (mode: 'separate' | 'single') => void
  onSingleCardStyleIndexChange: (index: number) => void
  onNavigateToPagesTab?: () => void
}

export function PreviewEditor({
  centre,
  designSection,
  pageBackgroundColor,
  onPageBackgroundColorChange,
  onCardStyleChange,
  onThemeChange,
  onSectionOrderChange,
  onProfileFieldSectionsChange,
  onCategoriesChange,
  onContentBlocksChange,
  onBrandChange,
  onBannerChange,
  onFooterChange,
  submitButtonText,
  submitButtonStyleIndex,
  submitButtonAlignment,
  submitButtonBgColor,
  submitButtonTextColor,
  onSubmitButtonTextChange,
  onSubmitButtonStyleIndexChange,
  onSubmitButtonAlignmentChange,
  onSubmitButtonBgColorChange,
  onSubmitButtonTextColorChange,
  formLayout,
  formLabelWidth,
  formCardMode,
  singleCardStyleIndex,
  onFormLayoutChange,
  onFormLabelWidthChange,
  onFormCardModeChange,
  onSingleCardStyleIndexChange,
  onFormWidthChange,
  onNavigateToPagesTab,
}: PreviewEditorProps) {
  const [profile, setProfile] = useState<SubscriberProfile>(EMPTY_PROFILE)
  const [answers, setAnswers] = useState<CategoryAnswers>(() => buildDefaultAnswers(centre.categories))

  const clearVisibleWhenOnFirstSection = (sections: ProfileFieldSection[], order: string[]) => {
    const firstId = order.find((id) => sections.some((s) => s.id === id))
    return sections.map((s) => (s.id === firstId && s.visibleWhen?.length ? { ...s, visibleWhen: undefined } : s))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = centre.sectionOrder.indexOf(active.id as string)
    const newIndex = centre.sectionOrder.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(centre.sectionOrder, oldIndex, newIndex)
    onSectionOrderChange(newOrder)
    onProfileFieldSectionsChange(clearVisibleWhenOnFirstSection(centre.profileFieldSections, newOrder))
  }

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const oldIndex = centre.sectionOrder.indexOf(id)
    if (oldIndex === -1) return
    const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1
    if (newIndex < 0 || newIndex >= centre.sectionOrder.length) return
    const newOrder = arrayMove(centre.sectionOrder, oldIndex, newIndex)
    onSectionOrderChange(newOrder)
    onProfileFieldSectionsChange(clearVisibleWhenOnFirstSection(centre.profileFieldSections, newOrder))
  }

  const singleStylePreview = getStylePreviews(centre.themePresetId)[singleCardStyleIndex ?? 0]
  const cardSpacingClass = getCardSpacingClass(centre.cardStyle)
  const cardStyleCss = getCardStyleCss(centre.cardStyle)

  // The Form sub-section is edit-only — the full read-only render (with conditional
  // visibility applied) lives in the persistent LivePreviewPanel alongside this tab.
  const blocks = centre.sectionOrder.map((id, index) => {
    const section = centre.profileFieldSections.find((s) => s.id === id)
    if (section) {
      if (formCardMode === 'single') {
        const embeddedSection = <RenderedSection key={id} section={section} stylePreview={singleStylePreview} profile={profile} onProfileChange={setProfile} visible showValidation={false} formLayout={formLayout} formLabelWidth={formLabelWidth} embedded />
        return (
          <SortablePreviewBlock key={id} id={id} theme={centre.themePresetId} cardStyleIndex={singleCardStyleIndex} onCardStyleChange={onSingleCardStyleIndexChange} hideStylePicker isFirst={index === 0} isLast={index === centre.sectionOrder.length - 1} onMoveUp={() => moveBlock(id, 'up')} onMoveDown={() => moveBlock(id, 'down')}>
            {embeddedSection}
          </SortablePreviewBlock>
        )
      }

      const stylePreview = getStylePreviews(centre.themePresetId)[section.cardStyleIndex ?? 0]
      return (
        <SortablePreviewBlock key={id} id={id} theme={centre.themePresetId} cardStyleIndex={section.cardStyleIndex} onCardStyleChange={(i) => onProfileFieldSectionsChange(centre.profileFieldSections.map((s) => s.id === id ? { ...s, cardStyleIndex: i } : s))} isFirst={index === 0} isLast={index === centre.sectionOrder.length - 1} onMoveUp={() => moveBlock(id, 'up')} onMoveDown={() => moveBlock(id, 'down')}>
          <RenderedSection section={section} stylePreview={stylePreview} profile={profile} onProfileChange={setProfile} visible showValidation={false} formLayout={formLayout} formLabelWidth={formLabelWidth} />
        </SortablePreviewBlock>
      )
    }

    const category = centre.categories.find((c) => c.id === id)
    if (category) {
      if (formCardMode === 'single') {
        const embeddedCategory = <RenderedCategory key={id} category={category} stylePreview={singleStylePreview} answers={answers} onAnswersChange={setAnswers} showValidation={false} embedded />
        return (
          <SortablePreviewBlock key={id} id={id} theme={centre.themePresetId} cardStyleIndex={singleCardStyleIndex} onCardStyleChange={onSingleCardStyleIndexChange} hideStylePicker isFirst={index === 0} isLast={index === centre.sectionOrder.length - 1} onMoveUp={() => moveBlock(id, 'up')} onMoveDown={() => moveBlock(id, 'down')}>
            {embeddedCategory}
          </SortablePreviewBlock>
        )
      }

      const stylePreview = getStylePreviews(centre.themePresetId)[category.cardStyleIndex ?? 0]
      return (
        <SortablePreviewBlock key={id} id={id} theme={centre.themePresetId} cardStyleIndex={category.cardStyleIndex} onCardStyleChange={(i) => onCategoriesChange(centre.categories.map((c) => c.id === id ? { ...c, cardStyleIndex: i } : c))} isFirst={index === 0} isLast={index === centre.sectionOrder.length - 1} onMoveUp={() => moveBlock(id, 'up')} onMoveDown={() => moveBlock(id, 'down')}>
          <RenderedCategory category={category} stylePreview={stylePreview} answers={answers} onAnswersChange={setAnswers} showValidation={false} />
        </SortablePreviewBlock>
      )
    }

    const contentBlock = (centre.contentBlocks ?? []).find((b) => b.id === id)
    if (contentBlock) {
      return (
        <SortablePreviewBlock key={id} id={id} theme={centre.themePresetId} cardStyleIndex={undefined} onCardStyleChange={() => {}} hideStylePicker isFirst={index === 0} isLast={index === centre.sectionOrder.length - 1} onMoveUp={() => moveBlock(id, 'up')} onMoveDown={() => moveBlock(id, 'down')}>
          <RenderedContentBlock block={contentBlock} showPlaceholder />
        </SortablePreviewBlock>
      )
    }

    return null
  })

  const submitButtonPreview = () => (
    <SubmitButtonPreview
      theme={centre.themePresetId}
      text={submitButtonText}
      styleIndex={submitButtonStyleIndex}
      alignment={submitButtonAlignment}
      bgColorOverride={submitButtonBgColor}
      textColorOverride={submitButtonTextColor}
      onTextChange={onSubmitButtonTextChange}
      onStyleIndexChange={onSubmitButtonStyleIndexChange}
      onAlignmentChange={onSubmitButtonAlignmentChange}
    />
  )

  return (
    <div className="space-y-6">
      {/* Brand */}
          {designSection === 'brand' && (
            <Card className="gap-0 py-0">
              <CardHeader className="px-6 pt-4 pb-2">
                <CardTitle className="text-base">Brand</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pt-2 pb-6">
                <BrandEditor brand={centre.brand} onChange={onBrandChange} />
              </CardContent>
            </Card>
          )}

          {/* Style */}
          {designSection === 'theme' && (() => {
            const cs = centre.cardStyle ?? {}
            const patchCs = (u: Partial<CardStyle>) => onCardStyleChange({ ...cs, ...u })
            const seg = (opts: { value: string; label: string }[], current: string | undefined, fallback: string, onChange: (v: string) => void) => (
              <div className="flex flex-1 gap-1 rounded-md bg-muted p-0.5">
                {opts.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => onChange(value)}
                    className={cn('flex-1 rounded px-2 py-1.5 text-xs transition-colors font-medium',
                      (current ?? fallback) === value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                    {label}
                  </button>
                ))}
              </div>
            )
            return (
              <Card className="gap-0 py-0">
                <CardHeader className="px-6 pt-4 pb-2">
                  <CardTitle className="text-base">Style</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pt-0 pb-6 space-y-6">
                  <div>
                    <p className="mb-4 text-xs text-muted-foreground">Colour and font cascade from the theme preset to all components.</p>
                    <ThemePresetPicker value={centre.themePresetId} onChange={onThemeChange} />
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
                    <p className="mb-2 text-sm font-medium">Page</p>
                    <ColorRow label="Background" value={pageBackgroundColor} onChange={onPageBackgroundColorChange} themeId={centre.themePresetId} />
                    <div className="flex items-center gap-2.5 py-0.5">
                      <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">Content width</span>
                      <div className="flex flex-1 gap-1 rounded-md bg-muted p-0.5">
                        {(['narrow', 'default', 'wide'] as const).map((w) => (
                          <button key={w} type="button" onClick={() => onFormWidthChange(w)}
                            className={cn('flex-1 rounded px-2.5 py-1 text-xs transition-colors font-medium capitalize',
                              (centre.formWidth ?? 'default') === w ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card p-3 space-y-3">
                    <p className="text-sm font-medium">Form cards</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">Border</span>
                        {seg([{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }],
                          cs.borderEnabled === false ? 'off' : 'on', 'on',
                          (v) => patchCs({ borderEnabled: v === 'off' ? false : undefined }))}
                      </div>
                      <div className={cn('flex items-center gap-3 transition-opacity', cs.borderEnabled === false && 'opacity-40 pointer-events-none')}>
                        <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">Border colour</span>
                        <div className="-my-0.5">
                          <ColorRow
                            label=""
                            value={cs.borderColor}
                            onChange={(v) => patchCs({ borderColor: v })}
                            themeId={centre.themePresetId}
                          />
                        </div>
                      </div>
                      <div className={cn('flex items-center gap-3 transition-opacity', cs.borderEnabled === false && 'opacity-40 pointer-events-none')}>
                        <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">Border width</span>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={1}
                            max={4}
                            value={cs.borderWidth ?? ''}
                            placeholder="Theme"
                            onChange={(e) => {
                              const v = e.target.value === '' ? undefined : Math.max(1, Math.min(4, Number(e.target.value)))
                              patchCs({ borderWidth: v })
                            }}
                            className="h-7 w-20 text-xs font-mono"
                          />
                          <span className="text-xs text-muted-foreground">px</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">Border radius</span>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            max={24}
                            value={cs.borderRadius ?? ''}
                            placeholder="Theme"
                            onChange={(e) => {
                              const v = e.target.value === '' ? undefined : Math.max(0, Math.min(24, Number(e.target.value)))
                              patchCs({ borderRadius: v })
                            }}
                            className="h-7 w-20 text-xs font-mono"
                          />
                          <span className="text-xs text-muted-foreground">px</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">Drop shadow</span>
                        {seg([{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }], cs.shadow, 'on', (v) => patchCs({ shadow: v as CardStyle['shadow'] }))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">Card padding</span>
                        {seg([{ value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'spacious', label: 'Spacious' }], cs.padding, 'normal', (v) => patchCs({ padding: v as CardStyle['padding'] }))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">Card spacing</span>
                        {seg([{ value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'spacious', label: 'Spacious' }], cs.spacing, 'normal', (v) => patchCs({ spacing: v as CardStyle['spacing'] }))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Banner */}
          {designSection === 'banner' && (
            <Card className="gap-0 py-0">
              <CardContent className="p-4 space-y-4">
                <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3 flex items-start gap-2.5">
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Banner heading and description are set per page.{' '}
                    <button
                      type="button"
                      onClick={() => onNavigateToPagesTab?.()}
                      className="underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                      Go to Pages tab
                    </button>
                  </span>
                </div>
                <BannerEditor
                  banner={centre.banner}
                  onBannerChange={onBannerChange}
                  themeId={centre.themePresetId}
                  brand={centre.brand}
                  preview={centre.banner && (
                    <div data-color-theme={centre.themePresetId} className="overflow-hidden rounded-lg border">
                      <RenderedBanner
                        config={centre.banner}
                        brand={centre.brand}
                        heading={centre.statusPages.subscribe.bannerHeading}
                        blurb={centre.statusPages.subscribe.bannerBlurb}
                        contentMaxWidth={getContentMaxWidth(centre.formWidth)}
                      />
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          {designSection === 'footer' && (
            <Card className="gap-0 py-0">
              <CardContent className="p-4">
                <FooterEditor
                  footer={centre.footer}
                  onFooterChange={onFooterChange}
                  themeId={centre.themePresetId}
                  brand={centre.brand}
                  preview={centre.footer && (
                    <div data-color-theme={centre.themePresetId} className="overflow-hidden rounded-lg border">
                      <RenderedFooter config={centre.footer} brand={centre.brand} contentMaxWidth={getContentMaxWidth(centre.formWidth)} />
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Form */}
          {designSection === 'form' && (
            <>
              {/* Layout card */}
              <Card className="gap-0 py-0">
                <CardHeader className="px-6 pt-4 pb-2">
                  <CardTitle className="text-base">Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pt-2 pb-6">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Card presentation</p>
                    <div className="flex gap-1 rounded-md bg-muted p-1">
                      {([
                        { value: 'separate', label: 'Separate cards', icon: GalleryVertical },
                        { value: 'single', label: 'Single card', icon: RectangleHorizontal },
                      ] as const).map(({ value: mode, label, icon: Icon }) => (
                        <button key={mode} type="button" onClick={() => onFormCardModeChange(mode)}
                          className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors', formCardMode === mode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Field arrangement</p>
                    <div className="flex gap-1 rounded-md bg-muted p-1">
                      {([
                        { value: 'stacked', label: 'Stacked', icon: Rows2 },
                        { value: 'inline', label: 'Side by side', icon: Columns2 },
                      ] as const).map(({ value: layout, label, icon: Icon }) => (
                        <button key={layout} type="button" onClick={() => onFormLayoutChange(layout)}
                          className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors', formLayout === layout ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                    {formLayout === 'inline' && (
                      <div className="flex gap-1 rounded-md bg-muted p-1">
                        {([25, 33, 50] as const).map((w) => (
                          <button key={w} type="button" onClick={() => onFormLabelWidthChange(w)}
                            className={cn('flex-1 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors', formLabelWidth === w ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                            {w}%
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Form blocks — draggable, with style pickers */}
              {cardStyleCss && <style dangerouslySetInnerHTML={{ __html: cardStyleCss }} />}
              <div data-color-theme={centre.themePresetId} data-card-canvas className="space-y-0">
                {formCardMode === 'single' ? (
                  <>
                    <div className="mb-2 flex justify-end" style={{ fontFamily: 'var(--font-sans)' }}>
                      <StylePicker theme={centre.themePresetId} value={singleCardStyleIndex} onChange={onSingleCardStyleIndexChange} size="sm" className="w-[130px] bg-background shadow-sm" />
                    </div>
                    <Card className="gap-0 py-0" style={{ backgroundColor: singleStylePreview.background, ...(singleStylePreview.cardBorder ? { borderColor: singleStylePreview.cardBorder, borderWidth: 1 } : {}) }}>
                      <CardContent className="space-y-6 p-6">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={centre.sectionOrder} strategy={verticalListSortingStrategy}>
                            <div className={cardSpacingClass}>{blocks}</div>
                          </SortableContext>
                        </DndContext>
                        {submitButtonPreview()}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={centre.sectionOrder} strategy={verticalListSortingStrategy}>
                      <div className={cardSpacingClass}>{blocks}</div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              {formCardMode === 'separate' && submitButtonPreview()}
            </>
          )}
    </div>
  )
}
