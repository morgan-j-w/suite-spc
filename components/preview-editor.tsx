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
import type { SubscriptionCentre, StatusPages, SubmitButtonAlignment, ContentBlock, BannerConfig, FooterConfig, Brand, CardStyle, FormWidth } from '@/lib/subscription-centre'
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
import { SettingGroup, SettingRow } from '@/components/setting-row'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SizeControl } from '@/components/ui/size-control'
import { Textarea } from '@/components/ui/textarea'
import { UnitInput } from '@/components/ui/unit-input'
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

const BANNER_TEXT_FLOWS: { id: keyof StatusPages; label: string }[] = [
  { id: 'subscribe', label: 'Subscribe' },
  { id: 'managePreferences', label: 'Manage preferences' },
  { id: 'manageRequest', label: 'Manage preferences request' },
  { id: 'unsubscribe', label: 'Unsubscribe' },
  { id: 'unsubscribeRequest', label: 'Unsubscribe request' },
  { id: 'resubscribe', label: 'Resubscribe' },
]

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
  onStatusPagesChange: (statusPages: StatusPages) => void
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
  onStatusPagesChange,
}: PreviewEditorProps) {
  const [profile, setProfile] = useState<SubscriberProfile>(EMPTY_PROFILE)
  const [bannerTextFlow, setBannerTextFlow] = useState<keyof StatusPages>('subscribe')
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
            const onOff = [{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }] as const
            return (
              <Card className="gap-0 py-0">
                <CardHeader className="px-6 pt-4 pb-2">
                  <CardTitle className="text-base">Style</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pt-0 pb-6 space-y-5">
                  <div>
                    <p className="mb-4 text-xs text-muted-foreground">Colour and font cascade from the theme preset to all components.</p>
                    <ThemePresetPicker value={centre.themePresetId} onChange={onThemeChange} />
                  </div>

                  <SettingGroup title="Page" collapsible>
                    <ColorRow label="Background" value={pageBackgroundColor} onChange={onPageBackgroundColorChange} themeId={centre.themePresetId} />
                    <SettingRow label="Content width">
                      <Segmented
                        options={[{ value: 'narrow', label: 'Narrow' }, { value: 'default', label: 'Default' }, { value: 'wide', label: 'Wide' }]}
                        value={centre.formWidth ?? 'default'}
                        onChange={onFormWidthChange}
                      />
                    </SettingRow>
                  </SettingGroup>

                  <SettingGroup title="Form cards" collapsible>
                    <SettingRow label="Border">
                      <Segmented options={onOff} value={cs.borderEnabled === false ? 'off' : 'on'}
                        onChange={(v) => patchCs({ borderEnabled: v === 'off' ? false : undefined })} />
                    </SettingRow>
                    <div className={cn('transition-opacity', cs.borderEnabled === false && 'pointer-events-none opacity-40')}>
                      <ColorRow label="Border colour" value={cs.borderColor} onChange={(v) => patchCs({ borderColor: v })} themeId={centre.themePresetId} />
                    </div>
                    <SettingRow label="Border width" dimmed={cs.borderEnabled === false}>
                      <UnitInput min={1} max={4} value={cs.borderWidth} placeholder="Theme" onChange={(v) => patchCs({ borderWidth: v })} />
                    </SettingRow>
                    <SettingRow label="Border radius">
                      <UnitInput min={0} max={24} value={cs.borderRadius} placeholder="Theme" onChange={(v) => patchCs({ borderRadius: v })} />
                    </SettingRow>
                    <SettingRow label="Drop shadow">
                      <Segmented options={onOff} value={(cs.shadow ?? 'on') as 'on' | 'off'} onChange={(v) => patchCs({ shadow: v as CardStyle['shadow'] })} />
                    </SettingRow>
                    <SettingRow label="Card padding">
                      <SizeControl value={cs.padding} onChange={(v) => patchCs({ padding: v })} defaultCustomValue={24} max={80} />
                    </SettingRow>
                    <SettingRow label="Card spacing">
                      <SizeControl value={cs.spacing} onChange={(v) => patchCs({ spacing: v })} defaultCustomValue={24} max={80} />
                    </SettingRow>
                  </SettingGroup>
                </CardContent>
              </Card>
            )
          })()}

          {/* Banner */}
          {designSection === 'banner' && (() => {
            // Banner heading/blurb are per-page (they live on statusPages so subscribe,
            // unsubscribe, etc. each get their own copy) but they're edited HERE, where
            // the banner is composed — the preview follows the selected page.
            const flowContent = centre.statusPages[bannerTextFlow] as { bannerHeading?: string; bannerBlurb?: string }
            const patchBannerText = (u: { bannerHeading?: string; bannerBlurb?: string }) =>
              onStatusPagesChange({ ...centre.statusPages, [bannerTextFlow]: { ...centre.statusPages[bannerTextFlow], ...u } })
            return (
            <Card className="gap-0 py-0">
              <CardContent className="p-4">
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
                        heading={flowContent.bannerHeading}
                        blurb={flowContent.bannerBlurb}
                        contentMaxWidth={getContentMaxWidth(centre.formWidth)}
                      />
                    </div>
                  )}
                  textEditor={
                    <SettingGroup title="Text" collapsible>
                      <p className="text-xs text-muted-foreground">Each page has its own banner heading and description — pick a page, then edit its text. The preview above follows.</p>
                      <SettingRow label="Page">
                        <Select value={bannerTextFlow} onValueChange={(v) => setBannerTextFlow(v as keyof StatusPages)}>
                          <SelectTrigger className="h-7 w-full text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BANNER_TEXT_FLOWS.map((f) => (
                              <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </SettingRow>
                      <SettingRow label="Heading">
                        <Input
                          value={flowContent.bannerHeading ?? ''}
                          onChange={(e) => patchBannerText({ bannerHeading: e.target.value || undefined })}
                          placeholder="e.g. Stay in the loop"
                          className="h-7 flex-1 text-xs"
                        />
                      </SettingRow>
                      <SettingRow label="Description">
                        <Textarea
                          value={flowContent.bannerBlurb ?? ''}
                          onChange={(e) => patchBannerText({ bannerBlurb: e.target.value || undefined })}
                          placeholder="e.g. Choose the communications that matter to you."
                          rows={2}
                          className="flex-1 resize-none text-xs"
                        />
                      </SettingRow>
                    </SettingGroup>
                  }
                />
              </CardContent>
            </Card>
            )
          })()}

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
                    <Segmented
                      size="sm"
                      options={[
                        { value: 'separate', label: 'Separate cards', icon: GalleryVertical },
                        { value: 'single', label: 'Single card', icon: RectangleHorizontal },
                      ]}
                      value={formCardMode}
                      onChange={onFormCardModeChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Field arrangement</p>
                    <Segmented
                      size="sm"
                      options={[
                        { value: 'stacked', label: 'Stacked', icon: Rows2 },
                        { value: 'inline', label: 'Side by side', icon: Columns2 },
                      ]}
                      value={formLayout}
                      onChange={onFormLayoutChange}
                    />
                    {formLayout === 'inline' && (
                      <Segmented
                        size="sm"
                        options={[{ value: '25', label: '25%' }, { value: '33', label: '33%' }, { value: '50', label: '50%' }]}
                        value={String(formLabelWidth) as '25' | '33' | '50'}
                        onChange={(v) => onFormLabelWidthChange(Number(v))}
                      />
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
