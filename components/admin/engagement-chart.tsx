'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface EngagementData {
  category: string
  count: number
}

interface EngagementChartProps {
  data: EngagementData[]
}

export default function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h3 className="font-semibold text-foreground mb-6">User Engagement by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1EEEC" />
          <XAxis
            dataKey="category"
            stroke="#666666"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={100}
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
          <Bar
            dataKey="count"
            fill="#F56C98"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
