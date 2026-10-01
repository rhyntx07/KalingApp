// lib/statistics-pdf.ts
//
// Builds the downloadable PDF of the Statistics page.
//
// Drawn directly with jsPDF from the same DashboardStats payload the page
// itself renders, rather than photographing the page: a screenshot would
// inherit whatever width the browser window happened to be, split a chart
// across a page break, and store text as pixels. Drawing it means the
// report has one fixed A4 layout no matter who generates it or on what
// screen, and its text stays real, selectable text.
//
// Only imported on demand (see handleGeneratePdf in
// app/admin/statistics/page.tsx), so jsPDF is not part of the bundle an
// admin downloads just to look at the page.

import { jsPDF } from 'jspdf'
import { statusColor } from '@/components/admin/chart-theme'
import type { DashboardStats } from '@/lib/types'

// Everything below is millimetres on A4 portrait.
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 15
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
// Kept clear at the bottom of every page for the footer line.
const FOOTER_HEIGHT = 9
const SECTION_GAP = 7

// Same colours as the app (app/globals.css). Text is always INK or MUTED,
// never a series colour -- pink on white is too faint to read as text.
const INK = '#333333'
const MUTED = '#666666'
const PRIMARY = '#F56C98'
const RULE = '#E6E1DD'
const TRACK = '#F4F1EF'

const REPORT_TITLE = 'System Statistics & Reports'

function rgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

/**
 * jsPDF's built-in fonts only cover Latin-1. Date formatting is the one
 * place something else gets in on its own: modern browsers put a narrow
 * no-break space (U+202F) before "AM"/"PM", which comes out as a stray
 * symbol in the PDF.
 */
function plainSpaces(text: string): string {
  return text.replace(/[\u00a0\u202f]/g, ' ')
}

/** Rounds an axis up to a whole-number maximum with at most ~5 gridlines. */
function integerAxis(dataMax: number): { max: number; step: number } {
  if (dataMax <= 4) return { max: Math.max(1, dataMax), step: 1 }
  const rough = dataMax / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude
  return { max: Math.ceil(dataMax / step) * step, step }
}

export function buildStatisticsPdf(stats: DashboardStats, generatedAt: Date = new Date()): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  doc.setProperties({ title: `KalingApp - ${REPORT_TITLE}`, creator: 'KalingApp Admin' })

  let y = MARGIN

  const text = (
    value: string,
    x: number,
    baseline: number,
    options: { size: number; color?: string; bold?: boolean; align?: 'left' | 'center' | 'right' }
  ) => {
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal')
    doc.setFontSize(options.size)
    doc.setTextColor(...rgb(options.color ?? INK))
    doc.text(value, x, baseline, { align: options.align ?? 'left' })
  }

  /** Shortens a label with "..." so it can never run into the column beside it. */
  const fit = (value: string, maxWidth: number, size: number, bold = false): string => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    if (doc.getTextWidth(value) <= maxWidth) return value
    let shortened = value
    while (shortened.length > 1 && doc.getTextWidth(`${shortened}...`) > maxWidth) {
      shortened = shortened.slice(0, -1)
    }
    return `${shortened.trimEnd()}...`
  }

  /** Starts a new page when the next block would not fit whole on this one. */
  const ensureSpace = (height: number) => {
    if (y + height > PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT) {
      doc.addPage()
      y = MARGIN
    }
  }

  /** A horizontal bar on a faint track: square at the baseline, rounded at the data end. */
  const bar = (x: number, top: number, trackWidth: number, height: number, fraction: number, color: string) => {
    doc.setFillColor(...rgb(TRACK))
    doc.roundedRect(x, top, trackWidth, height, height / 2, height / 2, 'F')
    const width = trackWidth * Math.max(0, Math.min(1, fraction))
    if (width <= 0) return
    const radius = Math.min(height / 2, width / 2)
    doc.setFillColor(...rgb(color))
    doc.roundedRect(x, top, width, height, radius, radius, 'F')
    doc.rect(x, top, width - radius, height, 'F')
  }

  const sectionHeading = (title: string, subtitle: string, x: number, top: number, maxWidth: number) => {
    text(fit(title, maxWidth, 11, true), x, top + 4, { size: 11, bold: true })
    text(fit(subtitle, maxWidth, 8.5), x, top + 8.6, { size: 8.5, color: MUTED })
  }
  const HEADING_HEIGHT = 12

  // --- Header -----------------------------------------------------------
  text('KALINGAPP ADMIN', MARGIN, y + 3, { size: 8.5, color: MUTED, bold: true })
  text(REPORT_TITLE, MARGIN, y + 11.5, { size: 19, bold: true })
  text(
    `Generated ${plainSpaces(generatedAt.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }))}`,
    MARGIN,
    y + 17.5,
    { size: 9, color: MUTED }
  )
  doc.setDrawColor(...rgb(PRIMARY))
  doc.setLineWidth(0.7)
  doc.line(MARGIN, y + 21.5, MARGIN + CONTENT_WIDTH, y + 21.5)
  y += 21.5 + SECTION_GAP

  // --- Key metrics ------------------------------------------------------
  const metrics: [string, number][] = [
    ['Total Bookings', stats.total_bookings],
    ['Donors', stats.total_donors],
    ['Recipients', stats.total_recipients],
    ['Active Facilities', stats.active_facilities],
  ]
  const tileGap = 4
  const tileWidth = (CONTENT_WIDTH - tileGap * (metrics.length - 1)) / metrics.length
  const tileHeight = 18
  metrics.forEach(([label, value], index) => {
    const x = MARGIN + index * (tileWidth + tileGap)
    doc.setDrawColor(...rgb(RULE))
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, tileWidth, tileHeight, 2.5, 2.5, 'S')
    text(label, x + 4, y + 6, { size: 8.5, color: MUTED })
    text(fit(formatCount(value), tileWidth - 8, 17, true), x + 4, y + 14, { size: 17, bold: true })
  })
  y += tileHeight + SECTION_GAP

  // --- Booking activity trend (line chart + the same numbers as a row) ---
  const trend = stats.booking_trend
  const plotHeight = 38
  ensureSpace(HEADING_HEIGHT + plotHeight + 20)
  sectionHeading(
    'Booking Activity Trend',
    `Milk bank bookings submitted per month, last ${trend.length} months`,
    MARGIN,
    y,
    CONTENT_WIDTH
  )
  y += HEADING_HEIGHT

  if (trend.length > 0) {
    // The left gutter holds the axis numbers and the two row labels.
    const gutter = 17
    const plotLeft = MARGIN + gutter
    const plotWidth = CONTENT_WIDTH - gutter
    const plotTop = y + 2
    const plotBottom = plotTop + plotHeight
    const axis = integerAxis(Math.max(...trend.map((m) => m.count)))
    const yFor = (count: number) => plotBottom - (count / axis.max) * plotHeight
    const slot = plotWidth / trend.length
    const xFor = (index: number) => plotLeft + slot * (index + 0.5)

    doc.setLineWidth(0.2)
    for (let tick = 0; tick <= axis.max; tick += axis.step) {
      doc.setDrawColor(...rgb(tick === 0 ? MUTED : RULE))
      doc.line(plotLeft, yFor(tick), plotLeft + plotWidth, yFor(tick))
      text(formatCount(tick), plotLeft - 2.5, yFor(tick) + 0.9, { size: 7.5, color: MUTED, align: 'right' })
    }

    doc.setDrawColor(...rgb(PRIMARY))
    doc.setLineWidth(0.6)
    for (let i = 1; i < trend.length; i += 1) {
      doc.line(xFor(i - 1), yFor(trend[i - 1].count), xFor(i), yFor(trend[i].count))
    }
    trend.forEach((month, index) => {
      // White ring first, so a marker stays distinct where the line passes through it.
      doc.setFillColor(255, 255, 255)
      doc.circle(xFor(index), yFor(month.count), 1.5, 'F')
      doc.setFillColor(...rgb(PRIMARY))
      doc.circle(xFor(index), yFor(month.count), 1, 'F')
    })

    // A printed report has no tooltip, so each month's exact count sits
    // directly beneath its point instead.
    const monthBaseline = plotBottom + 5
    const countBaseline = plotBottom + 10.5
    text('Month', MARGIN, monthBaseline, { size: 7.5, color: MUTED, bold: true })
    text('Bookings', MARGIN, countBaseline, { size: 7.5, color: MUTED, bold: true })
    trend.forEach((month, index) => {
      text(month.month, xFor(index), monthBaseline, { size: 7.5, color: MUTED, align: 'center' })
      text(fit(formatCount(month.count), slot - 1, 8.5, true), xFor(index), countBaseline, {
        size: 8.5,
        bold: true,
        align: 'center',
      })
    })

    const total = trend.reduce((sum, month) => sum + month.count, 0)
    text(`${formatCount(total)} booking${total === 1 ? '' : 's'} in this period`, MARGIN, plotBottom + 16, {
      size: 8.5,
      color: MUTED,
    })
    y = plotBottom + 16
  } else {
    text('No bookings yet', MARGIN, y + 4, { size: 9, color: MUTED })
    y += 4
  }
  y += SECTION_GAP

  // --- Knowledge base articles by category -------------------------------
  const categories = stats.articles_by_category
  const categoryRow = 7
  ensureSpace(HEADING_HEIGHT + Math.max(1, categories.length) * categoryRow + 8)
  sectionHeading(
    'Knowledge Base Articles by Category',
    'Published articles in each knowledge base category',
    MARGIN,
    y,
    CONTENT_WIDTH
  )
  y += HEADING_HEIGHT

  if (categories.length > 0) {
    const labelWidth = 56
    const countWidth = 14
    const trackWidth = CONTENT_WIDTH - labelWidth - countWidth
    const maxCount = Math.max(1, ...categories.map((c) => c.count))
    categories.forEach((category) => {
      // Past the first page's worth of categories, carry on overleaf
      // rather than drawing off the bottom edge.
      ensureSpace(categoryRow + 8)
      text(fit(category.category, labelWidth - 4, 8.5), MARGIN, y + 4.6, { size: 8.5 })
      bar(MARGIN + labelWidth, y + 2, trackWidth, 3.2, category.count / maxCount, PRIMARY)
      text(formatCount(category.count), MARGIN + CONTENT_WIDTH, y + 4.6, { size: 8.5, bold: true, align: 'right' })
      y += categoryRow
    })
    const total = categories.reduce((sum, category) => sum + category.count, 0)
    text(
      `${formatCount(total)} article${total === 1 ? '' : 's'} across ${categories.length} categor${
        categories.length === 1 ? 'y' : 'ies'
      }`,
      MARGIN,
      y + 5,
      { size: 8.5, color: MUTED }
    )
    y += 5
  } else {
    text('No articles yet', MARGIN, y + 4, { size: 9, color: MUTED })
    y += 4
  }
  y += SECTION_GAP

  // --- Donor / recipient status, side by side ----------------------------
  const columnGap = 10
  const columnWidth = (CONTENT_WIDTH - columnGap) / 2
  const statusRow = 8
  const statusColumns = [
    {
      title: 'Donor Status Summary',
      unit: 'donor booking',
      data: stats.donor_status_summary,
      empty: 'No donor bookings yet',
      totalLine: `Total donors: ${formatCount(stats.total_donors)}`,
    },
    {
      title: 'Recipient Status Summary',
      unit: 'recipient booking',
      data: stats.recipient_status_summary,
      empty: 'No recipient bookings yet',
      totalLine: `Total recipients: ${formatCount(stats.total_recipients)}`,
    },
  ]
  const tallest = Math.max(1, ...statusColumns.map((column) => column.data.length))
  // Both columns share one starting line, so the pair moves to the next
  // page together instead of one column being orphaned from the other.
  ensureSpace(HEADING_HEIGHT + tallest * statusRow + 8)
  const statusTop = y

  statusColumns.forEach((column, columnIndex) => {
    const x = MARGIN + columnIndex * (columnWidth + columnGap)
    const total = column.data.reduce((sum, entry) => sum + entry.count, 0)
    sectionHeading(
      column.title,
      `${formatCount(total)} ${column.unit}${total === 1 ? '' : 's'} across ${column.data.length} status${
        column.data.length === 1 ? '' : 'es'
      }`,
      x,
      statusTop,
      columnWidth
    )
    let rowTop = statusTop + HEADING_HEIGHT

    if (total > 0) {
      column.data.forEach((entry, index) => {
        // A status with bookings never reads "0%" just because it rounds down.
        const percent = Math.round((entry.count / total) * 100)
        const share = `${formatCount(entry.count)} (${percent === 0 ? '<1' : percent}%)`
        // The status is named in words on every row; the colour only
        // echoes the on-screen pie chart, so the report still reads in a
        // black-and-white printout.
        text(fit(entry.status, columnWidth - 26, 8.5), x, rowTop + 3.2, { size: 8.5 })
        text(share, x + columnWidth, rowTop + 3.2, { size: 8.5, bold: true, align: 'right' })
        bar(x, rowTop + 4.6, columnWidth, 2.4, entry.count / total, statusColor(entry.status, index))
        rowTop += statusRow
      })
    } else {
      text(column.empty, x, rowTop + 3.2, { size: 9, color: MUTED })
      rowTop += statusRow
    }

    doc.setDrawColor(...rgb(RULE))
    doc.setLineWidth(0.2)
    doc.line(x, rowTop + 1, x + columnWidth, rowTop + 1)
    text(column.totalLine, x, rowTop + 6, { size: 8.5, color: MUTED })
    y = Math.max(y, rowTop + 6)
  })

  // --- Footer on every page ----------------------------------------------
  // Last, because "Page 1 of N" needs N.
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    const footerLine = PAGE_HEIGHT - MARGIN - 5
    doc.setDrawColor(...rgb(RULE))
    doc.setLineWidth(0.2)
    doc.line(MARGIN, footerLine, MARGIN + CONTENT_WIDTH, footerLine)
    text(`KalingApp Admin - ${REPORT_TITLE}`, MARGIN, footerLine + 4.5, { size: 7.5, color: MUTED })
    text(`Page ${page} of ${pageCount}`, MARGIN + CONTENT_WIDTH, footerLine + 4.5, {
      size: 7.5,
      color: MUTED,
      align: 'right',
    })
  }

  return doc
}

/** Builds the report and hands it to the browser as a file download. */
export function downloadStatisticsPdf(stats: DashboardStats): void {
  const generatedAt = new Date()
  // Local date, not toISOString(): that converts to UTC first, so before
  // 8 AM in Manila the file would be stamped with yesterday's date.
  const stamp = [
    generatedAt.getFullYear(),
    `${generatedAt.getMonth() + 1}`.padStart(2, '0'),
    `${generatedAt.getDate()}`.padStart(2, '0'),
  ].join('-')
  buildStatisticsPdf(stats, generatedAt).save(`kalingapp-statistics-${stamp}.pdf`)
}
