'use client'

import StatusPieChart, { StatusDatum } from './status-pie-chart'

interface RecipientChartProps {
  data: StatusDatum[]
}

export default function RecipientChart({ data }: RecipientChartProps) {
  return (
    <StatusPieChart
      title="Recipient Status Distribution"
      data={data}
      unitLabel="recipient bookings"
      emptyMessage="No recipient bookings yet"
    />
  )
}
