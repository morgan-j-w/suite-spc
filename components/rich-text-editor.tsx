'use client'

import { forwardRef, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Palette,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Shared with the live widget so saved HTML renders the same way it looked while editing.
export const richTextContentClass = [
  '[&_a]:text-primary [&_a]:underline',
  '[&_hr]:my-3',
  '[&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:list-decimal [&_ol]:pl-5',
  '[&_p]:min-h-[1.5em]',
  '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight',
  '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight',
  '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug',
  '[&_h4]:text-base [&_h4]:font-semibold',
  // Table styles
  '[&_table]:w-full [&_table]:border-collapse',
  '[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold',
  '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm',
  '[&_.selectedCell]:bg-primary/10',
].join(' ')

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
      }),
      Link.configure({ openOnClick: false, autolink: false }),
      TextStyle,
      Color,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Placeholder.configure({ placeholder: placeholder || 'Start typing...' }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'tiptap-editor focus:outline-none' },
    },
  })

  if (!editor) return null

  const openLinkPopover = (open: boolean) => {
    if (open) setLinkUrl((editor.getAttributes('link').href as string | undefined) || '')
    setLinkPopoverOpen(open)
  }

  const applyLink = () => {
    const url = linkUrl.trim()
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    setLinkPopoverOpen(false)
  }

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkPopoverOpen(false)
  }

  const inTable = editor.isActive('table')

  const currentHeading = [1, 2, 3, 4].find((l) => editor.isActive('heading', { level: l }))
  const headingValue = currentHeading ? String(currentHeading) : '0'

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = Number(e.target.value)
    if (level === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run()
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/30 p-1">

        {/* Heading select */}
        <select
          value={headingValue}
          onChange={handleHeadingChange}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-7 rounded border bg-background px-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="0">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Subscript" active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()}>
          <SubscriptIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Superscript" active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          <SuperscriptIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          tabIndex={-1}
        />
        <ToolbarButton title="Text colour" onClick={() => colorInputRef.current?.click()}>
          <Palette className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <Popover open={linkPopoverOpen} onOpenChange={openLinkPopover}>
          <PopoverTrigger asChild>
            <ToolbarButton title="Link" active={editor.isActive('link')}>
              <LinkIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); applyLink() }
                }}
              />
              <div className="flex justify-end gap-2">
                {editor.isActive('link') && (
                  <Button type="button" variant="outline" size="sm" onClick={removeLink}>Remove link</Button>
                )}
                <Button type="button" size="sm" onClick={applyLink}>Apply</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Table controls */}
        <ToolbarButton
          title="Insert table"
          active={inTable}
          onClick={() => {
            if (!inTable) editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }}
        >
          <TableIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        {inTable && (
          <>
            <Divider />
            <span className="text-[10px] font-medium text-muted-foreground">Row</span>
            <ToolbarButton title="Add row before" onClick={() => editor.chain().focus().addRowBefore().run()}>
              <span className="text-[10px] font-bold">↑+</span>
            </ToolbarButton>
            <ToolbarButton title="Add row after" onClick={() => editor.chain().focus().addRowAfter().run()}>
              <span className="text-[10px] font-bold">↓+</span>
            </ToolbarButton>
            <ToolbarButton title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
              <span className="text-[10px] font-bold">↕−</span>
            </ToolbarButton>

            <Divider />
            <span className="text-[10px] font-medium text-muted-foreground">Col</span>
            <ToolbarButton title="Add column before" onClick={() => editor.chain().focus().addColumnBefore().run()}>
              <span className="text-[10px] font-bold">←+</span>
            </ToolbarButton>
            <ToolbarButton title="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <span className="text-[10px] font-bold">→+</span>
            </ToolbarButton>
            <ToolbarButton title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
              <span className="text-[10px] font-bold">↔−</span>
            </ToolbarButton>

            <Divider />
            <ToolbarButton title="Merge / split cells" onClick={() => editor.chain().focus().mergeOrSplit().run()}>
              <span className="text-[10px] font-bold">⊞</span>
            </ToolbarButton>
            <ToolbarButton title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
              <span className="text-[10px] font-bold text-destructive">✕</span>
            </ToolbarButton>
          </>
        )}
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          'min-h-[88px] rounded-md border bg-background px-3 py-2 text-sm focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring/50',
          richTextContentClass
        )}
      />
    </div>
  )
}

const ToolbarButton = forwardRef<
  HTMLButtonElement,
  {
    title: string
    active?: boolean
    onClick?: () => void
    children: React.ReactNode
  } & React.ComponentProps<typeof Button>
>(function ToolbarButton({ title, active, onClick, children, ...props }, ref) {
  return (
    <Button
      ref={ref}
      type="button"
      variant={active ? 'default' : 'outline'}
      size="icon"
      className="h-7 w-7"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  )
})

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />
}
