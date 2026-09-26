'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_TOOLTIP_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  INTEGER_AXIS,
} from './chart-theme'

interface EngagementData {
  category: string
  count: number
}

interface EngagementChartProps {
  data: EngagementData[]
}

export default function EngagementChart({ data }: EngagementChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0)

  return (
    <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Knowledge Base Articles by Category</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Published articles in each knowledge base category
        </p>
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={340}>
          {/* Horizontal bars: the category names ("Milk Storage & Safety")
              are far too long to sit under a vertical bar, and the old
              -45 degree rotation cut them off against the card edge. */}
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
            <XAxis
              type="number"
              stroke={CHART_AXIS}
              style={{ fontSize: '12px' }}
              {...INTEGER_AXIS}
              label={{ value: 'Articles', position: 'insideBottom', offset: -16, fill: CHART_AXIS, fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="category"
              stroke={CHART_AXIS}
              style={{ fontSize: '12px' }}
              /* interval={0} keeps every category labelled; width holds
                 the longest name without truncating it to an ellipsis. */
              interval={0}
              width={150}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              cursor={{ fill: 'rgba(245, 108, 152, 0.08)' }}
              formatter={(value) => [(Number(value) || 0).toLocaleString(), 'Articles']}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="count" name="Articles" fill="#F56C98" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[340px] flex items-center justify-center text-sm text-muted-foreground">
          No articles yet
        </div>
      )}
      {data.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
          {total.toLocaleString()} article{total === 1 ? '' : 's'} across {data.length} categor
          {data.length === 1 ? 'y' : 'ies'}
        </p>
      )}
    </div>
  )
}
