'use client'

import StatusPieChart from './status-pie-chart'

interface DeclineReasonsChartProps {
  data: { reason: string; count: number }[]
}

/**
 * Top reasons bookings were declined. The same pie as the donor/recipient
 * status charts, fed reasons in place of statuses -- StatusPieChart only
 * needs a label and a count per slice, and picks a distinct colour for any
 * label that isn't one of the booking statuses.
 */
export default function DeclineReasonsChart({ data }: DeclineReasonsChartProps) {
  return (
    <StatusPieChart
      title="Top Reasons for Decline"
      data={data.map((entry) => ({ status: entry.reason, count: entry.count }))}
      unitLabel="declined bookings"
      sliceNoun="reason"
      sliceNounPlural="reasons"
      emptyMessage="No declined bookings yet"
    />
  )
}
