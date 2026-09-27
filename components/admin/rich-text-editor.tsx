'use client'

import { useRef, useState } from 'react'
import { Bold, Italic, List, Eye, Pencil } from 'lucide-react'

/**
 * Formatting editor for article content.
 *
 * Stores MARKDOWN, not HTML. That is the load-bearing decision here: the
 * mother's Android app renders article bodies through
 * `formatArticleBody()` in ui/screens/AllScreens.kt, which understands
 * `**bold**`, `*italic*` / `_italic_`, `* ` bullets and bare URLs. Producing
 * HTML from this editor would mean nothing an admin typed would render on a
 * phone, so the toolbar writes exactly the markers the app already reads and
 * the backend `content` field stays a plain TextField -- no model change, no
 * migration, and existing articles keep working untouched.
 *
 * DELIBERATELY NO numbered-list button, and no underline, headings or colour.
 * The app does not render those, so offering them would let an admin format
 * text that silently arrives as literal asterisks or plain prose on the
 * mother's screen. Every control here maps to something that actually
 * displays. If the app learns a new marker, add the button at the same time.
 *
 * The preview below is a SECOND implementation of that same mini-format, in
 * TypeScript rather than Kotlin, so the two can drift. They are kept
 * deliberately small for that reason. If you change one, change the other.
 */

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

type Marker = '**' | '*'

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 10,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPreview, setShowPreview] = useState(false)

  /** Wraps the current selection in `marker`, or unwraps it if already wrapped. */
  const wrapSelection = (marker: Marker) => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)

    // Nothing selected: drop the markers in and put the caret between them so
    // the next keystroke is already formatted, which is what a word processor
    // does.
    if (start === end) {
      const next = `${value.slice(0, start)}${marker}${marker}${value.slice(end)}`
      onChange(next)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(start + marker.length, start + marker.length)
      })
      return
    }

    const alreadyWrapped =
      selected.startsWith(marker) && selected.endsWith(marker) && selected.length > marker.length * 2

    const replacement = alreadyWrapped
      ? selected.slice(marker.length, -marker.length)
      : `${marker}${selected}${marker}`

    onChange(`${value.slice(0, start)}${replacement}${value.slice(end)}`)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start, start + replacement.length)
    })
  }

  /** Toggles `* ` at the start of every line the selection touches. */
  const toggleBullets = () => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd

    // Expand to whole lines -- a bullet marker belongs at the start of a line,
    // not wherever the selection happened to begin.
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEndIndex = value.indexOf('\n', end)
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex

    const block = value.slice(lineStart, lineEnd)
    const lines = block.split('\n')
    const allBulleted = lines.every((line) => line.trim() === '' || line.trimStart().startsWith('* '))

    const rewritten = lines
      .map((line) => {
        if (line.trim() === '') return line
        if (allBulleted) return line.replace(/^(\s*)\* /, '$1')
        return `* ${line.trimStart()}`
      })
      .join('\n')

    onChange(`${value.slice(0, lineStart)}${rewritten}${value.slice(lineEnd)}`)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(lineStart, lineStart + rewritten.length)
    })
  }

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolbarButton label="Bold" onClick={() => wrapSelection('**')}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => wrapSelection('*')}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Bullet list" onClick={toggleBullets}>
          <List className="h-4 w-4" />
        </ToolbarButton>

        <div className="ml-auto">
          <ToolbarButton
            label={showPreview ? 'Back to editing' : 'Preview as mothers will see it'}
            onClick={() => setShowPreview((p) => !p)}
            active={showPreview}
          >
            {showPreview ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="ml-1.5 text-xs font-medium">
              {showPreview ? 'Edit' : 'Preview'}
            </span>
          </ToolbarButton>
        </div>
      </div>

      {showPreview ? (
        <div
          className="px-4 py-3.5 text-sm text-foreground leading-relaxed min-h-[220px]"
          aria-label="Article preview"
        >
          {value.trim() ? (
            renderPreview(value)
          ) : (
            <p className="text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          name="content"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3.5 text-foreground placeholder-muted-foreground focus:outline-none resize-y"
        />
      )}

      <p className="border-t border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        Select text and use the buttons above. Bold, italics and bullet lists are
        the formatting the mobile app displays.
      </p>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string
  onClick: () => void
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex items-center rounded-md px-2 py-1.5 transition hover:bg-muted ${
        active ? 'bg-muted text-primary' : 'text-muted-foreground'
      }`}
    >
      {children}
    </button>
  )
}

// --- preview rendering -------------------------------------------------------
// Mirrors formatArticleBody() in the Android app. Keep the two in step.

const INLINE = /(https?:\/\/\S+)|\*\*(.+?)\*\*|\*([^*\n]+?)\*|_([^_\n]+?)_/g

/** Renders bold, italics and links inside one line of text. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null
  INLINE.lastIndex = 0
  let i = 0

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index))
    const [full, url, bold, italicStar, italicUnderscore] = match
    const key = `${keyPrefix}-${i++}`

    if (url) {
      const clean = url.replace(/[.,;:)"']+$/, '')
      nodes.push(
        <a
          key={key}
          href={clean}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {clean}
        </a>
      )
      nodes.push(url.slice(clean.length))
    } else if (bold) {
      nodes.push(<strong key={key}>{bold}</strong>)
    } else if (italicStar || italicUnderscore) {
      nodes.push(<em key={key}>{italicStar || italicUnderscore}</em>)
    } else {
      nodes.push(full)
    }
    cursor = match.index + full.length
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

/** Renders the whole body: bullet runs become <ul>, everything else <p>. */
function renderPreview(src: string): React.ReactNode[] {
  const blocks: React.ReactNode[] = []
  const lines = src.split('\n')
  let bullets: string[] = []
  let key = 0

  const flushBullets = () => {
    if (bullets.length === 0) return
    blocks.push(
      <ul key={`ul-${key++}`} className="my-2 list-disc space-y-1 pl-5">
        {bullets.map((b, idx) => (
          <li key={idx}>{renderInline(b, `li-${key}-${idx}`)}</li>
        ))}
      </ul>
    )
    bullets = []
  }

  for (const line of lines) {
    const trimmed = line.trimStart()
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      bullets.push(trimmed.slice(2))
      continue
    }
    flushBullets()
    if (trimmed === '') continue
    blocks.push(
      <p key={`p-${key++}`} className="my-2">
        {renderInline(line, `p-${key}`)}
      </p>
    )
  }
  flushBullets()
  return blocks
}
