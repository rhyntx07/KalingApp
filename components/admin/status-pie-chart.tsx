'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import {
  CHART_TOOLTIP_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  statusColor,
} from './chart-theme'

export interface StatusDatum {
  status: string
  count: number
}

interface StatusPieChartProps {
  title: string
  data: StatusDatum[]
  /** What one unit is, for the tooltip -- e.g. "donor bookings". */
  unitLabel: string
  emptyMessage: string
  /** What each slice is, for the "across N ..." line. Defaults to status/statuses. */
  sliceNoun?: string
  sliceNounPlural?: string
}

const RADIAN = Math.PI / 180

/**
 * Percentages sit inside the slice; the status name lives in the legend.
 *
 * Recharts' default label draws the text outside the pie, which clipped
 * against the card edge as soon as a status was as long as
 * "Awaiting Attendance".
 */
/**
 * Recharts types every geometry field as loosely as it passes them --
 * optional, and sometimes the "50%" string form we handed to the Pie.
 * Coerce here rather than doing arithmetic on undefined and emitting a
 * NaN transform, which drops the label with no error.
 */
function toNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function renderSliceLabel(props: PieLabelRenderProps) {
  const cx = toNumber(props.cx)
  const cy = toNumber(props.cy)
  const midAngle = toNumber(props.midAngle)
  const outerRadius = toNumber(props.outerRadius)
  const percent = toNumber(props.percent)
  // Solid pie, so an absent innerRadius genuinely means 0.
  const innerRadius = toNumber(props.innerRadius) ?? 0

  if (cx === null || cy === null || midAngle === null || outerRadius === null || percent === null) {
    return null
  }
  // Below ~6% the slice is too thin to hold text without overlapping its
  // neighbour's label; the legend and tooltip still cover those.
  if (percent < 0.06) return null

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: '12px', fontWeight: 600 }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

export default function StatusPieChart({
  title,
  data,
  unitLabel,
  emptyMessage,
  sliceNoun = 'status',
  sliceNounPlural = 'statuses',
}: StatusPieChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0)

  return (
    <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {total.toLocaleString()} {unitLabel} across {data.length}{' '}
          {data.length === 1 ? sliceNoun : sliceNounPlural}
        </p>
      </div>
      {total > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              /* Without nameKey, recharts looks for a "name" field that
                 this payload does not have, and every label, legend entry
                 and tooltip row rendered the word "undefined". */
              nameKey="status"
              dataKey="count"
              labelLine={false}
              label={renderSliceLabel}
              innerRadius={0}
              outerRadius={95}
            >
              {data.map((entry, index) => (
                <Cell key={entry.status} fill={statusColor(entry.status, index)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              formatter={(value, name) => {
                const count = Number(value) || 0
                return [`${count.toLocaleString()} (${Math.round((count / total) * 100)}%)`, String(name)]
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
              formatter={(value) => {
                const entry = data.find((item) => item.status === value)
                return entry ? `${entry.status} (${entry.count})` : String(value)
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
