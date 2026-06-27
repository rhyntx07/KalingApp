'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface RecipientData {
  status: string
  count: number
}

interface RecipientChartProps {
  data: RecipientData[]
}

const COLORS = ['#D4A437', '#FD8CAE', '#F56C98']

export default function RecipientChart({ data }: RecipientChartProps) {
  return (
    <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h3 className="font-semibold text-foreground mb-6">Recipient Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#F56C98"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #F1EEEC',
              borderRadius: '12px',
            }}
            labelStyle={{ color: '#333333' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
