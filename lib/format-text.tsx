import type { ReactNode } from 'react'

// Lightweight inline formatting -- **bold**, *italic*, __underline__, ~~strikethrough~~,
// ~subscript~, ^superscript^, [color=#hex]text[/color], and [text](url) links -- enough for
// short heading/paragraph copy without pulling in a full markdown/rich-text editor library.
export function renderFormattedText(text: string): ReactNode[] {
  const regex =
    /\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|~~(.+?)~~|~(.+?)~|\^(.+?)\^|\[color=(#[0-9a-fA-F]{6})\](.+?)\[\/color\]|\[(.+?)\]\((.+?)\)/g
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>)
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>)
    } else if (match[3] !== undefined) {
      nodes.push(<u key={key++}>{match[3]}</u>)
    } else if (match[4] !== undefined) {
      nodes.push(<s key={key++}>{match[4]}</s>)
    } else if (match[5] !== undefined) {
      nodes.push(<sub key={key++}>{match[5]}</sub>)
    } else if (match[6] !== undefined) {
      nodes.push(<sup key={key++}>{match[6]}</sup>)
    } else if (match[7] !== undefined) {
      nodes.push(
        <span key={key++} style={{ color: match[7] }}>
          {match[8]}
        </span>
      )
    } else if (match[9] !== undefined) {
      nodes.push(
        <a key={key++} href={match[10]} target="_blank" rel="noopener noreferrer" className="underline">
          {match[9]}
        </a>
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'numbered-list'; items: string[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'hr' }
  | { type: 'code-block'; lines: string[] }

const BULLET_LINE = /^-\s+(.*)$/
const NUMBERED_LINE = /^\d+\.\s+(.*)$/
const HEADING_LINE = /^(#{1,6})\s+(.*)$/
const HR_LINE = /^(-{3,}|\*{3,})$/
const CODE_FENCE_LINE = /^```$/

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = []
  let inCodeBlock = false

  for (const rawLine of text.split('\n')) {
    if (CODE_FENCE_LINE.test(rawLine.trim())) {
      if (inCodeBlock) {
        inCodeBlock = false
      } else {
        blocks.push({ type: 'code-block', lines: [] })
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'code-block') last.lines.push(rawLine)
      continue
    }

    const headingMatch = rawLine.match(HEADING_LINE)
    const bulletMatch = rawLine.match(BULLET_LINE)
    const numberedMatch = rawLine.match(NUMBERED_LINE)
    const last = blocks[blocks.length - 1]

    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6, text: headingMatch[2] })
    } else if (HR_LINE.test(rawLine.trim())) {
      blocks.push({ type: 'hr' })
    } else if (bulletMatch) {
      if (last?.type === 'bullet-list') last.items.push(bulletMatch[1])
      else blocks.push({ type: 'bullet-list', items: [bulletMatch[1]] })
    } else if (numberedMatch) {
      if (last?.type === 'numbered-list') last.items.push(numberedMatch[1])
      else blocks.push({ type: 'numbered-list', items: [numberedMatch[1]] })
    } else if (rawLine.trim() === '') {
      blocks.push({ type: 'paragraph', lines: [] })
    } else if (last?.type === 'paragraph') {
      last.lines.push(rawLine)
    } else {
      blocks.push({ type: 'paragraph', lines: [rawLine] })
    }
  }

  return blocks.filter((block) => block.type !== 'paragraph' || block.lines.length > 0)
}

const HEADING_CLASSES: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'text-2xl font-bold',
  2: 'text-xl font-bold',
  3: 'text-lg font-semibold',
  4: 'text-base font-semibold',
  5: 'text-sm font-semibold',
  6: 'text-xs font-semibold uppercase tracking-wide',
}

// Full block-level rendering (paragraphs, headings, lists, code blocks, and horizontal
// rules) -- for the Paragraph field type, the only one that supports multi-line content.
export function renderFormattedBlocks(text: string): ReactNode {
  return (
    <>
      {parseBlocks(text).map((block, i) => {
        if (block.type === 'heading') {
          const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
          return (
            <Tag key={i} className={HEADING_CLASSES[block.level]}>
              {renderFormattedText(block.text)}
            </Tag>
          )
        }
        if (block.type === 'hr') {
          return <hr key={i} className="my-2 border-t" />
        }
        if (block.type === 'code-block') {
          return (
            <pre key={i} className="overflow-x-auto rounded bg-muted p-2 font-mono text-sm">
              <code>{block.lines.join('\n')}</code>
            </pre>
          )
        }
        if (block.type === 'bullet-list') {
          return (
            <ul key={i} className="list-disc pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{renderFormattedText(item)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'numbered-list') {
          return (
            <ol key={i} className="list-decimal pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{renderFormattedText(item)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderFormattedText(line)}
              </span>
            ))}
          </p>
        )
      })}
    </>
  )
}
