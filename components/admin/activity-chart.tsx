'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ActivityData {
  month: string
  count: number
}

interface ActivityChartProps {
  data: ActivityData[]
}

export default function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h3 className="font-semibold text-foreground mb-6">Booking Activity Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1EEEC" />
          <XAxis
            dataKey="month"
            stroke="#666666"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#666666" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #F1EEEC',
              borderRadius: '12px',
            }}
            labelStyle={{ color: '#333333' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#F56C98"
            strokeWidth={2}
            dot={{ fill: '#F56C98', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
