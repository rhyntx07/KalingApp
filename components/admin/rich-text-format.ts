/**
 * The Bold / Italic toolbar logic for RichTextEditor, kept free of React so it
 * can be reasoned about (and tested) on its own.
 *
 * The mobile app renders article markdown ONE LINE AT A TIME and does not nest
 * styles (see formatArticleBody() in the Android app and renderPreview() in
 * rich-text-editor.tsx). Every rule below exists so the editor can only write
 * markers that will actually render:
 *
 *  1. Whitespace at either end of the selection is left outside the markers.
 *     A triple-click selects a line *with* its line break; wrapping that gave
 *     "**heading\n**", which reached mothers as literal asterisks. This was the
 *     bug in production.
 *  2. A selection spanning several lines is formatted line by line, after any
 *     "* " bullet, so a marker pair never crosses a line break or eats a bullet.
 *  3. A word selected inside an existing pair (double-click selects the word,
 *     not its markers) toggles that pair instead of wrapping it a second time
 *     ("****word****" renders as garbage).
 *  4. One style per span. Applying italic to bold text switches it to italic
 *     (and vice versa) rather than producing "***x***", which neither renderer
 *     understands. Clicking the style a span already has removes it.
 */

export type Marker = '**' | '*'

export interface FormatResult {
  value: string
  selectionStart: number
  selectionEnd: number
}

const BULLET = /^[ \t]*[*-] /
// Any complete single-line pair, bold or italic -- what one line can hold.
const INLINE_PAIR = /\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*/g

/** The marker that wraps the whole of `text`, if exactly one pair does. */
export function styleOf(text: string): Marker | null {
  if (/^\*\*[^*]+\*\*$/.test(text)) return '**'
  if (/^\*[^*]+\*$/.test(text)) return '*'
  return null
}

/** `text` with every complete bold/italic pair removed (their content kept). */
function stripMarkers(text: string): string {
  return text.replace(INLINE_PAIR, (_m, bold, italic) => bold ?? italic)
}

/** A marker pair sitting immediately around [start, end), not part of a longer run. */
function markerAround(value: string, start: number, end: number): Marker | null {
  for (const m of ['**', '*'] as Marker[]) {
    if (
      value.slice(start - m.length, start) === m &&
      value.slice(end, end + m.length) === m &&
      value[start - m.length - 1] !== '*' &&
      value[end + m.length] !== '*'
    ) {
      return m
    }
  }
  return null
}

/** Splits one line into [bullet-or-indent, content, trailing whitespace]. */
function splitLine(line: string): [string, string, string] {
  const bullet = line.match(BULLET)
  const prefix = bullet ? bullet[0] : line.slice(0, line.length - line.trimStart().length)
  const rest = line.slice(prefix.length)
  const core = rest.trimEnd()
  return [prefix, core, rest.slice(core.length)]
}

export function applyMarker(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  marker: Marker
): FormatResult {
  // Rule 1: never wrap leading/trailing whitespace, line breaks included.
  let start = selectionStart
  let end = selectionEnd
  while (start < end && /\s/.test(value[start])) start++
  while (end > start && /\s/.test(value[end - 1])) end--

  // Nothing (or only whitespace) selected: drop an empty pair at the caret and
  // put the caret between them, like a word processor.
  if (start === end) {
    const at = selectionStart
    return {
      value: `${value.slice(0, at)}${marker}${marker}${value.slice(at)}`,
      selectionStart: at + marker.length,
      selectionEnd: at + marker.length,
    }
  }

  const selected = value.slice(start, end)

  // Rule 3: plain text directly inside an existing pair.
  if (!selected.includes('\n') && !selected.includes('*')) {
    const around = markerAround(value, start, end)
    if (around) {
      const before = value.slice(0, start - around.length)
      const after = value.slice(end + around.length)
      const wrapped = around === marker ? selected : `${marker}${selected}${marker}`
      const offset = around === marker ? 0 : marker.length
      return {
        value: `${before}${wrapped}${after}`,
        selectionStart: before.length + offset,
        selectionEnd: before.length + offset + selected.length,
      }
    }
  }

  // Rule 2 + 4: line by line. If every non-blank line already has exactly this
  // style, the click removes it; otherwise every line gets it (replacing any
  // other style inside, since styles don't nest).
  const lines = selected.split('\n').map(splitLine)
  const filled = lines.filter(([, core]) => core !== '')
  const removing = filled.length > 0 && filled.every(([, core]) => styleOf(core) === marker)

  const rewritten = lines
    .map(([prefix, core, suffix]) => {
      if (core === '') return prefix + suffix
      const plain = stripMarkers(core)
      return prefix + (removing ? plain : `${marker}${plain}${marker}`) + suffix
    })
    .join('\n')

  return {
    value: `${value.slice(0, start)}${rewritten}${value.slice(end)}`,
    selectionStart: start,
    selectionEnd: start + rewritten.length,
  }
}
