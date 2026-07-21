import { notFound } from 'next/navigation'
import { getCentre } from '@/lib/subscription-centre-store'
import { richTextContentClass } from '@/components/rich-text-editor'
import { cn } from '@/lib/utils'

const TEMPLATE_LABELS: Record<string, string> = {
  doubleOptIn: 'Double opt-in',
  confirmation: 'Confirmation',
  unsubscribed: 'Unsubscribed',
}

interface Props {
  searchParams: Promise<{ centreId?: string; template?: string }>
}

export default async function EmailPreviewPage({ searchParams }: Props) {
  const { centreId, template } = await searchParams

  if (!centreId || !template) notFound()
  if (!['doubleOptIn', 'confirmation', 'unsubscribed'].includes(template)) notFound()

  const centre = getCentre(centreId)
  if (!centre) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4] p-8">
        <div className="rounded-lg bg-white p-8 text-center shadow-sm" style={{ maxWidth: 650 }}>
          <p className="font-medium text-gray-600">Centre not found</p>
          <p className="mt-1 text-sm text-gray-400">Save your subscription centre first to preview emails.</p>
        </div>
      </div>
    )
  }

  const cfg = centre.emailConfig
  const tpl = cfg[template as 'doubleOptIn' | 'confirmation' | 'unsubscribed']
  const label = TEMPLATE_LABELS[template] ?? template

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      {/* Preview label — not part of the email itself */}
      <div className="mx-auto mb-4 px-4" style={{ maxWidth: 650 }}>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium uppercase tracking-wide">{centre.name} — {label} email</span>
          {tpl.subject && (
            <span className="truncate pl-4 text-right text-gray-400">Subject: {tpl.subject}</span>
          )}
        </div>
      </div>

      {/* Email body at 650px */}
      <div className="mx-auto bg-white shadow-sm" style={{ maxWidth: 650 }}>
        {tpl.previewText && (
          <div className="border-b border-dashed px-6 py-2 text-xs italic text-gray-400">
            Preview text: {tpl.previewText}
          </div>
        )}
        {cfg.bannerHtml && (
          <div
            className={cn('px-6 py-4 text-sm', richTextContentClass)}
            dangerouslySetInnerHTML={{ __html: cfg.bannerHtml }}
          />
        )}
        <div
          className={cn('px-6 py-6 text-sm', richTextContentClass)}
          dangerouslySetInnerHTML={{
            __html: tpl.bodyHtml || '<p style="color:#9ca3af;font-style:italic">No body content yet.</p>',
          }}
        />
        {cfg.footerHtml && (
          <div
            className={cn('px-6 py-4 text-sm', richTextContentClass)}
            dangerouslySetInnerHTML={{ __html: cfg.footerHtml }}
          />
        )}
      </div>
    </div>
  )
}
