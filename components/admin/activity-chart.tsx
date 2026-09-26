'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_TOOLTIP_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  INTEGER_AXIS,
} from './chart-theme'

interface ActivityData {
  month: string
  count: number
}

interface ActivityChartProps {
  data: ActivityData[]
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0)

  return (
    <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Booking Activity Trend</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Milk bank bookings submitted per month, last 12 months
        </p>
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis
              dataKey="month"
              stroke={CHART_AXIS}
              style={{ fontSize: '12px' }}
              /* interval={0} so all twelve months keep their tick --
                 recharts silently drops crowded labels otherwise. */
              interval={0}
              label={{ value: 'Month', position: 'insideBottom', offset: -16, fill: CHART_AXIS, fontSize: 12 }}
            />
            <YAxis
              stroke={CHART_AXIS}
              style={{ fontSize: '12px' }}
              {...INTEGER_AXIS}
              label={{ value: 'Bookings', angle: -90, position: 'insideLeft', fill: CHART_AXIS, fontSize: 12 }}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              formatter={(value) => [(Number(value) || 0).toLocaleString(), 'Bookings']}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="count"
              /* Named so the tooltip and legend say "Bookings" rather
                 than echoing the raw field name "count". */
              name="Bookings"
              stroke="#F56C98"
              strokeWidth={2}
              dot={{ fill: '#F56C98', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
          No bookings yet
        </div>
      )}
      {data.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
          {total.toLocaleString()} booking{total === 1 ? '' : 's'} in this period
        </p>
      )}
    </div>
  )
}
