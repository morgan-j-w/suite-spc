'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, Code2, Copy, Globe, Send } from 'lucide-react'
import type { SubscriptionCentre } from '@/lib/subscription-centre'
import { cn } from '@/lib/utils'

interface ExportEditorProps {
  centre: SubscriptionCentre
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-md border bg-muted/50">
      <div className="absolute right-2 top-2">
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 pr-20 text-xs leading-relaxed">
        <code className="text-foreground">{code}</code>
      </pre>
    </div>
  )
}

function ExportPanel({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  children,
}: {
  icon: typeof Globe
  iconBg: string
  iconColor: string
  title: string
  description: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/40"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          {open && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </button>
      {open && (
        <div className="space-y-4 border-t bg-muted/20 p-4">
          {children}
        </div>
      )}
    </div>
  )
}

export function ExportEditor({ centre }: ExportEditorProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
  const subscribeUrl = `${baseUrl}/subscribe`

  const iframeCode = `<iframe
  src="${subscribeUrl}"
  width="100%"
  height="700"
  style="border: none; display: block;"
  title="Subscribe"
></iframe>`

  const scriptCode = `<div id="preference-centre"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${subscribeUrl}';
    iframe.style.cssText = 'width:100%;border:none;display:block;';
    iframe.height = '700';
    iframe.title = 'Subscribe';
    document.getElementById('preference-centre').appendChild(iframe);
  })();
</script>`

  const profileFields = centre.profileFieldSections.flatMap((s) => s.fields)
  const apiExample = JSON.stringify(
    {
      centreId: centre.id,
      profile: Object.fromEntries([
        ['email', 'user@example.com'],
        ...profileFields
          .filter((f) => f.id !== 'email')
          .slice(0, 3)
          .map((f) => [f.id, f.type === 'checkbox' ? false : 'example']),
      ]),
      preferences: Object.fromEntries(
        centre.categories.slice(0, 2).map((c) => [c.id, c.options?.[0]?.key ?? 'yes'])
      ),
    },
    null,
    2
  )

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Export</h2>
        <p className="text-sm text-muted-foreground">
          Ways to embed this subscribe form on an external website.
        </p>
      </div>

      <ExportPanel
        icon={Globe}
        iconBg="bg-blue-100 dark:bg-blue-950"
        iconColor="text-blue-600 dark:text-blue-400"
        title="Iframe embed"
        description="Paste this into any HTML page to embed the hosted form. Works in most website builders and CMS platforms."
      >
        <CodeBlock code={iframeCode} />
      </ExportPanel>

      <ExportPanel
        icon={Code2}
        iconBg="bg-violet-100 dark:bg-violet-950"
        iconColor="text-violet-600 dark:text-violet-400"
        title="Script embed"
        description="A JavaScript snippet that injects the iframe — useful when your CMS or email template strips raw iframe tags."
      >
        <CodeBlock code={scriptCode} />
      </ExportPanel>

      <ExportPanel
        icon={Send}
        iconBg="bg-emerald-100 dark:bg-emerald-950"
        iconColor="text-emerald-600 dark:text-emerald-400"
        title="Subscribe API"
        description="Call this endpoint directly from your own form or integration. Useful when you want to build a fully custom UI."
      >
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Endpoint</p>
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">POST</span>
            <span className="flex-1 text-xs font-mono">{baseUrl}/api/subscribe</span>
            <CopyButton text={`${baseUrl}/api/subscribe`} />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Request body (JSON)</p>
          <CodeBlock code={apiExample} />
        </div>
        <div className="rounded-md border bg-background p-3 text-xs text-muted-foreground space-y-1">
          <p><span className="font-medium text-foreground">centreId</span> — always <code className="rounded bg-muted px-1">{centre.id}</code></p>
          <p><span className="font-medium text-foreground">profile</span> — subscriber details; <code className="rounded bg-muted px-1">email</code> is required</p>
          <p><span className="font-medium text-foreground">preferences</span> — map of category ID → selected option key</p>
        </div>
      </ExportPanel>
    </div>
  )
}
