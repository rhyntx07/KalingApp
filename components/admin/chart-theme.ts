// Shared look-and-feel for every recharts chart in the admin app, so the
// Dashboard and Statistics pages read as one system instead of four
// charts that each invented their own palette and tooltip.

export const CHART_GRID = '#F1EEEC'
export const CHART_AXIS = '#666666'

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: `1px solid ${CHART_GRID}`,
  borderRadius: '12px',
} as const

export const CHART_TOOLTIP_LABEL_STYLE = { color: '#333333' } as const

/**
 * Colour per booking status, keyed by the human-readable label the
 * backend sends (MilkBankRequest.Status.choices).
 *
 * Keyed by status rather than by slice position on purpose: the donor and
 * recipient pies sit side by side, and when each one just walked its own
 * colour array, "Pending" came out gold in one chart and pink in the
 * other because the two had different numbers of slices. Same status,
 * same colour, both charts.
 */
export const STATUS_COLORS: Record<string, string> = {
  Pending: '#D4A437',
  'Awaiting Attendance': '#E39A5C',
  Scheduled: '#7C9CBF',
  'Counter Offer': '#B07CC6',
  Completed: '#5FA98A',
  Declined: '#F56C98',
  Expired: '#9A9A9A',
}

// Fallback for a status the map doesn't know yet (a new choice added
// backend-side): distinct colours rather than everything defaulting to
// one grey blob.
const FALLBACK_COLORS = ['#F56C98', '#D4A437', '#7C9CBF', '#5FA98A', '#B07CC6', '#E39A5C', '#9A9A9A']

export function statusColor(status: string, index: number): string {
  return STATUS_COLORS[status] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

/** Counts are whole bookings/articles -- never label an axis "2.5". */
export const INTEGER_AXIS = { allowDecimals: false } as const
