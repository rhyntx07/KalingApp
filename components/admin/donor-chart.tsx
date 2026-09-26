'use client'

import StatusPieChart, { StatusDatum } from './status-pie-chart'

interface DonorChartProps {
  data: StatusDatum[]
}

export default function DonorChart({ data }: DonorChartProps) {
  return (
    <StatusPieChart
      title="Donor Status Distribution"
      data={data}
      unitLabel="donor bookings"
      emptyMessage="No donor bookings yet"
    />
  )
}
