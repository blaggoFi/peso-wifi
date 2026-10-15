import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney, formatShortDate } from '../lib/format'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { date, revenue } = payload[0].payload
  return (
    <div className="chart-tooltip">
      <p>{formatShortDate(date)}</p>
      <strong>{formatMoney(revenue)}</strong>
    </div>
  )
}

export default function RevenueChart({ data }) {
  return (
    <div className="revenue-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="rev-stop-top" />
              <stop offset="100%" className="rev-stop-bottom" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickMargin={8}
          />
          <YAxis
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="revenue" strokeWidth={2.5} fill="url(#revFill)" stroke="#1F5F7A" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
