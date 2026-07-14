'use client'

import { useState } from 'react'
import { Columns2, Eye, GalleryVertical, Pencil, RectangleHorizontal, Rows2 } from 'lucide-react'
import { toast } from 'sonner'
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
  flattenProfileFields,
  isCategoryAnswered,
  isCategoryVisible,
  isProfileFieldAnswered,
  isProfileFieldVisible,
  isSectionVisible,
  type CategoryAnswers,
  type ProfileFieldSection,
  type Category,
  type SubscriberProfile,
} from '@/lib/subscription-types'
import type { SubscriptionCentre, SubmitButtonAlignment, ContentBlock, BannerFooter } from '@/lib/subscription-centre'
import type { ColorTheme } from '@/lib/brand-config'
import { getStylePreviews } from '@/lib/style-previews'
import { RenderedSection, RenderedCategory } from '@/components/subscription-centre-widget'
import { RenderedContentBlock } from '@/components/rendered-content-block'
import { BannerFooterEditor } from '@/components/banner-footer-editor'
import { SortablePreviewBlock } from '@/components/sortable-preview-block'
import { StylePicker } from '@/components/style-picker'
import { ThemePresetPicker } from '@/components/theme-preset-picker'
import { SubmitButtonPreview } from '@/components/submit-button-preview'
import { AnimatedVisibility } from '@/components/animated-visibility'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  onThemeChange: (theme: ColorTheme) => void
  onSectionOrderChange: (order: string[]) => void
  onProfileFieldSectionsChange: (sections: ProfileFieldSection[]) => void
  onCategoriesChange: (categories: Category[]) => void
  onContentBlocksChange: (blocks: ContentBlock[]) => void
  onBannerChange: (value: BannerFooter | null) => void
  onFooterChange: (value: BannerFooter | null) => void
  submitButtonText: string
  submitButtonStyleIndex: number
  submitButtonAlignment: SubmitButtonAlignment
  onSubmitButtonTextChange: (text: string) => void
  onSubmitButtonStyleIndexChange: (index: number) => void
  onSubmitButtonAlignmentChange: (alignment: SubmitButtonAlignment) => void
  formLayout: 'stacked' | 'inline'
  formLabelWidth: number
  formCardMode: 'separate' | 'single'
  singleCardStyleIndex: number
  onFormLayoutChange: (layout: 'stacked' | 'inline') => void
  onFormLabelWidthChange: (width: number) => void
  onFormCardModeChange: (mode: 'separate' | 'single') => void
  onSingleCardStyleIndexChange: (index: number) => void
}

// Combines theme selection, a live interactive rendering of the real form, drag-to-reorder,
// and per-block styling in one view. The "Preview" toggle hides the drag handles and
// style pickers so the user can see exactly what a subscriber will see.
export function PreviewEditor({
  centre,
  onThemeChange,
  onSectionOrderChange,
  onProfileFieldSectionsChange,
  onCategoriesChange,
  onContentBlocksChange,
  onBannerChange,
  onFooterChange,
  submitButtonText,
  submitButtonStyleIndex,
  submitButtonAlignment,
  onSubmitButtonTextChange,
  onSubmitButtonStyleIndexChange,
  onSubmitButtonAlignmentChange,
  formLayout,
  formLabelWidth,
  formCardMode,
  singleCardStyleIndex,
  onFormLayoutChange,
  onFormLabelWidthChange,
  onFormCardModeChange,
  onSingleCardStyleIndexChange,
}: PreviewEditorProps) {
  const [profile, setProfile] = useState<SubscriberProfile>(EMPTY_PROFILE)
  const [answers, setAnswers] = useState<CategoryAnswers>(() => buildDefaultAnswers(centre.categories))
  const [isFinalPreview, setIsFinalPreview] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isFormValid =
    flattenProfileFields(centre.profileFieldSections)
      .filter((field) => isProfileFieldVisible(field, profile))
      .every((field) => !field.required || isProfileFieldAnswered(field, profile)) &&
    centre.categories
      .filter((category) => isCategoryVisible(category, profile, answers))
      .every((category) => !category.required || isCategoryAnswered(category, answers))

  const handlePreviewSubmit = () => {
    setSubmitted(true)
    if (isFormValid) {
      toast.success('Form valid — this is where submission would happen.')
    }
  }

  const firstSectionId = centre.sectionOrder.find((id) => centre.profileFieldSections.some((s) => s.id === id))

  // The first Form Fields section is never conditional -- if reordering changes who's first,
  // drop any leftover rule on the section that just became first.
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

  const blocks = centre.sectionOrder.map((id, index) => {
    const section = centre.profileFieldSections.find((s) => s.id === id)
    if (section) {
      const isFirstSection = section.id === firstSectionId
      const hasVisibleField =
        section.fields.length === 0 || section.fields.some((field) => isProfileFieldVisible(field, profile))
      const visible = (isFirstSection || isSectionVisible(section, profile, answers)) && hasVisibleField

      if (formCardMode === 'single') {
        const embeddedSection = <RenderedSection key={id} section={section} stylePreview={singleStylePreview} profile={profile} onProfileChange={setProfile} visible={isFinalPreview ? visible : true} showValidation={isFinalPreview && submitted} formLayout={formLayout} formLabelWidth={formLabelWidth} embedded />
        return isFinalPreview ? embeddedSection : (
          <SortablePreviewBlock
            key={id}
            id={id}
            theme={centre.themePresetId}
            cardStyleIndex={singleCardStyleIndex}
            onCardStyleChange={onSingleCardStyleIndexChange}
            hideStylePicker
            isFirst={index === 0}
            isLast={index === centre.sectionOrder.length - 1}
            onMoveUp={() => moveBlock(id, 'up')}
            onMoveDown={() => moveBlock(id, 'down')}
          >
            {embeddedSection}
          </SortablePreviewBlock>
        )
      }

      const stylePreview = getStylePreviews(centre.themePresetId)[section.cardStyleIndex ?? 0]
      const content = (
        <RenderedSection section={section} stylePreview={stylePreview} profile={profile} onProfileChange={setProfile} visible={isFinalPreview ? visible : true} showValidation={isFinalPreview && submitted} formLayout={formLayout} formLabelWidth={formLabelWidth} />
      )
      return isFinalPreview ? (
        <div key={id}>{content}</div>
      ) : (
        <SortablePreviewBlock
          key={id}
          id={id}
          theme={centre.themePresetId}
          cardStyleIndex={section.cardStyleIndex}
          onCardStyleChange={(index) =>
            onProfileFieldSectionsChange(centre.profileFieldSections.map((s) => (s.id === id ? { ...s, cardStyleIndex: index } : s)))
          }
          isFirst={index === 0}
          isLast={index === centre.sectionOrder.length - 1}
          onMoveUp={() => moveBlock(id, 'up')}
          onMoveDown={() => moveBlock(id, 'down')}
        >
          {content}
        </SortablePreviewBlock>
      )
    }

    const category = centre.categories.find((c) => c.id === id)
    if (category) {
      if (formCardMode === 'single') {
        const embeddedCategory = (
          <AnimatedVisibility key={id} visible={isFinalPreview ? isCategoryVisible(category, profile, answers) : true}>
            <RenderedCategory category={category} stylePreview={singleStylePreview} answers={answers} onAnswersChange={setAnswers} showValidation={isFinalPreview && submitted} embedded />
          </AnimatedVisibility>
        )
        return isFinalPreview ? embeddedCategory : (
          <SortablePreviewBlock
            key={id}
            id={id}
            theme={centre.themePresetId}
            cardStyleIndex={singleCardStyleIndex}
            onCardStyleChange={onSingleCardStyleIndexChange}
            hideStylePicker
            isFirst={index === 0}
            isLast={index === centre.sectionOrder.length - 1}
            onMoveUp={() => moveBlock(id, 'up')}
            onMoveDown={() => moveBlock(id, 'down')}
          >
            {embeddedCategory}
          </SortablePreviewBlock>
        )
      }

      const stylePreview = getStylePreviews(centre.themePresetId)[category.cardStyleIndex ?? 0]
      const content = (
        <AnimatedVisibility visible={isFinalPreview ? isCategoryVisible(category, profile, answers) : true}>
          <RenderedCategory category={category} stylePreview={stylePreview} answers={answers} onAnswersChange={setAnswers} showValidation={isFinalPreview && submitted} />
        </AnimatedVisibility>
      )
      return isFinalPreview ? (
        <div key={id}>{content}</div>
      ) : (
        <SortablePreviewBlock
          key={id}
          id={id}
          theme={centre.themePresetId}
          cardStyleIndex={category.cardStyleIndex}
          onCardStyleChange={(index) => onCategoriesChange(centre.categories.map((c) => (c.id === id ? { ...c, cardStyleIndex: index } : c)))}
          isFirst={index === 0}
          isLast={index === centre.sectionOrder.length - 1}
          onMoveUp={() => moveBlock(id, 'up')}
          onMoveDown={() => moveBlock(id, 'down')}
        >
          {content}
        </SortablePreviewBlock>
      )
    }

    const contentBlock = (centre.contentBlocks ?? []).find((b) => b.id === id)
    if (contentBlock) {
      const rendered = <RenderedContentBlock key={id} block={contentBlock} />
      return isFinalPreview ? rendered : (
        <SortablePreviewBlock
          key={id}
          id={id}
          theme={centre.themePresetId}
          cardStyleIndex={undefined}
          onCardStyleChange={() => {}}
          hideStylePicker
          isFirst={index === 0}
          isLast={index === centre.sectionOrder.length - 1}
          onMoveUp={() => moveBlock(id, 'up')}
          onMoveDown={() => moveBlock(id, 'down')}
        >
          {rendered}
        </SortablePreviewBlock>
      )
    }

    return null
  })

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Style</h2>
          <p className="text-sm text-muted-foreground">
            {isFinalPreview
              ? 'This is exactly what a subscriber will see.'
              : "Choose your theme, layout and card styles. Drag or use the arrows to reorder blocks."}
          </p>
        </div>
        <div className="flex gap-1 rounded-md bg-muted p-1">
          <button
            type="button"
            onClick={() => { setIsFinalPreview(false); setSubmitted(false) }}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
              !isFinalPreview ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsFinalPreview(true)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
              isFinalPreview ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      {!isFinalPreview && (
        <>
          <BannerFooterEditor
            banner={centre.banner ?? null}
            footer={centre.footer ?? null}
            onBannerChange={onBannerChange}
            onFooterChange={onFooterChange}
          />

          <Card className="gap-0 py-0">
            <CardHeader className="px-6 pt-4 pb-2">
              <CardTitle className="text-base">Theme</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-0 pb-6">
              <ThemePresetPicker value={centre.themePresetId} onChange={onThemeChange} />
            </CardContent>
          </Card>

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
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onFormCardModeChange(mode)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                        formCardMode === mode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
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
                    <button
                      key={layout}
                      type="button"
                      onClick={() => onFormLayoutChange(layout)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                        formLayout === layout ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
                {formLayout === 'inline' && (
                  <div className="flex gap-1 rounded-md bg-muted p-1">
                    {([25, 33, 50] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => onFormLabelWidthChange(w)}
                        className={cn(
                          'flex-1 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors',
                          formLabelWidth === w ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {w}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div data-color-theme={centre.themePresetId} className="space-y-0">
        {centre.banner?.html && (
          <div className={cn('py-3 text-sm', centre.banner.fullWidth ? '' : 'px-1')}>
            <div dangerouslySetInnerHTML={{ __html: centre.banner.html }} />
          </div>
        )}
        {formCardMode === 'single' ? (
          <>
            <div className="mb-2 flex justify-end" style={{ fontFamily: 'var(--font-sans)' }}>
              <StylePicker
                theme={centre.themePresetId}
                value={singleCardStyleIndex}
                onChange={onSingleCardStyleIndexChange}
                size="sm"
                className="w-[130px] bg-background shadow-sm"
              />
            </div>
            <Card
              className="gap-0 py-0"
              style={{
                backgroundColor: singleStylePreview.background,
                ...(singleStylePreview.cardBorder ? { borderColor: singleStylePreview.cardBorder, borderWidth: 1 } : {}),
              }}
            >
              <CardContent className="space-y-6 p-6">
                {isFinalPreview ? (
                  <div className="space-y-6">{blocks}</div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={centre.sectionOrder} strategy={verticalListSortingStrategy}>
                      <div className="space-y-6">{blocks}</div>
                    </SortableContext>
                  </DndContext>
                )}
                <SubmitButtonPreview
                  theme={centre.themePresetId}
                  text={submitButtonText}
                  styleIndex={submitButtonStyleIndex}
                  alignment={submitButtonAlignment}
                  onTextChange={onSubmitButtonTextChange}
                  onStyleIndexChange={onSubmitButtonStyleIndexChange}
                  onAlignmentChange={onSubmitButtonAlignmentChange}
                  readOnly={isFinalPreview}
                  onSubmit={isFinalPreview ? handlePreviewSubmit : undefined}
                />
              </CardContent>
            </Card>
          </>
        ) : isFinalPreview ? (
          <div className="space-y-6">{blocks}</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={centre.sectionOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">{blocks}</div>
            </SortableContext>
          </DndContext>
        )}
        {centre.footer?.html && (
          <div className={cn('py-3 text-sm', centre.footer.fullWidth ? '' : 'px-1')}>
            <div dangerouslySetInnerHTML={{ __html: centre.footer.html }} />
          </div>
        )}
      </div>

      {formCardMode === 'separate' && (
        <SubmitButtonPreview
          theme={centre.themePresetId}
          text={submitButtonText}
          styleIndex={submitButtonStyleIndex}
          alignment={submitButtonAlignment}
          onTextChange={onSubmitButtonTextChange}
          onStyleIndexChange={onSubmitButtonStyleIndexChange}
          onAlignmentChange={onSubmitButtonAlignmentChange}
          readOnly={isFinalPreview}
          onSubmit={isFinalPreview ? handlePreviewSubmit : undefined}
        />
      )}
    </div>
  )
}
