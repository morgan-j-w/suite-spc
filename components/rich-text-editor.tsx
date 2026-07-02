'use client'

import { forwardRef, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Palette,
  List,
  ListOrdered,
  Link as LinkIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Shared with the live widget so saved HTML renders the same way it looked while editing.
export const richTextContentClass =
  '[&_a]:text-primary [&_a]:underline [&_hr]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:min-h-[1.5em]'

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
      // Heading/codeBlock dropped to match the earlier simplification of this toolbar --
      // no dedicated UI for either, so the underlying node types stay off too.
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: false },
      }),
      TextStyle,
      Color,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Start typing...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none',
      },
    },
  })

  if (!editor) return null

  // A native window.prompt() looked simpler, but it's known to fail silently in embedded
  // webview browser contexts (no dialog ever appears, the call just returns null) -- this
  // popover works everywhere and matches how every other dialog in this app is built.
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

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/30 p-1">
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

        <ToolbarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
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
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    applyLink()
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                {editor.isActive('link') && (
                  <Button type="button" variant="outline" size="sm" onClick={removeLink}>
                    Remove link
                  </Button>
                )}
                <Button type="button" size="sm" onClick={applyLink}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        <div className="flex gap-1">
          <ToolbarButton
            title="Align left"
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Align center"
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Align right"
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Justify"
            active={editor.isActive({ textAlign: 'justify' })}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
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
      // Without this, the button's mousedown blurs the editor before onClick runs,
      // which leaves ProseMirror's selection in a state where Enter stops working
      // until the user clicks back into the text themselves.
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
